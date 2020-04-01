import { Controller, Logger, Post, UseGuards, Body, Get, Param, Patch, ParseIntPipe, ValidationPipe, Delete, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Role } from '../auth/guards/roles.enum';
import { Task } from './task.entity';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriorityValidationPipe } from './pipes/task-priority-validation.pipe';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';


@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');
    constructor(
        private tasksService: TasksService
    ) { }

    @Get('/')
    async getAllHouseTasks(
        @Query(ValidationPipe) getTaskFilterDto: GetTaskFilterDto,
        @GetUser() user: User
    ): Promise<Task[]> {
        this.logger.verbose(`getAllHouseTasks: called`);
        return this.tasksService.getAllHouseTasks(getTaskFilterDto, user);
    }

    @Get('/:taskId')
    async getTaskById(@Param('taskId') taskId: number, @GetUser() user: User): Promise<Task> {
        this.logger.verbose('getTaskById: called')
        return this.tasksService.getTaskById(taskId, user);
    }

    @Post()
    async createTask(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @GetUser() user: User): Promise<Task> {
        this.logger.verbose(`createTask: called with ${JSON.stringify(createTaskDto, null, 4)}`);
        return this.tasksService.createTask(createTaskDto, user);
    }


    @Patch('/:taskId')
    async updateTask(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
        @GetUser() user: User
    ) {
        return this.tasksService.updateTask(taskId, updateTaskDto, user);
    }

    @Patch('/:taskId/user')
    async assignTask(
        @Param('taskId') taskId: number,
        @Body('userId') assigneeId: number,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.assignTask(taskId, user, assigneeId);
    }

    @Patch('/:taskId/status')
    async updateTaskStatus(
        @Param('taskId') taskId: number,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User
    ): Promise<Task> {
        this.logger.verbose(`updateTaskStatus: called`);
        return this.tasksService.updateTaskStatus(taskId, status, user);
    }

    @Delete('/:taskId')
    async deleteTask(
        @Param('taskId') taskId: number,
        @GetUser() user: User
    ): Promise<void> {
        return this.tasksService.deleteTask(taskId, user);
    }
}
