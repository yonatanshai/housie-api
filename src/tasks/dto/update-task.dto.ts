import { IsOptional, MinLength, MaxLength, IsEnum, IsNumber } from "class-validator";
import { TaskPriority } from "../task-priority.enum";
import { UsePipes } from "@nestjs/common";
import { TaskPriorityValidationPipe } from '../pipes/task-priority-validation.pipe';

export class UpdateTaskDto {
    @IsOptional()
    @MinLength(2)
    @MaxLength(30)
    title: string;

    @IsOptional()
    @MinLength(2)
    @MaxLength(140)
    description: string;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority: TaskPriority

    @IsOptional()
    @IsNumber()
    assignedUserId: number;
}