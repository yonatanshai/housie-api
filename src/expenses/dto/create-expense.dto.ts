import { IsNotEmpty, IsOptional, IsPositive } from "class-validator";

export class CreateExpenseDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    description: string;

    @IsPositive()
    amount: number;

    houseId: number;
}