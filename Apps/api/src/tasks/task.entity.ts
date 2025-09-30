import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

console.log('DEBUG: @Entity decorator is being executed for Task entity');

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  userId!: number;
}