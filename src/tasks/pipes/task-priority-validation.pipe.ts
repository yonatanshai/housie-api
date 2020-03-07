import { PipeTransform, Logger, BadRequestException } from "@nestjs/common";
import { TaskPriority } from "../task-priority.enum";

export class TaskPriorityValidationPipe implements PipeTransform {
    private logger = new Logger('TaskPriorityValidationPipe')
    readonly allowedPriorities = [
        TaskPriority.Low,
        TaskPriority.Normal,
        TaskPriority.High
    ];

    transform(value: any) {
        this.logger.log(`transform called with value ${value}`)
        if (!this.isPriorityValid(value)) {
            this.logger.error(`${value} is an invalid priority`);
            throw new BadRequestException(`"${value}" is an invalid priority`);
        }

        this.logger.log(`transform: priority ${value} is valid`);

        return value
    }

    private isPriorityValid(priority: any) {
        this.logger.log(`isPriorityValid called with priority ${priority}`);
        return this.allowedPriorities.some(val => val === priority);
    }
}