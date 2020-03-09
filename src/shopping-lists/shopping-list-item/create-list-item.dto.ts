import { IsString, IsNotEmpty } from "class-validator";

export class CreateListItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}