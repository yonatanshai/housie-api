import { Repository, EntityRepository } from "typeorm";
import { User } from "./user.entity";
import { AuthCredentialsDto, SigninCredentialsDto } from "./auth-credentials.dto";
import { DbErrorCode } from "src/shared/db-error-codes.enum";
import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';
import { async } from "rxjs/internal/scheduler/async";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async getUserById(id: number): Promise<User> {
        const user = await this.findOne(id, {relations: ['houses']})

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, email, password } = authCredentialsDto;

        const user = new User();
        user.username = username;
        user.email = email;
        user.houses = [];
        user.password = await this.hashPassword(password);

        try {
            await user.save();
        } catch (error) {
            if (error.code === DbErrorCode.UNIQUE_COLUMN_VIOLATION) {
                throw new ConflictException("A user with this email already exists");
            } else {
                console.log(error.message);
                throw new InternalServerErrorException();
            }

        }

    }

    async validateUserPassword(signinCredentialsDto: SigninCredentialsDto): Promise<User> {
        const { email, password } = signinCredentialsDto;

        // Select all data that is needed both for jwt and for password matching. By default password is not returned
        const user = await this.findOne({ select: ['id', 'username', 'email', 'password'], where: { email } });

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