import { IsBoolean, IsPositive, IsNotEmpty, IsOptional } from "class-validator";

export class GetListFilterDto {
    @IsNotEmpty()
    houseId: number;

    // if true then only active lists
    @IsNotEmpty()
    isActive: boolean;

    @IsNotEmpty()
    fromDate: Date;

    @IsNotEmpty()
    toDate: Date;
}