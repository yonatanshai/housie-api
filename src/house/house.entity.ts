import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, CreateDateColumn, OneToMany, JoinTable } from "typeorm";
import { Task } from '../tasks/task.entity';
import { User } from '../auth/user.entity'
import { Expense } from "src/expenses/expense.entity";


@Entity()
export class House extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(type => User, user => user.houses, { eager: true })
    @JoinTable()
    members: User[];

    @ManyToMany(type => User, user => user.adminHouses, {eager: true})
    @JoinTable()
    admins: User[];

    @OneToMany(type => Task, task => task.house)
    tasks: Task[];

    @OneToMany(type => Expense, expense => expense.house)
    expenses: Expense[];

    @Column({ name: 'creator' })
    creatorId: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: string
}