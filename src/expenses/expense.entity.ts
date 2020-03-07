import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { User } from "src/auth/user.entity";
import { House } from "src/house/house.entity";

@Entity()
export class Expense extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({type: "float"})
    amount: number;

    @ManyToOne(type => User, user => user.expenses)
    creator: User;

    @Column()
    creatorId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(type => House, house => house.expenses)
    house: House;

    @Column()
    houseId: number;

    
}