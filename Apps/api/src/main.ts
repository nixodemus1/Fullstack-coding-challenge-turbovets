import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from './data-source';

const logger = new Logger('RolesGuard');
logger.debug('Ensure debug logs are visible during tests.');

async function bootstrap() {
  // Initialize the database connection
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  try {
    // Verify database connection
    console.log('Verifying database connection...');
    const dataSource = app.get('DataSource');
    if (dataSource.isInitialized) {
      console.log('Database connection verified successfully.');
    } else {
      console.error('Database connection is not initialized.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    // Exit the process after verification
    await app.close();
    process.exit(0);
  }
}

bootstrap();