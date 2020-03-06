import { CanActivate, Injectable, ExecutionContext, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { HouseService } from "src/house/house.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./roles.enum";
import { House } from "src/house/house.entity";
import { User } from "../user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
    private logger = new Logger('RolesGuard');
    constructor(
        private readonly reflector: Reflector,
        private houseService: HouseService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('canActivateCalled')
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        this.logger.log(`canActivate called with roles: ${roles}`);
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: User = request.user;

        this.logger.verbose(`user from request is ${JSON.stringify(user, null, 4)}`);


        let houseId = request.params.houseId;
        if (!houseId) {
            houseId = request.body.houseId;
        }

        

        if (roles.includes(Role.admin)) {
            if (houseId) {
                const house = user.houses.find(h => h.id === houseId);
                if (!house) {
                    return false;
                }

                return house.admins.some(a => a.id === user.id);
            }

            const isAdmin = user.houses.some(h => h.admins.some(a => a.id === user.id));
            this.logger.log(`isAdmin: ${isAdmin}`);
            return isAdmin;
        } else if (roles.includes(Role.member)) {
            // return house.members.some(m => m.id === user.id);
            const isMember = user.houses.some(h => h.members.some(m => m.id === user.id));
            this.logger.log(`isMember: ${isMember}`);
            return isMember;
        }

        return true;
    }
    
}