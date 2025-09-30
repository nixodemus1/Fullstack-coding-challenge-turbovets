import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource, // Inject DataSource for transaction management
  ) {}

  async findAll(): Promise<Task[]> {
    console.log('DEBUG: Fetching all tasks using repository.find');
    const tasks = await this.taskRepository.find();
    console.log('DEBUG: Tasks fetched:', tasks);
    return tasks;
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOneBy({ id });
  }

  async create(task: Partial<Task>): Promise<Task> {
    return this.dataSource.transaction(async (manager) => {
      const newTask = manager.getRepository(Task).create(task);
      return manager.getRepository(Task).save(newTask);
    });
  }

  async update(id: number, task: Partial<Task>): Promise<Task | null> {
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Task).update(id, task);
      return manager.getRepository(Task).findOneBy({ id });
    });
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Task).delete(id);
    });
  }

  async clear(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Task).clear();
    });
  }
}