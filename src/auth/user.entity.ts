import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Unique, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { Task } from '../tasks/task.entity';
import { House } from '../house/house.entity';
import { Expense } from "src/expenses/expense.entity";

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    username: string;

    @Column({ select: false })
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    currency: number;

    @ManyToMany(type => House, house => house.members, { eager: false })
    houses: House[]

    @ManyToMany(type => House, house => house.admins)
    adminHouses: House[]

    @OneToMany(type => Task, task => task.user)
    tasks: Task[];

    @OneToMany(type => Expense, expense => expense.creator)
    expenses: Expense[];

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}