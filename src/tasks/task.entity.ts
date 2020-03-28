import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { House } from '../house/house.entity';
import { TaskPriority } from './task-priority.enum';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { IsOptional } from 'class-validator';

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    @IsOptional()
    description: string;

    @ManyToOne(type => House, house => house.tasks)
    house: House;

    @Column()
    houseId: number

    @Column()
    creator: number;

    @ManyToOne(type => User, user => user.tasks)
    user: User;

    @Column()
    userId: number;

    @Column({
        default: TaskStatus.New
    })
    status: TaskStatus;

    @Column({
        default: TaskPriority.Normal
    })
    priority: TaskPriority;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    lastStatusDate: Date

    @Column({ nullable: true, type: 'timestamp' })
    assignedAt: Date;

    @Column({ nullable: true, type: 'timestamp' })
    completedAt: Date;
}