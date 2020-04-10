import { EntityRepository, Repository, In } from "typeorm";
import { House } from "./house.entity";
import { CreateHouseDto } from "./create-house.dto";
import { User } from "src/auth/user.entity";
import { NotFoundException, Inject, Logger, InternalServerErrorException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "src/auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/users/users.service";

@EntityRepository(House)
export class HouseRepository extends Repository<House> {
    private logger = new Logger('HouseRepository');

    async createHouse(createHouseDto: CreateHouseDto, user: User): Promise<House> {
        this.logger.verbose(`createHouse called by user ${user.id} with DTO ${JSON.stringify(createHouseDto)}`);
        const { name } = createHouseDto;

        const house = new House();
        house.name = name;
        house.members = [user];
        house.admins = [user];
        house.expenses = [];
        house.creatorId = user.id;

        await this.saveHouse(house);

        this.logger.log(`House created with id ${house.id}`);

        return house;
    }

    async getHouseById(id: number, user: User): Promise<House> {
        this.logger.log(`getHouseById called by user ${user.id} for house ${id}`);

        let house: House;
        try {
            house = await this.findOne({ id });
        } catch (error) {
            this.logger.error(`Error retrieving house from db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!house) {
            this.logger.log('House not found')
            throw new NotFoundException();
        }

        if (!house.members.some(member => member.id === user.id)) {
            throw new NotFoundException();
        }

        this.logger.log('House found and is returned');
        return house;
    }

    async addMember(houseId: number, newMember: User, user: User): Promise<House> {
        this.logger.verbose(`User ${user.id} is adding user ${newMember.id} to house ${houseId} as member`);

        const house = await this.getHouseById(houseId, user);

        if (!this.isAdmin(house, user)) {
            throw new UnauthorizedException('Only admins can add new members');
        }

        house.members.push(newMember);
        await this.saveHouse(house);
        this.logger.log('House updated');
        return house;
    }

    async removeMember(houseId: number, user: User, member: User): Promise<House> {
        this.logger.verbose(`User ${member.id} is being removed from ${houseId} as member`);

        const house = await this.getHouseById(houseId, user);

        house.members = house.members.filter(m => m.id !== member.id);
        house.admins = house.admins.filter(a => a.id !== member.id);
        await this.saveHouse(house);

        return house;
    }

    async makeAdmin(houseId: number, user: User, newAdmin: User): Promise<House> {
        this.logger.verbose(`User ${newAdmin.id} is being made admin for house ${houseId}`);

        const house = await this.getHouseById(houseId, user);

        if (!this.isMember(house, newAdmin)) {
            this.logger.error(`newAdmin ${newAdmin.id} is not a member`);
            throw new BadRequestException('User must be a member of the house before made admin');
        }

        if (this.isAdmin(house, newAdmin)) {
            this.logger.error(`newAdmin ${newAdmin.id} is already an admin`);
            throw new BadRequestException(`User ${newAdmin.id} is already an admin`)
        }

        if (!this.isAdmin(house, user)) {
            this.logger.log(`user ${user.id} is not an admin - only admins can make other users admins`);
            throw new UnauthorizedException('Only admins can make other members admins');
        }

        house.admins.push(newAdmin);

        await this.saveHouse(house);

        this.logger.log('House updated');
        return house;
    }

    public isAdmin(house: House, user: User): boolean {
        const result = house.admins.some(a => a.id === user.id);
        this.logger.log(`isAdmin result: ${result}`);
        return result;
    }

    public isMember(house: House, user: User): boolean {
        const result = house.members.some(m => m.id === user.id);
        this.logger.log(`isMember result: ${result}`);
        return result;
    }



    private async saveHouse(house: House): Promise<void> {
        try {
            await house.save();
        } catch (error) {
            this.logger.error(`Error updating house in db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }
    }
}