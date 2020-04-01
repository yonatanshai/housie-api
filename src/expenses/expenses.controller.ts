import { Controller, UseGuards, Logger, Get, Post, Body, ValidationPipe, Param, ParseIntPipe, Patch, Delete, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Expense } from './expense.entity';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';

@Controller('expenses')
@UseGuards(AuthGuard())
export class ExpensesController {
    private logger = new Logger('ExpensesController')
    constructor(
        private expenseService: ExpensesService
    ) {}

    @Get('/')
    async getExpenses(
        @Query(ValidationPipe) expenseFilterDto: ExpenseFilterDto,
        @GetUser() user: User
    ) {
        return this.expenseService.getExpenses(expenseFilterDto, user);
    }
    

    @Get('/:id')
    async getExpenseById(
        @Param('id') id: number,
        @GetUser() user: User
    ) {
        return this.expenseService.getExpenseById(id, user);
    }

    @Post()
    async createExpense(
        @Body(ValidationPipe) createExpenseDto: CreateExpenseDto,
        @GetUser() user: User
    ): Promise<Expense> {
        return this.expenseService.createExpense(createExpenseDto, user);
    }

    @Patch('/:id')
    async updateExpense(
        @Param('id') id: number,
        @Body(ValidationPipe) updateExpenseDto: UpdateExpenseDto,
        @GetUser() user: User
    ) {
        return this.expenseService.updateExpense(id, updateExpenseDto, user);
    }

    @Delete('/:id')
    async deleteExpense(
        @Param('id') id: number,
        @GetUser() user: User
    ): Promise<void> {
        return this.expenseService.deleteExpense(id, user);
    } 

}
