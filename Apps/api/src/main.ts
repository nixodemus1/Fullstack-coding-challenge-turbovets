import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
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