import { createParamDecorator } from "@nestjs/common";
import { User } from "./user.entity";

export const GetUser = createParamDecorator((data, req): User => {
    delete req.user.password;
    return req.user;
});