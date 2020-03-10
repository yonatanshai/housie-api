import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HouseService } from 'src/house/house.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseRepository } from './expense.repository';
import { HouseModule } from 'src/house/house.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseRepository]),
    AuthModule,
    HouseModule
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService]
})
export class ExpensesModule {}
