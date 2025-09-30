import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import AppDataSource from '../src/data-source';

describe('Task Operations (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  // Ensure database connection is verified before tests
  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('DEBUG: AppDataSource initialized successfully for tests.');
      }
    } catch (error) {
      console.error('DEBUG: Failed to initialize AppDataSource for tests:', error);
      throw error;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Clear tasks from the database
    await request(app.getHttpServer()).delete('/tasks/clear');

    // Clear users from the database
    await request(app.getHttpServer()).delete('/auth/clear-users');
  });

  afterAll(async () => {
    if (app) {
      await app.close(); // Ensure app is defined before calling close
    }
  });

  it('should register and log in an admin account', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'admin', password: 'adminpassword', role: 'admin' });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('id');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'adminpassword' });

    adminToken = loginResponse.body.access_token;
    expect(adminToken).toBeDefined();
  });

  it('should add a task as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Task', description: 'Generic description for admin task' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Admin Task');
  });

  it('should register and log in a normal user account', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'user', password: 'userpassword', role: 'user' });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('id');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user', password: 'userpassword' });

    userToken = loginResponse.body.access_token;
    expect(userToken).toBeDefined();
  });

  it('should allow normal user to add a task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User Task', description: 'Generic description for user task' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('User Task');
  });

  it('should allow normal user to add another task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User Task 2', description: 'Another user-created task' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('User Task 2');
  });

  it('should allow user to edit their own task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    const tasks = tasksResponse.body;
    expect(tasks).toBeDefined(); // Ensure tasks are fetched before proceeding

    const userTask = tasks.find((task: any) => task.title === 'User Task');
    expect(userTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .put(`/tasks/${userTask.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated User Task', description: 'Updated description for user task' });

    expect(response.status).toBe(200);
  });

  it('should prevent normal user from editing an admin-created task', async () => {
    const response = await request(app.getHttpServer())
      .put('/tasks/1') // Assuming task ID 1 belongs to the admin
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Malicious Edit' });

    expect(response.status).toBe(403);
  });

  it('should allow normal user to delete one of their own tasks', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${userToken}`);

    const tasks = tasksResponse.body;
    const userTask = tasks.find((task: any) => task.title === 'User Task 2');

    expect(userTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .delete(`/tasks/${userTask.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
  });

  it('should prevent normal user from deleting an admin-created task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    const tasks = tasksResponse.body;
    const adminTask = tasks.find((task: any) => task.createdBy === 'admin');

    expect(adminTask).toBeDefined();

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/tasks/${adminTask.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteResponse.status).toBe(403);
  });

  it('should prevent normal user from auditing logs', async () => {
    const auditResponse = await request(app.getHttpServer())
      .get('/audit-log')
      .set('Authorization', `Bearer ${userToken}`);

    expect(auditResponse.status).toBe(403);
  });

  it('should allow admin to edit user task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    const tasks = tasksResponse.body;
    const userTask = tasks.find((task: any) => task.createdBy === 'user');

    expect(userTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .put(`/tasks/${userTask.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Edited User Task' });

    expect(response.status).toBe(200);
  });

  it('should allow admin to edit their own task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    const tasks = tasksResponse.body;
    const adminTask = tasks.find((task: any) => task.createdBy === 'admin');

    expect(adminTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .put(`/tasks/${adminTask.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Admin Task' });

    expect(response.status).toBe(200);
  });

  it('should allow admin to get a list of accessible tasks', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    const tasks = response.body;
    expect(tasks.length).toBeGreaterThan(0); // Admin should see all tasks
  });

  it('should allow admin to audit logs', async () => {
    const response = await request(app.getHttpServer())
      .get('/audit-log')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should allow admin to delete user task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    const tasks = tasksResponse.body;
    const userTask = tasks.find((task: any) => task.createdBy === 'user');

    expect(userTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .delete(`/tasks/${userTask.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should allow admin to delete admin task', async () => {
    const tasksResponse = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    const tasks = tasksResponse.body;
    const adminTask = tasks.find((task: any) => task.createdBy === 'admin');

    expect(adminTask).toBeDefined();

    const response = await request(app.getHttpServer())
      .delete(`/tasks/${adminTask.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });
});