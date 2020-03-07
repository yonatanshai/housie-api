import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseRepository } from './expense.repository';
import { HouseService } from 'src/house/house.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { User } from 'src/auth/user.entity';
import { Expense } from './expense.entity';

@Injectable()
export class ExpensesService {
    private logger = new Logger('ExpensesService');
    constructor(
        @InjectRepository(ExpenseRepository)
        private expenseRepository: ExpenseRepository,
        private houseService: HouseService
    ) {}

    async createExpense(createExpenseDto: CreateExpenseDto, user: User): Promise<Expense> {
        const house = await this.houseService.getHouseById(createExpenseDto.houseId, user);

        const isAdmin = await this.houseService.isAdmin(house, user);

        if (!isAdmin) {
            throw new UnauthorizedException('Only admins can add expenses');
        }

        return this.expenseRepository.createExpense(createExpenseDto, house, user);
    }

    async getHouseExpenses(houseId: number, user: User): Promise<Expense[]> {
        const house = await this.houseService.getHouseById(houseId, user);

        return this.expenseRepository.getHouseExpenses(house, user);
    }

    async getExpenseById(expenseId: number, user: User): Promise<Expense> {
        const expense = await this.expenseRepository.getExpenseById(expenseId, ['house']);

        const isMember = await this.houseService.isMember(expense.house, user);

        if (!isMember) {
            throw new NotFoundException();
        }

        return expense;
    }
}
