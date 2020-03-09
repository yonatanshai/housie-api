import { Entity, BaseEntity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { House } from "src/house/house.entity";
import { ShoppingListItem } from "./shopping-list-item/shopping-list-item.entity";

@Entity()
export class ShoppingList extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => House, house => house.shoppingLists)
    house: House;

    @Column()
    houseId: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    creatorId: number;

    @OneToMany(type => ShoppingListItem, item => item.list)
    items: ShoppingListItem[];

    @Column({
        type: 'float',
        nullable: true
    })
    totalAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}