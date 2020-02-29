import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseRepository } from './house.repository';
import { CreateHouseDto } from './create-house.dto';
import { User } from 'src/auth/user.entity';
import { House } from './house.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HouseService {
    constructor(
        @InjectRepository(HouseRepository)
        private houseRepository: HouseRepository,
        private usersService: UsersService
    ) {}

    async createHouse(createHouseDto: CreateHouseDto, user: User): Promise<House> {
        return this.houseRepository.createHouse(createHouseDto, user);
    }

    async getMyHouses(user: User): Promise<House[]> {
        user = await this.usersService.getUserById(user.id);

        if (!user) {
            throw new NotFoundException();
        }

        return user.houses;
    }

    async getHouseById(id: number, user: User): Promise<House> {
        return this.houseRepository.getHouseById(id, user);
    }

    async addMember(id: number, userId: number, user: User): Promise<House> {
        const newMember = await this.usersService.getUserById(userId);

        if (!newMember) {
            throw new NotFoundException('User not found');
        }

        return this.houseRepository.addMember(id, newMember, user);
    }

    async removeMember(id: number, userId: number) {
        const member = await this.usersService.getUserById(userId);

        if (!member) {
            throw new NotFoundException('User not found');
        }

        return this.houseRepository.removeMember(id, member);
    }
}
