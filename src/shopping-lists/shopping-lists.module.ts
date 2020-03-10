import { Module } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListRepository } from './shopping-list.repository';
import { ShoppingListItemRepository } from './shopping-list-item/shopping-list-item.repository';
import { AuthModule } from 'src/auth/auth.module';
import { HouseModule } from 'src/house/house.module';
import { ExpensesModule } from 'src/expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingListRepository, ShoppingListItemRepository]),
    AuthModule,
    HouseModule,
    ExpensesModule
  ],
  providers: [ShoppingListsService],
  controllers: [ShoppingListsController]
})
export class ShoppingListsModule {}
