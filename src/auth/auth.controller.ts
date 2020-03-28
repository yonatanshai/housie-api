import { Controller, Post, Body, ValidationPipe, UseGuards, Req, Get, Logger } from '@nestjs/common';
import { AuthCredentialsDto, SigninCredentialsDto } from './auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
    private logger = new Logger('AuthController');
    constructor(
        private authService: AuthService
    ) {}

    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredentialsDto :AuthCredentialsDto): Promise<{user: User, token: string}> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post('/signin')
    signIn(@Body(ValidationPipe) signInCredentialsDto: SigninCredentialsDto): Promise<{token: string}> {
        this.logger.log('signIn: called')
        return this.authService.signIn(signInCredentialsDto);
    }
}
