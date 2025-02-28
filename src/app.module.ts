import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { HouseModule } from './house/house.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ShoppingListsModule } from './shopping-lists/shopping-lists.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, HouseModule, UsersModule, TasksModule, ExpensesModule, ShoppingListsModule, ChatModule],

})
export class AppModule { }
