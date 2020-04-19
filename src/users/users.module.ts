import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './users.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserRepository])
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
