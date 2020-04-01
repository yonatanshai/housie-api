import { TaskStatus } from "../task-status.enum";
import { IsOptional, IsEnum, IsNotEmpty, IsDate, IsNumber, IsIn } from "class-validator";
import { TaskPriority } from "../task-priority.enum";
import { isDate, isNumber } from "util";

export class GetTaskFilterDto {
    // @IsOptional()
    // @IsEnum(TaskStatus)
    // status: TaskStatus;

    @IsNotEmpty()
    houseId: number;

    @IsOptional()
    @IsIn([TaskPriority.Low, TaskPriority.Normal, TaskPriority.High])
    priority: TaskPriority;

    @IsOptional()
    // @IsDate()
    fromDate: Date;

    @IsOptional()
    // @IsDate()
    toDate: Date;

    @IsOptional()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsNotEmpty()
    userId: number;

    @IsOptional()
    @IsNotEmpty()
    openOnly: boolean;

}