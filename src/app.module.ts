import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { HouseModule } from './house/house.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, HouseModule, UsersModule],
  
})
export class AppModule {}
