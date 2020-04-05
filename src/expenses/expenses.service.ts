import { Injectable, Logger, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseRepository } from './expense.repository';
import { HouseService } from 'src/house/house.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { User } from 'src/auth/user.entity';
import { Expense } from './expense.entity';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';

@Injectable()
export class ExpensesService {
    private logger = new Logger('ExpensesService');
    constructor(
        @InjectRepository(ExpenseRepository)
        private expenseRepository: ExpenseRepository,
        private houseService: HouseService
    ) { }

    async createExpense(createExpenseDto: CreateExpenseDto, user: User): Promise<Expense> {
        const house = await this.houseService.getHouseById(createExpenseDto.houseId, user);

        const isAdmin = await this.houseService.isAdmin(house, user);

        if (!isAdmin) {
            throw new UnauthorizedException('Only admins can add expenses');
        }

        return this.expenseRepository.createExpense(createExpenseDto, house, user);
    }

    async updateExpense(id: number, updateExpenseDto: UpdateExpenseDto, user: User): Promise<Expense> {
        const house = await this.houseService.getHouseById(updateExpenseDto.houseId, user);

        if (!this.houseService.isAdmin(house, user)) {
            throw new UnauthorizedException('Only admins can edit expenses');
        }

        return this.expenseRepository.updateExpense(id, updateExpenseDto, user);
    }
    async getExpenses(expenseFilterDto: ExpenseFilterDto, user: User): Promise<Expense[]> {
        const house = await this.houseService.getHouseById(expenseFilterDto.houseId, user);
        const isAdmin = await this.houseService.isAdmin(house, user);
        if (!isAdmin) {
            throw new UnauthorizedException('Only admins can view expenses');
        }

        return this.expenseRepository.getExpenses(expenseFilterDto, user);
    }

    async getHouseExpenses(houseId: number, user: User): Promise<Expense[]> {
        const house = await this.houseService.getHouseById(houseId, user);

        if (!this.houseService.isAdmin(house, user)) {
            throw new UnauthorizedException('Only admins can view expenses');
        }

        return this.expenseRepository.getHouseExpenses(house, user);
    }

    async getExpenseById(expenseId: number, user: User): Promise<Expense> {
        const expense = await this.expenseRepository.getExpenseById(expenseId, ['house']);

        const isAdmin = await this.houseService.isAdmin(expense.house, user);

        if (!isAdmin) {
            throw new NotFoundException();
        }

        return expense;
    }

    async deleteExpense(expenseId: number, user: User): Promise<void> {
        this.logger.verbose(`deleteExpense: called by user with id ${user.id} for expense with id ${expenseId}`);
        const expense = await this.getExpenseById(expenseId, user);

        let result;
        try {
            result = await this.expenseRepository.delete(expense.id);
        } catch (error) {
            this.logger.error(`deleteExpense: error deleting expense with id ${expenseId} from db`, error.stack);
            throw new InternalServerErrorException();
        }

        console.log(result);

        if (result.affected === 0) {
            this.logger.error(`deleteExpense: error deleting expense with id ${expenseId} from db, no rows affected`)
            throw new InternalServerErrorException('Delete failed');
        }
    }
}
