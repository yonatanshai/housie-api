import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto, SigninCredentialsDto } from './auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ){}

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const result = this.userRepository.signUp(authCredentialsDto);
    }

    async signIn(signInCredentialsDto: SigninCredentialsDto): Promise<{token: string}> {
        const user = await this.userRepository.validateUserPassword(signInCredentialsDto);
        
        if (!user) {
            throw new UnauthorizedException('Invalid password or username');
        }

        const payload : JwtPayload = {
            username: user.username,
            email: user.email,
            id: user.id,
        }

        const token = await this.jwtService.sign(payload);

        return { token };
    }
}
