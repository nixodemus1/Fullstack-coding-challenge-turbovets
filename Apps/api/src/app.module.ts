import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { User, Role, Task, Organization } from './entities';
import { TasksModule } from './tasks/tasks.module';
import AppDataSource from './data-source';
import { AuditLogController } from './audit-log/audit-log.controller';

const isTestEnvironment = process.env.NODE_ENV === 'test';
const dataSourceOptions: DataSourceOptions = isTestEnvironment
  ? AppDataSource.options
  : {
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Role, Task, Organization],
      synchronize: true,
    };

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    TasksModule, // Import TasksModule to register TaskRepository
  ],
  controllers: [
    AuditLogController, // Added the new controller
  ],
  providers: [
    {
      provide: 'DataSource',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
  ],
  exports: ['DataSource'],
})
export class AppModule {}