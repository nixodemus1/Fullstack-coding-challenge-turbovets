import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const LOG_FILE_PATH = join(__dirname, '../../logs.txt');

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  @Get()
  @Roles('admin')
  getAuditLog(@Req() req: Request) {
    this.logger.debug(`User making request: ${JSON.stringify(req.user)}`);
    if (!existsSync(LOG_FILE_PATH)) {
      return { logs: 'No logs available.' };
    }
    const logs = readFileSync(LOG_FILE_PATH, { encoding: 'utf8' });
    return { logs };
  }
}