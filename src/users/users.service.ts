import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { User } from 'src/auth/user.entity';
import { QueryBuilder } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) { }

    async getUserById(id: number): Promise<User> {
        return this.userRepository.getUserById(id);
    }
}
