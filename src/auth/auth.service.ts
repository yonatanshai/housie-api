import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto, SigninCredentialsDto } from './auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) { }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<{ user: User, token: string }> {
        const user = await this.userRepository.signUp(authCredentialsDto);
        const token = await this.generateAccessToken(user);

        return { user, token }
    }

    async signIn(signInCredentialsDto: SigninCredentialsDto): Promise<{ user: User, token: string }> {
        this.logger.verbose(`signIn attempt with ${JSON.stringify(signInCredentialsDto, null, 4)}`)
        const user = await this.userRepository.validateUserPassword(signInCredentialsDto);
        this.logger.log(`signIn: user=${JSON.stringify(user,null,4)}`)
        if (!user) {
            throw new UnauthorizedException('Invalid password or username');
        }

        const token = await this.generateAccessToken(user);

        delete user.password;
        delete user.email;
        delete user.houses;
        this.logger.log(`user returned: ${JSON.stringify(user, null, 4)}`)
        return { token, user };
    }

    private async generateAccessToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            username: user.username,
            email: user.email,
            id: user.id,
            currency: user.currency
        }

        const token = await this.jwtService.sign(payload);

        return token
    }
}
