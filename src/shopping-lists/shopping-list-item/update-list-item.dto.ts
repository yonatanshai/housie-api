import { IsOptional, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateShoppingListItemDto {
    @IsOptional()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsNotEmpty()
    @IsBoolean()
    checked: boolean;
}