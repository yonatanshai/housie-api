import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../auth/user.repository';
import { User } from '../auth/user.entity';
import { QueryBuilder } from 'typeorm';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
    private logger = new Logger('UsersService');
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) { }

    async getUserById(id: number, relations: string[]): Promise<User> {
        return this.userRepository.getUserById(id, relations);
    }

    async getUserByEmail(email: string): Promise<User> {
        this.logger.log(`getUserByEmail: called with email ${email}`);
        return this.userRepository.findOne({ email });
    }

    async updateUserProfile(updateUserDto: UpdateUserDto, user: User): Promise<User> {
        this.logger.log(`updateUserProfile: called with ${JSON.stringify(updateUserDto, null, 4)}`);
        return this.userRepository.updateUserProfile(updateUserDto, user);
    }
}
