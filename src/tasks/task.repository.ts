import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import {House} from '../house/house.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { EntityRepository, Repository } from 'typeorm';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import {TaskStatus} from './task-status.enum';
import {TaskPriority} from './task-priority.enum';
import { json } from 'express';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
    private logger = new Logger('TaskRepository');

    async createTask(createTaskDto: CreateTaskDto, house: House, assignedUser: User, creator: User) {
        const { title, description, priority } = createTaskDto;
        this.logger.verbose(`createTask called with DTO ${JSON.stringify(createTaskDto)}`);
        
        const task = this.create({
            title,
            creator: creator.id,
            house,
            user: assignedUser ? assignedUser : creator,
            description,
            status: assignedUser ? TaskStatus.Assigned : TaskStatus.New,
            priority: priority ? priority : TaskPriority.Normal
        });

        try {
            await task.save();
            delete task.user;
            delete task.house;
        } catch (error) {
            this.logger.error(`Error creating new task ${error}`, error.stack);
            throw new InternalServerErrorException();
        }

        this.logger.log(`task with id ${task.id} has been successfully created`);

        return task;
    }
}