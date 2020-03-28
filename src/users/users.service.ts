import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../auth/user.repository';
import { User } from '../auth/user.entity';
import { QueryBuilder } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) { }

    async getUserById(id: number, relations: string[]): Promise<User> {
        return this.userRepository.getUserById(id, relations);
    }

    async getUserByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ email });
    }
}
