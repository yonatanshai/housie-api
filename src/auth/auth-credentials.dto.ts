import {IsString, MinLength, MaxLength, IsEmail, Contains, IsUppercase} from 'class-validator';
import { Optional } from '@nestjs/common';

export class AuthCredentialsDto {
    @IsString()
    @MinLength(2)
    @MaxLength(14)
    username: string;
    
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;
}

export class SigninCredentialsDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;
}