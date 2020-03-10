import { Controller, Post, Body, ValidationPipe, UseGuards, Get, Param, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingList } from './shopping-list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateListItemDto } from './shopping-list-item/create-list-item.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { GetListFilterDto } from './dto/get-list-filter.dto';

@UseGuards(AuthGuard())
@Controller('shopping-lists')
export class ShoppingListsController {
    constructor(
        private shoppingListsService: ShoppingListsService
    ) { }

    @Get('/')
    async getLists(
        @Body(ValidationPipe) getListFilterDto: GetListFilterDto,
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
        return this.shoppingListsService.createList(createListDto, user);
    }

    @Post('/:listId/items')
    async createListItem(
        @Body(ValidationPipe) createListItemDto: CreateListItemDto,
        @Param('listId', ParseIntPipe) listId: number,
        @GetUser() user: User
    ) {
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


    @Delete('/:listId/items/:itemId')
    async removeListItem(
        @Param('listId', ParseIntPipe) listId: number,
        @Param('itemId', ParseIntPipe) itemId: number,
        @GetUser() user: User
    ) {
        return this.shoppingListsService.removeListItem(itemId, listId, user);
    }
}
