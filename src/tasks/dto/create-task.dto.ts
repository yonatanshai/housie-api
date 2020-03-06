import { MinLength, MaxLength, IsOptional, IsNumber, IsEnum, } from "class-validator";
import { TaskPriority } from '../task-priority.enum';

export class CreateTaskDto {
    @IsNumber()
    houseId: number;

    @MinLength(2)
    @MaxLength(30)
    title: string;

    @IsOptional()
    @MinLength(2)
    @MaxLength(140)
    description: string;

    @IsNumber()
    @IsOptional()
    userToAssignId: number;
    
    @IsOptional()
    priority: TaskPriority
}