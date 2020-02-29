import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseRepository } from './house.repository';
import { CreateHouseDto } from './create-house.dto';
import { User } from 'src/auth/user.entity';
import { House } from './house.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HouseService {
    private logger = new Logger('HouseService', true);
    constructor(
        @InjectRepository(HouseRepository)
        private houseRepository: HouseRepository,
        private usersService: UsersService
    ) {}

    async createHouse(createHouseDto: CreateHouseDto, user: User): Promise<House> {
        return this.houseRepository.createHouse(createHouseDto, user);
    }

    async getMyHouses(user: User): Promise<House[]> {
        const member = await this.getMember(user.id);

        return member.houses;
    }

    async getHouseById(id: number, user: User): Promise<House> {
        return this.houseRepository.getHouseById(id, user);
    }

    async addMember(id: number, userId: number, user: User): Promise<House> {
        const newMember = await this.getMember(userId);

        return this.houseRepository.addMember(id, newMember, user);
    }

    async removeMember(id: number, userId: number) {
        const member = await this.getMember(userId);
        return this.houseRepository.removeMember(id, member);
    }

    async makeAdmin(id: number, userId: number) {
        this.logger.log(`make admin called with houseId ${id}, userId ${userId}`);
        const member = await this.getMember(userId);

        return this.houseRepository.makeAdmin(id, member);
    }

    private async getMember(userId: number): Promise<User> {
        let member;
        try {
            member = this.usersService.getUserById(userId);
        } catch (error) {
            this.logger.error(`Error fetching from db ${error}`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!member) {
            this.logger.log(`User not found`);
            throw new NotFoundException('User not found');
        }

        return member;
    }
}
