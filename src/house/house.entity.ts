import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, CreateDateColumn, OneToMany, JoinTable } from "typeorm";
// import { User } from "src/auth/user.entity";
import {User} from '../auth/user.entity'

@Entity()
export class House extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(type => User, user => user.houses, { eager: true })
    @JoinTable()
    members: User[];

    @ManyToMany(type => User, user => user.adminHouses, { eager: true })
    @JoinTable()
    admins: User[];

    @Column({ name: 'creator' })
    creatorId: number;

    @CreateDateColumn()
    createdAt: number
}