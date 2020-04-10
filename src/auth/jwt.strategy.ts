import {PassportStrategy} from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger = new Logger('JwtStrategy');
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'sdhjk234dsfmn342dkfsjhf3242kjfdhs33$#@4'
        })
    }

    async validate(payload: JwtPayload) {
        this.logger.log(`validate called with payload ${JSON.stringify(payload, null, 4)}`);
        const user = await this.userRepository.findOne(payload.id, {relations: ['houses', 'tasks']});
        
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}