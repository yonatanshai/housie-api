import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt'
import {PassportModule} from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'sdhjk234dsfmn342dkfsjhf3242kjfdhs33$#@4',
      signOptions: {
        // expiresIn: 
        expiresIn: 3600
      }
    }),
    TypeOrmModule.forFeature([UserRepository])
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [
    JwtStrategy,
    PassportModule
  ]
})
export class AuthModule {}
