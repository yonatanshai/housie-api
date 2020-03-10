import { IsOptional, IsNotEmpty } from "class-validator";

export class UpdateShoppingListItemDto {
    @IsOptional()
    @IsNotEmpty()
    name: string;
}