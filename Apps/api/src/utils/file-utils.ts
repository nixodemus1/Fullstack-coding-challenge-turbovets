import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Reads tasks from the database.
   * @returns {Promise<Task[]>} The list of tasks.
   */
  async readTasksFromDatabase(): Promise<Task[]> {
    console.log('Fetching tasks from the database.');
    return await this.taskRepository.find();
  }

  async createTask(newTask: Partial<Task>): Promise<Task> {
    console.log('Creating a new task in the database:', newTask);
    const task = this.taskRepository.create(newTask);
    return await this.taskRepository.save(task);
  }

  async findTaskById(id: number): Promise<Task | undefined> {
    console.log('Finding task by ID:', id);
    const task = await this.taskRepository.findOne({ where: { id } });
    return task || undefined;
  }

  async deleteTask(id: number): Promise<void> {
    console.log('Deleting task by ID:', id);
    await this.taskRepository.delete(id);
  }

  async updateTask(id: number, updatedTask: Partial<Task>): Promise<Task> {
    console.log('Updating task by ID:', id, 'with data:', updatedTask);
    await this.taskRepository.update(id, updatedTask);
    const updated = await this.findTaskById(id);
    if (!updated) {
      throw new Error(`Task with ID ${id} not found after update.`);
    }
    return updated;
  }
}