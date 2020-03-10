import { Injectable, UnauthorizedException, NotImplementedException, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingListRepository } from './shopping-list.repository';
import { ShoppingListItemRepository } from './shopping-list-item/shopping-list-item.repository';
import { CreateListDto } from './dto/create-list.dto';
import { User } from 'src/auth/user.entity';
import { ShoppingList } from './shopping-list.entity';
import { HouseService } from 'src/house/house.service';
import { CreateListItemDto } from './shopping-list-item/create-list-item.dto';
import { ShoppingListItem } from './shopping-list-item/shopping-list-item.entity';
import { UpdateListDto } from './dto/update-list.dto';
import { ExpensesService } from 'src/expenses/expenses.service';
import { GetListFilterDto } from './dto/get-list-filter.dto';
import { UpdateShoppingListItemDto } from './shopping-list-item/update-list-item.dto'

@Injectable()
export class ShoppingListsService {
    private logger = new Logger('ShoppingListsService')
    constructor(
        @InjectRepository(ShoppingListRepository)
        private shoppingListRepository: ShoppingListRepository,

        @InjectRepository(ShoppingListItemRepository)
        private listItemRepository: ShoppingListItemRepository,

        private houseService: HouseService,
        private expensesService: ExpensesService
    ) { }

    async createList(createListDto: CreateListDto, user: User): Promise<ShoppingList> {
        if (!this.houseService.isAdmin(createListDto.houseId, user, { useId: true })) {
            throw new UnauthorizedException('Only admins can create shopping lists');
        }

        return this.shoppingListRepository.createList(createListDto, user);
    }

    async getLists(getListFilterDto: GetListFilterDto, user): Promise<ShoppingList[]> {
        if (!this.houseService.isMember(getListFilterDto.houseId, user, { useId: true })) {
            throw new NotFoundException();
        }

        return this.shoppingListRepository.getList(getListFilterDto);
    }

    async getListById(listId: number, user: User): Promise<ShoppingList> {
        this.logger.verbose(`getListById: called by user with id ${user.id} with list id ${listId}`);
        let list: ShoppingList;
        try {
            list = await this.shoppingListRepository.findOne(listId, { relations: ['house', 'items'] });
        } catch (error) {
            this.logger.error(`getListById: Error getting list with id ${listId} from the db`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!list) {
            this.logger.error(`getListById: List with id ${listId} not found`)
            throw new NotFoundException();
        }

        if (!await this.houseService.isMember(list.house, user)) {
            this.logger.error(`getListById: User with id ${user.id} is not a member of the house with id ${list.house.id}`);
            throw new NotFoundException();
        }


        return list;
    }

    async createListItem(createListItemDto: CreateListItemDto, listId: number, user: User): Promise<ShoppingList> {
        const list = await this.getListById(listId, user);

        const newItem = await this.listItemRepository.createItem(createListItemDto, list, user);
        list.items.push(newItem);

        try {
            await list.save();
        } catch (error) {
            this.logger.error(`createListItem: error updating list with id ${listId} in the db`, error.stack);
            throw new InternalServerErrorException();
        }

        return list;
    }

    async getListItemById(itemId: number, listId: number, user: User): Promise<ShoppingListItem> {
        this.logger.verbose(`getListItemById: called by user ${user.id} with itemId ${itemId} and listId ${listId}`);
        const list = await this.getListById(listId, user);

        console.log(list);

        const item = list.items.find(i => i.id === itemId);


        if (!item) {
            this.logger.error(`getListItemById: item with id ${itemId} not found`);
            throw new NotFoundException();
        }

        return item;
    }

    async updateListItem(updateShoppingListItemDto: UpdateShoppingListItemDto, itemId: number, listId: number, user: User): Promise<ShoppingListItem> {
        const { name } = updateShoppingListItemDto;
        const item = await this.getListItemById(itemId, listId, user);

        if (name) {
            item.name = name;
        }

        try {
            await item.save()
        } catch (error) {
            throw new InternalServerErrorException();
        }

        return item;
    }

    async updateList(listId: number, updateListDto: UpdateListDto, user: User) {
        const { isActive, name, updateExpenses, totalAmount } = updateListDto;
        const list = await this.getListById(listId, user);
        const originalName = list.name;

        if (!await this.houseService.isAdmin(list.house, user)) {
            throw new UnauthorizedException();
        }

        if (name) {
            list.name = name;
        }

        if (totalAmount) {
            list.totalAmount = totalAmount;
        }

        list.isActive = isActive;

        if (!isActive && updateExpenses) {
            await this.deactivateList(list, user, originalName);
        }



        try {
            await list.save()
        } catch (error) {
            throw new InternalServerErrorException();
        }

        return list;
    }

    private async deactivateList(list: ShoppingList, user: User, originalName: string) {
        this.logger.log(`deactivate list called with originalName ${originalName}`)
        if (list.totalAmount) {
            const expenses = await this.expensesService.getHouseExpenses(list.houseId, user);
            const expense = expenses.find(ex => ex.title === `Shopping List - ${originalName}`);

            if (!expense) {
                await this.expensesService.createExpense({
                    title: `Shopping List - ${list.name}`,
                    amount: list.totalAmount,
                    houseId: list.houseId,
                    description: 'Shopping List'
                }, user);
            } else {
                await this.expensesService.updateExpense(
                    expense.id,
                    {
                        amount: list.totalAmount,
                        houseId: list.houseId,
                        description: 'Shopping List'
                    },
                    user
                )
            }
        }
    }

    async removeListItem(itemId: number, listId: number, user: User): Promise<ShoppingList> {
        const list = await this.getListById(listId, user);
        const itemsNum = list.items.length;

        list.items = list.items.filter(i => i.id !== itemId);

        if (list.items.length === itemsNum) {
            throw new NotFoundException();
        }

        const result = await this.listItemRepository.delete(itemId);

        if (result.affected === 0) {
            throw new NotFoundException();
        }

        return list;
    }
}
