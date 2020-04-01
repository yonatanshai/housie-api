import { IsNotEmpty, IsNumber, Min, IsOptional } from "class-validator";

export class ExpenseFilterDto {

    @IsNotEmpty()
    houseId: number;

    @IsNotEmpty()
    fromDate: Date;

    @IsNotEmpty()
    toDate: Date;

    @IsOptional()
    greaterThan: number;

    @IsOptional()
    smallerThan: number;
}