import { Repository, EntityRepository } from "typeorm";
import { User } from "./user.entity";
import { AuthCredentialsDto, SigninCredentialsDto } from "./auth-credentials.dto";
import {DbErrorCode} from '../shared/db-error-codes.enum';
import { ConflictException, InternalServerErrorException, NotFoundException, Logger } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    private logger = new Logger('UserRepository');
    async getUserById(id: number, relations?: string[]): Promise<User> {
        const user = await this.findOne(id, {relations: ['houses']})

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, email, password } = authCredentialsDto;

        const user = this.create();
        user.username = username;
        user.email = email;
        user.houses = [];
        user.expenses = [];
        user.password = await this.hashPassword(password);

        try {
            await user.save();
        } catch (error) {
            
            switch (error.code) {
                case DbErrorCode.UNIQUE_COLUMN_VIOLATION:
                    this.logger.error(`Duplicate user`);
                    throw new ConflictException('A user with this email already exists');
                default:
                    throw new InternalServerErrorException();
            }
        }

        delete user.password;
        delete user.email;
        return user;
    }

    async validateUserPassword(signinCredentialsDto: SigninCredentialsDto): Promise<User> {
        const { email, password } = signinCredentialsDto;

        // Select all data that is needed both for jwt and for password matching. By default password is not returned
        const user = await this.findOne({ select: ['id', 'username', 'email', 'password'], where: { email }, relations: ['houses'] });

        if (user && await user.validatePassword(password)) {
            delete user.password;
            return user;
        } else {
            return null;
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 8);
    }
}