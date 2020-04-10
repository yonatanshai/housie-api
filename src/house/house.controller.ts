import { Controller, UseGuards, Post, Body, Get, Param, ParseIntPipe, Delete, Logger, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HouseService } from './house.service';
import { CreateHouseDto } from './create-house.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { House } from './house.entity';
import { Roles } from 'src/auth/guards/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/guards/roles.enum';
import { Reflector } from '@nestjs/core';
import { HouseRepository } from './house.repository';


@Controller('house')
@UseGuards(AuthGuard())
export class HouseController {
    private logger = new Logger('HouseController', true);
    constructor(
        private houseService: HouseService,

    ) { }

    @Post()
    createHouse(
        @Body() createHouseDto: CreateHouseDto,
        @GetUser() user: User
    ): Promise<House> {
        this.logger.verbose(`User ${user.id} is creating a house. DTO: ${JSON.stringify(createHouseDto)}`);
        return this.houseService.createHouse(createHouseDto, user);
    }

    @Get()
    getMyHouses(@GetUser() user: User): Promise<House[]> {
        this.logger.verbose(`User ${user.id} get all houses called`);
        return this.houseService.getMyHouses(user);
    }

    @Get('/:houseId')
    getHouseById(
        @Req() req,
        @Param('houseId', ParseIntPipe) id: number,
        @GetUser() user: User): Promise<House> {
        this.logger.verbose(`User ${user.id} trying to get house with id ${id}`);
        return this.houseService.getHouseById(id, user);
    }

    @Get('/houseId/members')
    getHouseMembersAndAdmins(
        @Param('houseId', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        this.logger.verbose(`getHouseMembersAndAdmins called with houseId ${id}`)
        return this.houseService.getHouseMembersAndAdmins(id, user);
    }

    // @Post('/:houseId/members/:userId')
    // async addMember(
    //     @Param('houseId', ParseIntPipe) id: number,
    //     @Param('userId', ParseIntPipe) userId: number,
    //     @GetUser() user: User
    // ) {
    //     this.logger.verbose(`User ${user.id} is adding user ${userId} to house ${id} as member`);
    //     return this.houseService.addMember(id, userId, user);
    // }

    @Post('/:houseId/members')
    async addMember(
        @Param('houseId', ParseIntPipe) houseId: number,
        @Body('email') email: string,
        @GetUser() user: User
    ): Promise<House> {
        this.logger.log(`addMember: called with houseId ${houseId} and email ${email}`);
        return this.houseService.addMember(houseId, email, user);
    }

    @Delete('/:houseId')
    async deleteHouse(
        @Param('houseId', ParseIntPipe) houseId: number,
        @GetUser() user: User
    ): Promise<void> {
        return this.houseService.deleteHouse(houseId, user);
    }

    @Delete('/:houseId/me')
    async removeMe(
        @Param('houseId', ParseIntPipe) houseId: number,
        @GetUser() user: User
    ): Promise<House> {
        return this.houseService.removeMe(houseId, user);
    }

    @Delete('/:houseId/members/:userId')
    async removeMember(
        @Param('houseId', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @GetUser() user: User
    ): Promise<House> {
        this.logger.verbose(`User ${user.id} is removing user ${userId} from house ${id} as member`);
        return this.houseService.removeMember(id, user, userId);
    }

    @Post(`/:houseId/admins/:userId`)
    async makeAdmin(
        @Param('houseId', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        this.logger.log(`makeAdmin called with ${id}, ${userId}`);
        return this.houseService.makeAdmin(id, user, userId);
    }
}
