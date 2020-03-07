import { TaskStatus } from "../task-status.enum";
import { IsOptional, IsEnum, IsNotEmpty } from "class-validator";

export class GetTaskFilterDto {
    @IsOptional()
    @IsEnum(TaskStatus)
    status: TaskStatus;

    @IsOptional()
    @IsNotEmpty()
    search: string;
}