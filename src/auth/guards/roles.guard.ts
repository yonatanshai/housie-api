import { CanActivate, Injectable, ExecutionContext, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { HouseService } from "src/house/house.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
    private logger = new Logger('RolesGuard');
    constructor(
        private readonly reflector: Reflector,
        private houseService: HouseService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        this.logger.log(`canActivate called with roles: ${roles}`);
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const houseId = request.params.houseId ? request.params.houseId : request.body.houseId;
        
        if (!houseId) {
            this.logger.error('Missing houseId in both params and body');
            throw new InternalServerErrorException();
        }

        const house = await this.houseService.getHouseById(houseId, user);

        if (!house) {
            throw new NotFoundException();
        }

        if (roles.includes(Role.admin)) {
            return house.admins.some(a => a.id === user.id);
        } else if (roles.includes(Role.member)) {
            return house.members.some(m => m.id === user.id);
        }

        return true;
    }
}