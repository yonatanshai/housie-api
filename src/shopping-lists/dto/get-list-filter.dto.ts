import { IsBoolean, IsPositive } from "class-validator";

export class GetListFilterDto {
    @IsBoolean()
    isActive: boolean;

    @IsPositive()
    houseId: number;
}