import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  @Get()
  @Roles('admin', 'user')
  findAll() {
    return 'This route is protected and accessible to admin and user roles.';
  }
}