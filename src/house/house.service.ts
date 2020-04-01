import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseRepository } from './house.repository';
import { CreateHouseDto } from './create-house.dto';
// import { User } from 'src/auth/user.entity';
import { User } from '../auth/user.entity';
import { House } from './house.entity';
// import { UsersService } from 'src/users/users.service';
import { UsersService } from '../users/users.service';
import e = require('express');

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

    async getHouseMembersAndAdmins(id: number, user: User) {
        const house = await this.houseRepository.getHouseById(id, user);
        if (!this.isMember(house, user)) {
            throw new NotFoundException();
        }

        return {
            houseId: house.id,
            houseName: house.name,
            members: house.members,
            admins: house.admins
        }
    }

    async addMember(houseId: number, email: string, user: User): Promise<House> {
        this.logger.log(`addMember: called`)
        
        const newMember = await this.getMember(null, null, { email });
        const house = await this.getHouseById(houseId, user);

        if (!house) {
            throw new NotFoundException();
        }

        if (!newMember) {
            throw new NotFoundException();
        }

        if (house.members.some(m => m.id === newMember.id)) {
            throw new BadRequestException('Already a member');
        }

        if (newMember.id === user.id) {
            throw new BadRequestException('Attempt to add self as member');
        }

        this.logger.log(`found user ${JSON.stringify(newMember, null, 4)}`);

        return this.houseRepository.addMember(houseId, newMember, user);
    }

    async removeMember(id: number, user: User, memberId: number): Promise<House> {
        this.logger.log(`removeMember: called with id ${id} for member with id ${memberId}`);
        const member = await this.getMember(memberId);
        if (member.id === user.id) {
            throw new BadRequestException('Attempt to remove self as a member');
        }

        return this.houseRepository.removeMember(id, user, member);
    }

    async makeAdmin(id: number, user: User, newAdminId: number) {
        this.logger.log(`make admin called with houseId ${id}, userId ${newAdminId}`);
        const member = await this.getMember(newAdminId);

        return this.houseRepository.makeAdmin(id, user, member);
    }

    public async getMember(userId: number, relations?: string[], options?: { email: string }): Promise<User> {
        
        let member;
        try {
            if (options?.email) {
                member = this.usersService.getUserByEmail(options.email);
                if (!member) {
                    this.logger.log(`User not found`);
                    throw new NotFoundException('User not found');
                }
            } else {
                member = this.usersService.getUserById(userId, relations);
                if (!member) {
                    this.logger.log(`User not found`);
                    throw new NotFoundException('User not found');
                }
            }

        } catch (error) {
            this.logger.error(`Error fetching from db ${error}`, error.stack);
            throw new InternalServerErrorException();
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
