import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Unique, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { Task } from '../tasks/task.entity';
import { House } from '../house/house.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ select: false })
    email: string;

    @Column({ select: false })
    password: string;

    @ManyToMany(type => House, house => house.members, { eager: false })
    houses: House[]

    @ManyToMany(type => House, house => house.admins)
    adminHouses: House[]

    @OneToMany(type => Task, task => task.user)
    tasks: Task[];

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}