import { EntityRepository, Repository } from "typeorm";
import { ShoppingList } from "./shopping-list.entity";
import { Logger, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateListDto } from "./dto/create-list.dto";
import { User } from "src/auth/user.entity";
import { GetListFilterDto } from "./dto/get-list-filter.dto";

@EntityRepository(ShoppingList)
export class ShoppingListRepository extends Repository<ShoppingList> {
    private logger = new Logger('ShoppingListRepository')

    async createList(createListDto: CreateListDto, user: User): Promise<ShoppingList> {
        const { name, houseId } = createListDto;

        this.logger.verbose(`createList: called by user ${user.id} with dto ${JSON.stringify(createListDto, null, 4)}`);

        const list = this.create();

        list.houseId = houseId;
        list.items = [];
        list.name = name;
        list.creatorId = user.id;

        try {
            await list.save();
        } catch (error) {
            this.logger.error(`createList: error saving list to db`, error.stack)
            throw new InternalServerErrorException();
        }

        this.logger.log(`createList: list created with id ${list.id}`);

        return list;
    }

    async getList(getListFilterDto: GetListFilterDto): Promise<ShoppingList[]> {
        const { isActive, houseId } = getListFilterDto;

        let lists: ShoppingList[];
        try {
            lists = await this.find({
                houseId,
                isActive,
            });    
        } catch (error) {
            throw new InternalServerErrorException();
        }

        if (!lists) {
            throw new NotFoundException();
        }

        return lists;
    }
}