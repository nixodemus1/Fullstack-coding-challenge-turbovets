import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  username?: string;

  @Column()
  password?: string;

  @ManyToOne(() => Organization, (organization) => organization.users)
  organization?: Organization;

  @ManyToOne(() => Role, (role) => role.users)
  role?: Role;
}

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @OneToMany(() => User, (user) => user.organization)
  users?: User[];
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title?: string;

  @Column()
  description?: string;

  @ManyToOne(() => User, (user) => user.id)
  assignedTo?: User;

  @Column()
  status?: string;
}