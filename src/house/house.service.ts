import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseRepository } from './house.repository';
import { CreateHouseDto } from './create-house.dto';
// import { User } from 'src/auth/user.entity';
import { User } from '../auth/user.entity';
import { House } from './house.entity';
// import { UsersService } from 'src/users/users.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class HouseService {
    private logger = new Logger('HouseService', true);
    constructor(
        @InjectRepository(HouseRepository)
        private houseRepository: HouseRepository,
        private usersService: UsersService
    ) { }

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

    async removeMember(id: number, user: User, memberId: number) {
        const member = await this.getMember(memberId);
        return this.houseRepository.removeMember(id, user, member);
    }

    async makeAdmin(id: number, user: User, newAdminId: number) {
        this.logger.log(`make admin called with houseId ${id}, userId ${newAdminId}`);
        const member = await this.getMember(newAdminId);

        return this.houseRepository.makeAdmin(id, user, member);
    }

    public async getMember(userId: number, relations?: string[]): Promise<User> {
        let member;
        try {
            member = this.usersService.getUserById(userId, relations);
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

    public async isMember(houseOrId, user: User, options?: { useId: boolean }): Promise<boolean> {
        if (!options || !options.useId) {
            return this.houseRepository.isMember(houseOrId, user);
        }

        

        const house = await this.getHouseById(houseOrId, user);
        return this.houseRepository.isMember(house, user);
    }

    public async isAdmin(houseOrId, user: User, options?: { useId: boolean }): Promise<boolean> {
        if (!options || !options.useId) {
            return this.houseRepository.isAdmin(houseOrId, user);
        }

        const house = await this.getHouseById(houseOrId, user);
        return this.houseRepository.isAdmin(house, user);
    }
}
