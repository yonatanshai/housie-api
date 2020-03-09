import { EntityRepository, Repository } from "typeorm";
import { ShoppingListItem } from "./shopping-list-item.entity";
import { CreateListItemDto } from "./create-list-item.dto";
import { ShoppingList } from "../shopping-list.entity";
import { User } from "src/auth/user.entity";
import { Logger, InternalServerErrorException } from "@nestjs/common";
import { ListItemStatus } from "./list-item-status.enum";

@EntityRepository(ShoppingListItem)
export class ShoppingListItemRepository extends Repository<ShoppingListItem> {
    private logger = new Logger('ShoppingListItemRepository')
    async createItem(createListItemDto: CreateListItemDto, shoppingList: ShoppingList, user: User) {
        const { name } = createListItemDto;

        const listItem = this.create();
        listItem.name = name;
        listItem.list = shoppingList;
        listItem.creatorId = user.id;
        listItem.status = ListItemStatus.Accepted;
        
        try {
            await listItem.save();
        } catch (error) {
            throw new InternalServerErrorException();
        }

        delete listItem.list;

        return listItem;
    }
}