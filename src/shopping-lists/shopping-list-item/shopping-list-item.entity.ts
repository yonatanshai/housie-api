import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/auth/user.entity";
import { ListItemStatus } from "./list-item-status.enum";
import { ShoppingList } from "../shopping-list.entity";

@Entity()
export class ShoppingListItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    creatorId: number;

    @Column({
        type: 'enum',
        enum: ListItemStatus,
        default: ListItemStatus.Pending
    })
    status: ListItemStatus;

    @ManyToOne(type => ShoppingList, list => list.items)
    list: ShoppingList;

    @Column()
    listId: number;

    @Column()
    checked: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


}