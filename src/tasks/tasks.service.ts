import { Injectable, Logger, InternalServerErrorException, NotFoundException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { HouseService } from '../house/house.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { House } from 'src/house/house.entity';
import { TaskStatus } from './task-status.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
    private logger = new Logger('TaskService');
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository,
        private houseService: HouseService,
    ) { }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        this.logger.verbose(`createTask called with DTO ${JSON.stringify(createTaskDto)} by user ${user.id}`);

        const house = await this.getHouse(createTaskDto.houseId, user);
        const isAdmin = await this.houseService.isAdmin(house, user);
        this.logger.log(`createTask: isAdmin ${isAdmin}`);

        if (!isAdmin) {
            this.logger.log(`Attempt to create a task from a non admin user with id ${user.id}`);
            throw new UnauthorizedException('Only admins can create tasks');
        }

        const assignToUser = createTaskDto.userToAssignId ? await this.houseService.getMember(createTaskDto.userToAssignId) : undefined;

        return this.taskRepository.createTask(createTaskDto, house, assignToUser, user);
    }

    async getAllHouseTasks(getTaskFilterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
        const {houseId} = getTaskFilterDto;
        this.logger.log(`getAllHouseTasks called with houseId ${houseId} for user ${user.id}`);

        const isMember = await this.houseService.isMember(houseId, user, { useId: true });

        if (!isMember) {
            throw new NotFoundException();
        }

        // return this.taskRepository.find({ houseId });
        return this.taskRepository.getTasks(houseId, getTaskFilterDto, user);
    }

    async getTaskById(taskId: number, user: User): Promise<Task> {

        let task: Task;
        try {
            task = await this.taskRepository.findOne(taskId, { relations: ['house'] });
        } catch (error) {
            this.logger.error(`error getting task from db ${error.message}`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!task) {
            this.logger.error(`task with id ${taskId} not found`);
            throw new NotFoundException();
        }

        const isMember = await this.houseService.isMember(task.house, user);

        if (!isMember) {
            throw new NotFoundException();
        }

        return task;
    }

    async updateTask(taskId: number, updateTaskDto: UpdateTaskDto, user: User) {
        return this.taskRepository.updateTask(taskId, updateTaskDto, user);
    }

    async assignTask(taskId: number, user: User, assigneeId: number): Promise<Task> {
        const task = await this.getTaskById(taskId, user);
        const assignee = await this.houseService.getMember(assigneeId, ['tasks']);

        if (await !this.houseService.isMember(task.house, assignee)) {
            this.logger.error(`assignTask: assignee with id ${assignee} is not a member`);
            throw new BadRequestException('Assignee is not a member')
        }

        if (await !this.houseService.isAdmin(task.house, user)) {
            this.logger.log(`assignTask: user with id ${user.id} is not an admin`);
            throw new UnauthorizedException();
        }

        user.tasks = user.tasks.filter(t => t.id !== task.id);
        if (!user.tasks) {
            user.tasks = [];
        }

        if (assignee.tasks.some(t => t.id === task.id)) {
            this.logger.error(`task with id ${taskId} is already assigned to user with id ${assignee.id}`);
            throw new BadRequestException('Task already assigned to this user');
        }

        task.user = assignee;
        task.userId = assignee.id;
        task.assignedAt = new Date();
        task.status = TaskStatus.Assigned;

        assignee.tasks.push(task);

        try {
            await task.save();
        } catch (error) {
            this.logger.error(`assignTask: error saving task with id ${task.id}`, error.stack);
            throw new InternalServerErrorException();
        }

        try {
            await assignee.save();
        } catch (error) {
            this.logger.error(`assignTask: error saving assignee with id ${assignee.id}`, error.stack);
            throw new InternalServerErrorException();
        }

        delete task.house;
        delete task.user;

        this.logger.log(`Task with id ${task.id} assigned to user with id ${assignee.id}`);

        return task;
    }

    async updateTaskStatus(taskId: number, status: TaskStatus, user: User): Promise<Task> {
        this.logger.log(`updateTaskStatus called for task with id ${taskId} by user with id ${user.id} and status ${status}`);
        const task = await this.getTaskById(taskId, user);

        const isAdmin = await this.houseService.isAdmin(task.house, user);

        if (task.userId !== user.id && !isAdmin) {
            throw new UnauthorizedException();
        }

        task.status = status;

        if (status === TaskStatus.Completed) {
            task.completedAt = new Date();
        } else {
            if (task.completedAt) {
                task.completedAt = null;
            }
        }

        try {
            task.save();
        } catch (error) {
            throw new InternalServerErrorException();
        }

        this.logger.log(`updateTaskStatus: status updated`);

        return task;
    }

    async deleteTask(taskId: number, user: User): Promise<void> {
        this.logger.log(`deleteTask: called with taskId ${taskId} by user with id ${user.id}`);
        const task = await this.getTaskById(taskId, user);
        const isAdmin = await this.houseService.isAdmin(task.house, user);

        if (await !isAdmin) {
            this.logger.error(`user is not an admin`);
            throw new ForbiddenException();
        }

        const res = await this.taskRepository.delete({id: task.id});

        if (res.affected === 0) {
            this.logger.error(`error deleting task with id ${taskId}`);
            throw new InternalServerErrorException();
        }
    }
    

    public async getHouse(houseId: number, user: User): Promise<House> {
        let house: House;
        try {
            house = await this.houseService.getHouseById(houseId, user);
        } catch (error) {
            this.logger.error(`Error fetching house with id ${houseId}, ${error.message}`, error.stack);
            throw new InternalServerErrorException();
        }

        if (!house) {
            this.logger.log(`House with id ${houseId} not found`);
            throw new NotFoundException();
        }

        return house;
    }
}
