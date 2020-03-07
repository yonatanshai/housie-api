import { Controller, UseGuards, Logger, Get, Post, Body, ValidationPipe, Param, ParseIntPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Expense } from './expense.entity';

@Controller('expenses')
@UseGuards(AuthGuard())
export class ExpensesController {
    private logger = new Logger('ExpensesController')
    constructor(
        private expenseService: ExpensesService
    ) {}

    @Get('/')
    async getHouseExpenses(
        @Body('houseId', ParseIntPipe) houseId: number,
        @GetUser() user: User
    ) {
        return this.expenseService.getHouseExpenses(houseId, user);
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
}
