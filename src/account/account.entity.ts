import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "./constants/rolePermissions";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    default: Roles.Customer
  })
  role: Roles;
}