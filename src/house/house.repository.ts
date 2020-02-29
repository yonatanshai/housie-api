import { EntityRepository, Repository, In } from "typeorm";
import { House } from "./house.entity";
import { CreateHouseDto } from "./create-house.dto";
import { User } from "src/auth/user.entity";
import { NotFoundException, Inject, Logger, InternalServerErrorException } from "@nestjs/common";
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
        house.creatorId = user.id;

        try {
            await house.save();
        } catch (error) {
            this.logger.error(`createHouse failed ${error}`, error.stack);
            throw new InternalServerErrorException();
        }

        this.logger.log(`House created with id ${house.id}`);

        return house;
    }

    async getHouseById(id: number, user: User): Promise<House> {
        this.logger.log(`getHouseById called by user ${user.id} for house ${id}`);
        
        let house
        try {
            house = await this.findOne({ id })    
        } catch (error) {
            this.logger.error(`Error retrieving house from db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }
        
        if (!house) {
            this.logger.log('House not found')
            throw new NotFoundException();
        }

        this.logger.log('House found and is returned');
        return house;
    }

    async addMember(houseId: number, newMember: User, user: User) {
        this.logger.verbose(`User ${user.id} is adding user ${newMember.id} to house ${houseId} as member`);

        let house;
        try {
            house = await this.findOne({ id: houseId });    
        } catch (error) {
            this.logger.error(`Error retrieving house from db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }
        
        if (!house) {
            this.logger.log('House not found')
            throw new NotFoundException('House not found');
        }

        house.members.push(newMember);

        try {
            await house.save();    
        } catch (error) {
            this.logger.error(`Error updating house in db ${error}`, error.stack);
            throw new InternalServerErrorException(); 
        }
        
        this.logger.log('House updated');
        return house;
    }

    async removeMember(houseId: number, member: User) {
        this.logger.verbose(`User ${member.id} is being removed from ${houseId} as member`);

        let house;
        try {
            house = await this.findOne({ id: houseId });
        } catch (error) {
            this.logger.error(`Error retrieving house from db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!house) {
            this.logger.log('House not found')
            throw new NotFoundException('House not found');
        }
        
        house.members = house.members.filter(m => m.id !== member.id);

        try {
            await house.save();
        } catch (error) {
            this.logger.error(`Error updating house in db ${error}`, error.stack);
            throw new InternalServerErrorException()
        }
        
        return house;
    }
}