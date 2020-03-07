import { IsOptional, IsPositive, IsNotEmpty } from "class-validator";

export class UpdateExpenseDto {
    @IsNotEmpty()
    houseId: number;

    @IsOptional()
    description: string;

    @IsOptional()
    @IsPositive()
    amount: number;
}