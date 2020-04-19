import { Controller, UseGuards, Patch, Body, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './update-user.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
    constructor(
        private userService: UsersService
    ){}

    @Patch()
    async updateUserProfile(
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @GetUser() user: User
    ): Promise<User> {
        return this.userService.updateUserProfile(updateUserDto, user);
    }
}
