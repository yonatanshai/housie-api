import { Controller, UseGuards, Post, Body, Get, Param, ParseIntPipe, Delete, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HouseService } from './house.service';
import { CreateHouseDto } from './create-house.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { House } from './house.entity';
import { Roles } from 'src/auth/guards/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/guards/roles.enum';


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

    @Get('/:id')
    @Roles(Role.member)
    @UseGuards(RolesGuard)
    getHouseById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<House> {
        this.logger.verbose(`User ${user.id} trying to get house with id ${id}`);
        return this.houseService.getHouseById(id, user);
    }

    @Post('/:id/members/:userId')
    @Roles(Role.admin)
    @UseGuards(RolesGuard)
    async addMember(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @GetUser() user: User
    ) {
        this.logger.verbose(`User ${user.id} is adding user ${userId} to house ${id} as member`);
        return this.houseService.addMember(id, userId, user);
    }

    @Delete('/:id/members/:userId')
    @Roles(Role.admin)
    @UseGuards(RolesGuard)
    async removeMember(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @GetUser() user: User
    ) {
        this.logger.verbose(`User ${user.id} is removing user ${userId} from house ${id} as member`);
        return this.houseService.removeMember(id, userId);
    }
}
