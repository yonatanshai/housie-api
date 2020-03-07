import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import { House } from '../house/house.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { EntityRepository, Repository } from 'typeorm';
import { Logger, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { TaskPriority } from './task-priority.enum';
import { json } from 'express';
import { UpdateTaskDto } from './dto/update-task.dto';

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

    async updateTask(taskId: number, updateTaskDto: UpdateTaskDto, user: User) {
        const { description, priority, title } = updateTaskDto;

        this.logger.verbose(`updateTask: called with dto ${JSON.stringify(updateTaskDto, null, 4)}`);

        let task: Task;
        try {
            task = await this.findOne({ id: taskId }, {relations: ['house']});    
        } catch (error) {
            this.logger.error(`updateTask: error getting task with id ${taskId} from db`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!task) {
            this.logger.error(`updateTask: task with id ${taskId} not found`);
            throw new NotFoundException();
        }

        if (!task.house.admins.some(a => a.id === user.id) && task.userId !== user.id) {
            this.logger.error(`updateTask: User with id ${user.id} is not task owner and not house admin`);
            throw new UnauthorizedException();
        }
        
        if (description) {
            task.description = description;
        }

        if (priority) {
            task.priority = priority;
        }

        if (title) {
            task.title = title;
        }

        try {
            await task.save();
        } catch (error) {
            this.logger.error(`updateTask: error saving task with id ${task.id} to the db`, error.stack);
            throw new InternalServerErrorException();
        }

        this.logger.log(`updateTask: task with id ${task.id} updated`);

        return task;
    }


}