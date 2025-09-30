"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../src/app.module");
const data_source_1 = __importDefault(require("../src/data-source"));
describe('Task Operations (e2e)', () => {
    let app;
    let adminToken;
    let userToken;
    // Ensure database connection is verified before tests
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!data_source_1.default.isInitialized) {
                yield data_source_1.default.initialize();
                console.log('DEBUG: AppDataSource initialized successfully for tests.');
            }
        }
        catch (error) {
            console.error('DEBUG: Failed to initialize AppDataSource for tests:', error);
            throw error;
        }
        const moduleFixture = yield testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        yield app.init();
        // Clear tasks from the database
        yield (0, supertest_1.default)(app.getHttpServer()).delete('/tasks/clear');
        // Clear users from the database
        yield (0, supertest_1.default)(app.getHttpServer()).delete('/auth/clear-users');
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (app) {
            yield app.close(); // Ensure app is defined before calling close
        }
    }));
    it('should register and log in an admin account', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({ username: 'admin', password: 'adminpassword', role: 'admin' });
        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty('id');
        const loginResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'admin', password: 'adminpassword' });
        adminToken = loginResponse.body.access_token;
        expect(adminToken).toBeDefined();
    }));
    it('should add a task as admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Admin Task', description: 'Generic description for admin task' });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Admin Task');
    }));
    it('should register and log in a normal user account', () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({ username: 'user', password: 'userpassword', role: 'user' });
        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body).toHaveProperty('id');
        const loginResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'user', password: 'userpassword' });
        userToken = loginResponse.body.access_token;
        expect(userToken).toBeDefined();
    }));
    it('should allow normal user to add a task', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'User Task', description: 'Generic description for user task' });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('User Task');
    }));
    it('should allow normal user to add another task', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'User Task 2', description: 'Another user-created task' });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('User Task 2');
    }));
    it('should allow user to edit their own task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${userToken}`);
        const tasks = tasksResponse.body;
        expect(tasks).toBeDefined(); // Ensure tasks are fetched before proceeding
        const userTask = tasks.find((task) => task.title === 'User Task');
        expect(userTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .put(`/tasks/${userTask.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Updated User Task', description: 'Updated description for user task' });
        expect(response.status).toBe(200);
    }));
    it('should prevent normal user from editing an admin-created task', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .put('/tasks/1') // Assuming task ID 1 belongs to the admin
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Malicious Edit' });
        expect(response.status).toBe(403);
    }));
    it('should allow normal user to delete one of their own tasks', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${userToken}`);
        const tasks = tasksResponse.body;
        const userTask = tasks.find((task) => task.title === 'User Task 2');
        expect(userTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .delete(`/tasks/${userTask.id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
    }));
    it('should prevent normal user from deleting an admin-created task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        const tasks = tasksResponse.body;
        const adminTask = tasks.find((task) => task.createdBy === 'admin');
        expect(adminTask).toBeDefined();
        const deleteResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .delete(`/tasks/${adminTask.id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(deleteResponse.status).toBe(403);
    }));
    it('should prevent normal user from auditing logs', () => __awaiter(void 0, void 0, void 0, function* () {
        const auditResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/audit-log')
            .set('Authorization', `Bearer ${userToken}`);
        expect(auditResponse.status).toBe(403);
    }));
    it('should allow admin to edit user task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        const tasks = tasksResponse.body;
        const userTask = tasks.find((task) => task.createdBy === 'user');
        expect(userTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .put(`/tasks/${userTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Admin Edited User Task' });
        expect(response.status).toBe(200);
    }));
    it('should allow admin to edit their own task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        const tasks = tasksResponse.body;
        const adminTask = tasks.find((task) => task.createdBy === 'admin');
        expect(adminTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .put(`/tasks/${adminTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Updated Admin Task' });
        expect(response.status).toBe(200);
    }));
    it('should allow admin to get a list of accessible tasks', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        const tasks = response.body;
        expect(tasks.length).toBeGreaterThan(0); // Admin should see all tasks
    }));
    it('should allow admin to audit logs', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/audit-log')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
    }));
    it('should allow admin to delete user task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        const tasks = tasksResponse.body;
        const userTask = tasks.find((task) => task.createdBy === 'user');
        expect(userTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .delete(`/tasks/${userTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
    }));
    it('should allow admin to delete admin task', () => __awaiter(void 0, void 0, void 0, function* () {
        const tasksResponse = yield (0, supertest_1.default)(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${adminToken}`);
        const tasks = tasksResponse.body;
        const adminTask = tasks.find((task) => task.createdBy === 'admin');
        expect(adminTask).toBeDefined();
        const response = yield (0, supertest_1.default)(app.getHttpServer())
            .delete(`/tasks/${adminTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
    }));
});
