import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TaskService } from '../tasks/task.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector, private readonly taskService: TaskService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlerName = context.getHandler().name;
    this.logger.debug(`Processing route handler: ${handlerName}`);

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      this.logger.debug('No roles required for this route.');
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { userId: number; roles?: string[] };

    if (!user || !user.userId || !user.roles || user.roles.length === 0) {
      this.logger.error('Invalid user object in request.');
      return false;
    }

    const hasRole = roles.some((role) => user.roles?.map(String).includes(String(role)));

    const rawResourceOwnerId = request.body?.userId || request.params?.userId;
    let resourceOwnerId = rawResourceOwnerId ? Number(rawResourceOwnerId) : undefined;

    this.logger.debug(`Raw resourceOwnerId from body: ${request.body?.userId}`);
    this.logger.debug(`Raw resourceOwnerId from params: ${request.params?.userId}`);
    this.logger.debug(`Final resourceOwnerId after parsing: ${resourceOwnerId}`);

    // Attempt to extract resourceOwnerId from the task data if not found in body or params
    if (!resourceOwnerId) {
      const taskId = request.params?.id || request.body?.id;
      this.logger.debug(`Fetching task data for id: ${taskId}`);
      const task = await this.taskService.findOne(Number(taskId));
      resourceOwnerId = task?.userId;
      this.logger.debug(`Extracted resourceOwnerId from task data: ${resourceOwnerId}`);
    }

    const isOwner = resourceOwnerId !== undefined && resourceOwnerId === user.userId;

    if (!isOwner && !hasRole) {
      this.logger.error('Access denied: User does not have the required permissions.');
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return hasRole || isOwner;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('JwtAuthGuard: handleRequest called');
    const logger = new Logger(JwtAuthGuard.name);
    console.log('JwtAuthGuard: Token being validated:', context.switchToHttp().getRequest().headers.authorization);
    console.log('JwtAuthGuard: Error info:', info);
    if (err || !user) {
      logger.error(`Authentication failed: ${info?.message}`);
      logger.error(`Error details: ${JSON.stringify(err)}`);
      throw err || new UnauthorizedException();
    }
    logger.debug(`Authenticated user: ${JSON.stringify(user)}`);
    return user;
  }
}