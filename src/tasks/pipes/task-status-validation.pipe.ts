import { PipeTransform, Logger, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {
    private logger = new Logger('TaskStatusValidationPipe')
    readonly allowedStatuses = [
        TaskStatus.InProgress,
        TaskStatus.Completed
    ];

    transform(value: any) {
        this.logger.log(`transform called with value ${value}`)
        if (!this.isStatusValid(value)) {
            this.logger.error(`${value} is an invalid status`);
            throw new BadRequestException(`"${value}" is an invalid status`);
        }

        this.logger.log(`transform: status ${value} is valid`);

        return value
    }

    private isStatusValid(status: any) {
        this.logger.log(`isStatusValid called with status ${status}`);
        return this.allowedStatuses.some(val => val === status);
    }
}