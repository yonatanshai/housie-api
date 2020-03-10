import { IsOptional, IsString, MinLength, IsNotEmpty, IsBoolean, IsNumber, Min, IsPositive } from "class-validator";

export class UpdateListDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    isActive: boolean

    @IsBoolean()
    updateExpenses: boolean

    @IsOptional()
    @IsPositive()
    totalAmount: number;
}