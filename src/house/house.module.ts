import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseRepository } from './house.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UserRepository } from 'src/auth/user.repository';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseRepository]),
    AuthModule,
    UsersModule
  ],
  providers: [HouseService],
  controllers: [HouseController],
  exports: [HouseService]
})
export class HouseModule {}
