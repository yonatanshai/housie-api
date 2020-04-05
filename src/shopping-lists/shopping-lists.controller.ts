import { Controller, Post, Body, ValidationPipe, UseGuards, Get, Param, ParseIntPipe, Delete, Patch, Query, Logger } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingList } from './shopping-list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateListItemDto } from './shopping-list-item/create-list-item.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { GetListFilterDto } from './dto/get-list-filter.dto';
import { UpdateShoppingListItemDto } from './shopping-list-item/update-list-item.dto';
import { ShoppingListItem } from './shopping-list-item/shopping-list-item.entity';

@UseGuards(AuthGuard())
@Controller('shopping-lists')
export class ShoppingListsController {
    private logger = new Logger('ShoppingListsController');
    constructor(
        private shoppingListsService: ShoppingListsService
    ) { }

    @Get('/')
    async getLists(
        @Query(ValidationPipe) getListFilterDto: GetListFilterDto,
        @GetUser() user: User
    ): Promise<ShoppingList[]> {
        return this.shoppingListsService.getLists(getListFilterDto, user);
    }

    @Get('/:listId')
    async getListById(
        @Param('listId') listId: number,
        @GetUser() user: User
    ): Promise<ShoppingList> {
        return this.shoppingListsService.getListById(listId, user);
    }

    @Get('/:listId/items/:itemId')
    async getListItemById(
        @Param('listId', ParseIntPipe) listId: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @GetUser() user: User
    ) {
        return this.shoppingListsService.getListItemById(itemId, listId, user);
    }

    @Post()
    async createList(
        @Body(ValidationPipe) createListDto: CreateListDto,
        @GetUser() user: User
    ): Promise<ShoppingList> {
        this.logger.log(`createList: called with ${JSON.stringify(createListDto, null, 4)}`)
        return this.shoppingListsService.createList(createListDto, user);
    }

    @Post('/:listId/items')
    async createListItem(
        @Body(ValidationPipe) createListItemDto: CreateListItemDto,
        @Param('listId', ParseIntPipe) listId: number,
        @GetUser() user: User
    ): Promise<ShoppingList> {
        return this.shoppingListsService.createListItem(createListItemDto, listId, user);
    }

    @Patch('/:listId')
    async updateList(
        @Body(ValidationPipe) updateListDto: UpdateListDto,
        @Param('listId', ParseIntPipe) listId: number,
        @GetUser() user: User
    ): Promise<ShoppingList> {
        return this.shoppingListsService.updateList(listId, updateListDto, user);
    }

    @Patch('/:listId/items/:itemId')
    async updateListItem(
        @Body(ValidationPipe) updateShoppingListItemDto: UpdateShoppingListItemDto,
        @Param('listId', ParseIntPipe) listId: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @GetUser() user: User
    ): Promise<ShoppingListItem> {
        return this.shoppingListsService.updateListItem(updateShoppingListItemDto, itemId, listId, user);
    }

    @Delete('/:listId')
    async deleteList(
        @Param('listId', ParseIntPipe) listId: number,
        @GetUser() user: User
    ): Promise<void> {
        return this.shoppingListsService.deleteList(listId, user);
    }


    @Delete('/:listId/items/:itemId')
    async removeListItem(
        @Param('listId', ParseIntPipe) listId: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @GetUser() user: User
    ): Promise<ShoppingList> {
        return this.shoppingListsService.removeListItem(itemId, listId, user);
    }
}
