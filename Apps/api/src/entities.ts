import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
class Role {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}

@Entity()
class Organization {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @OneToMany(() => User, (user) => user.organization)
  users?: User[];
}

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  username?: string;

  @Column()
  password?: string;

  @ManyToOne(() => Organization, (organization) => organization.users, { nullable: true })
  organization?: Organization;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  role?: Role;

  @OneToMany(() => Task, (task) => task.assignedTo)
  tasks?: Task[];
}

@Entity()
class Task {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title?: string;

  @Column()
  description?: string;

  @ManyToOne(() => User, (user) => user.tasks)
  assignedTo?: User;

  @Column()
  status?: string;
}

export { Role, Organization, User, Task };