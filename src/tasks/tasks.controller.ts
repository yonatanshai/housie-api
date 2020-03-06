import { Controller, Logger, Post, UseGuards, Body, Get, Param, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Role } from '../auth/guards/roles.enum';
import { Task } from './task.entity';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';


@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');
    constructor(
        private tasksService: TasksService
    ) { }

    @Get('/houses/:houseId')
    async getAllHouseTasks(@Param('houseId') houseId: number, @GetUser() user): Promise<Task[]> {
        return this.tasksService.getAllHouseTasks(houseId, user);
    }

    @Get('/:taskId')
    async getHouseById(@Param('taskId') taskId: number, @GetUser() user: User): Promise<Task> {
        return this.tasksService.getTaskById(taskId, user);
    }

    @Post()
    async createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User): Promise<Task> {
        return this.tasksService.createTask(createTaskDto, user);
    }

    @Patch('/:taskId/:userId')
    async assignTask(
        @Param('taskId') taskId: number,
        @Param('userId') assigneeId: number,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.assignTask(taskId, user, assigneeId);
    }
}
