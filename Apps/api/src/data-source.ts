import 'reflect-metadata';
import path from 'path';
import { DataSource, Logger } from 'typeorm';

console.log('DEBUG: Resolved entities path:', path.resolve(__dirname, './entities'));
import { User, Role } from './entities';
import { Task } from './tasks/task.entity'; // Isolate Task entity import

console.log('DEBUG: Entities registered:', [User, Role, Task]);
console.log('DEBUG: Resolved entities file path:', path.resolve(__dirname, './entities.ts'));

const isTestEnv = process.env.NODE_ENV === 'test';

console.log('DEBUG: AppDataSource options:', {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Role, Task],
  synchronize: !isTestEnv,
});

class CustomLogger implements Logger {
  logQuery(query: string, parameters?: any[]) {
    console.log('QUERY:', query, parameters);
  }
  logQueryError(error: string, query: string, parameters?: any[]) {
    console.error('QUERY ERROR:', error, query, parameters);
  }
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    console.warn('SLOW QUERY:', time, query, parameters);
  }
  logSchemaBuild(message: string) {
    console.log('SCHEMA BUILD:', message);
  }
  logMigration(message: string) {
    console.log('MIGRATION:', message);
  }
  log(level: 'log' | 'info' | 'warn', message: any) {
    console[level]('LOG:', message);
  }
}

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Role, Task],
  synchronize: true, // Temporarily enable synchronize to test schema initialization
  logging: true, // Enable verbose logging
  logger: new CustomLogger(), // Use custom logger
});

console.log('DEBUG: DataSource instance created:', AppDataSource);

console.log('DEBUG: Initializing AppDataSource with entities:', [User, Role, Task]);

console.log('DEBUG: Starting AppDataSource initialization...');

AppDataSource.initialize()
  .then(async () => {
    console.log('DEBUG: AppDataSource initialized successfully with entities:', AppDataSource.options.entities);

    // Debugging entity metadata
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log('DEBUG: Loaded entity metadata:', entityMetadatas.map(meta => meta.name));

    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    console.log('DEBUG: Tables in the database:', tables.map(table => table.name));

    await queryRunner.release();
  })
  .catch((error) => {
    console.error('DEBUG: Error during AppDataSource initialization:', error);
  });

console.log('DEBUG: Verifying Task entity:', Task);
console.log('DEBUG: Task entity metadata:', AppDataSource.getMetadata(Task));

export default AppDataSource;