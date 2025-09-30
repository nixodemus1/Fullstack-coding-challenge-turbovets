import { Controller, Get, Post, Delete, Body, Param, UseGuards, Logger, Req, Put } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { TaskService } from './task.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Roles('admin', 'user')
  async findAll(@Req() req: Request) {
    const user = req.user as { userId: number; roles: string[] };
    console.log('findAll called by user:', user);

    const tasks = await this.taskService.findAll();
    console.log('Tasks before filtering:', tasks);

    if (user.roles.includes('admin')) {
      console.log('User is admin, returning all tasks');
      return tasks;
    }

    const filteredTasks = tasks.filter((task: any) => task.userId === user.userId);
    console.log('Filtered tasks for user:', filteredTasks);
    return filteredTasks;
  }

  @Post()
  @Roles('admin', 'user')
  async create(@Body() task: { title: string; description: string }, @Req() req: Request) {
    const user = req.user as { userId: number; username: string };
    console.log('DEBUG: Creating task with data:', task, 'by user:', user);

    const newTask = {
      ...task,
      userId: user.userId,
      createdBy: user.username,
    };

    try {
      const createdTask = await this.taskService.create(newTask);
      this.logger.log(`Task created: ${JSON.stringify(createdTask)}`);
      return createdTask;
    } catch (error) {
      console.error('DEBUG: Error during task creation:', error);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('admin', 'user')
  async remove(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { userId: number; roles: string[] };
    const task = await this.taskService.findOne(id);

    if (!task) {
      this.logger.warn(`Task with id ${id} not found.`);
      return { statusCode: 404, message: 'Task not found' };
    }

    if (user.roles.includes('admin') || task.userId === user.userId) {
      await this.taskService.delete(id);
      this.logger.log(`Task deleted: ${JSON.stringify(task)}`);
      return { statusCode: 200, message: 'Task deleted successfully' };
    }

    this.logger.warn(`Unauthorized delete attempt by user ${user.userId} on task ${id}`);
    return { statusCode: 403, message: 'You are not authorized to delete this task' };
  }

  @Put(':id')
  @Roles('admin', 'user')
  async updateTask(
    @Param('id') id: string,
    @Body() updatedTask: { title?: string; description?: string },
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; roles: string[] };
    const task = await this.taskService.findOne(parseInt(id));

    if (!task) {
      return { statusCode: 404, message: 'Task not found' };
    }

    if (user.roles.includes('admin') || task.userId === user.userId) {
      const updated = await this.taskService.update(parseInt(id), updatedTask);
      this.logger.log(`Task updated: ${JSON.stringify(updated)}`);
      return { statusCode: 200, message: 'Task updated successfully', task: updated };
    }

    this.logger.warn(`Unauthorized update attempt by user ${user.userId} on task ${id}`);
    return { statusCode: 403, message: 'You are not authorized to update this task' };
  }

  @Delete('clear')
  @Roles('admin')
  async clearTasks() {
    this.logger.log('Clearing all tasks from the database.');
    await this.taskService.clear();
    return { statusCode: 200, message: 'All tasks cleared successfully.' };
  }
}