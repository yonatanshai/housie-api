import { EntityRepository, Repository, In } from "typeorm";
import { House } from "./house.entity";
import { CreateHouseDto } from "./create-house.dto";
import { User } from "src/auth/user.entity";
import { NotFoundException, Inject } from "@nestjs/common";
import { UserRepository } from "src/auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/users/users.service";

@EntityRepository(House)
export class HouseRepository extends Repository<House> {

    async createHouse(createHouseDto: CreateHouseDto, user: User): Promise<House> {
        const { name } = createHouseDto;

        const house = new House();
        house.name = name;
        house.members = [user];
        house.admins = [user];
        house.creatorId = user.id;
        await house.save();

        return house;
    }

    async getHouseById(id: number, user: User): Promise<House> {
        const house = await this.findOne({ id })

        if (!house) {
            throw new NotFoundException();
        }

        return house;
    }

    async addMember(houseId: number, newMember: User, user: User) {
        const house = await this.findOne({ id: houseId });
        if (!house) {
            throw new NotFoundException('House not found');
        }

        house.members.push(newMember);

        await house.save();

        return house;
    }

    async removeMember(houseId: number, member: User) {
        const house = await this.findOne({ id: houseId });
        if (!house) {
            throw new NotFoundException('House not found');
        }
        
        house.members = house.members.filter(m => m.id !== member.id);
        await house.save();
        return house;
    }
}