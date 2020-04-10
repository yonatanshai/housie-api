import { MinLength, MaxLength } from "class-validator";

export class CreateHouseDto {
    @MinLength(2)
    @MaxLength(40)
    name: string;
}