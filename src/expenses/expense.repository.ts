import { EntityRepository, Repository } from "typeorm";
import { Expense } from "./expense.entity";
import { Logger, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { User } from "src/auth/user.entity";
import { House } from "src/house/house.entity";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ExpenseFilterDto } from "./dto/expense-filter.dto";

@EntityRepository(Expense)
export class ExpenseRepository extends Repository<Expense> {
    private logger = new Logger('ExpenseRepository');

    async createExpense(createExpenseDto: CreateExpenseDto, house: House, user: User): Promise<Expense> {
        const { title, description, amount } = createExpenseDto;

        this.logger.verbose(`createExpense: called by user ${user.id} with dto ${JSON.stringify(createExpenseDto, null, 4)} and house ${house.id}`);

        const expense = this.create();

        expense.title = title;
        expense.description = description;
        expense.amount = amount;
        expense.creator = user;
        expense.house = house;

        try {
            await expense.save();
        } catch (error) {
            this.logger.error(`createExpense: error saving expense to db`, error.stack);
            throw new InternalServerErrorException();
        }

        delete expense.house;
        delete expense.creator;

        this.logger.log(`createExpense: expense with id ${expense.id} created`);

        return expense;
    }

    async getExpenses(expenseFilterDto: ExpenseFilterDto, user: User): Promise<Expense[]> {
        const { houseId, fromDate, toDate, greaterThan, smallerThan } = expenseFilterDto
        this.logger.verbose(`getExpenses: called with filters ${JSON.stringify(expenseFilterDto, null, 4)}`)
        let query = this.createQueryBuilder('expense');

        query.where('expense."houseId" = :houseId', { houseId });

        query.andWhere('expense."createdAt" >= :fromDate', { fromDate });
        query.andWhere('expense."createdAt" <= :toDate', { toDate });
        
        if (greaterThan) {
            query.andWhere('expense.amount >= :greaterThan', {greaterThan})
        }

        if (smallerThan) {
            query.andWhere('expense.amount <= :smallerThan', {smallerThan})
        }

        const expenses = await query.getMany();

        if (!expenses) {
            throw new NotFoundException();
        }

        return expenses;
    }

    async getHouseExpenses(house: House, user: User, relations?: string[]): Promise<Expense[]> {
        let expenses: Expense[];

        try {
            expenses = await this.find({ relations, where: { houseId: house.id } });
        } catch (error) {
            this.logger.error('getHouseExpenses: error getting expenses from db', error.stack);
            throw new InternalServerErrorException();
        }

        // if (expenses.length === 0) {
        //     this.logger.error(`expenses for house ${house.id} not found`);
        //     throw new NotFoundException();
        // }

        return expenses;
    }

    async getExpenseById(expenseId: number, relations?: string[]): Promise<Expense> {
        let expense: Expense;

        try {
            expense = await this.findOne(expenseId, { relations });
        } catch (error) {
            throw new InternalServerErrorException();
        }

        if (!expense) {
            this.logger.error(`expense with id ${expenseId} not found`)
            throw new NotFoundException();
        }

        return expense;
    }

    async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto, user: User) {
        this.logger.verbose(`updateExpense: called by user with id ${user.id} with dto ${JSON.stringify(updateExpenseDto, null, 4)}`);
        const { amount, description } = updateExpenseDto;
        let expense = await this.getExpenseById(id);

        if (amount) {
            expense.amount = amount;
        }

        if (description) {
            expense.description = description
        }

        try {
            await expense.save();
        } catch (error) {
            this.logger.error(`updateExpense: error save expense with id ${id} to db`, error.stack);
            throw new InternalServerErrorException();
        }

        this.logger.log(`updateExpense: expense with id ${id} updated`);
        return expense;
    }
}