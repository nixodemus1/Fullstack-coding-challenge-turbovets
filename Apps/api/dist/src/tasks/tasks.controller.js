"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var TasksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const roles_decorator_1 = require("../auth/roles.decorator");
const task_service_1 = require("./task.service");
let TasksController = TasksController_1 = class TasksController {
    constructor(taskService) {
        this.taskService = taskService;
        this.logger = new common_1.Logger(TasksController_1.name);
    }
    findAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            console.log('findAll called by user:', user);
            const tasks = yield this.taskService.findAll();
            console.log('Tasks before filtering:', tasks);
            if (user.roles.includes('admin')) {
                console.log('User is admin, returning all tasks');
                return tasks;
            }
            const filteredTasks = tasks.filter((task) => task.userId === user.userId);
            console.log('Filtered tasks for user:', filteredTasks);
            return filteredTasks;
        });
    }
    create(task, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            console.log('DEBUG: Creating task with data:', task, 'by user:', user);
            const newTask = Object.assign(Object.assign({}, task), { userId: user.userId, createdBy: user.username });
            try {
                const createdTask = yield this.taskService.create(newTask);
                this.logger.log(`Task created: ${JSON.stringify(createdTask)}`);
                return createdTask;
            }
            catch (error) {
                console.error('DEBUG: Error during task creation:', error);
                throw error;
            }
        });
    }
    remove(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const task = yield this.taskService.findOne(id);
            if (!task) {
                this.logger.warn(`Task with id ${id} not found.`);
                return { statusCode: 404, message: 'Task not found' };
            }
            if (user.roles.includes('admin') || task.userId === user.userId) {
                yield this.taskService.delete(id);
                this.logger.log(`Task deleted: ${JSON.stringify(task)}`);
                return { statusCode: 200, message: 'Task deleted successfully' };
            }
            this.logger.warn(`Unauthorized delete attempt by user ${user.userId} on task ${id}`);
            return { statusCode: 403, message: 'You are not authorized to delete this task' };
        });
    }
    updateTask(id, updatedTask, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const task = yield this.taskService.findOne(parseInt(id));
            if (!task) {
                return { statusCode: 404, message: 'Task not found' };
            }
            if (user.roles.includes('admin') || task.userId === user.userId) {
                const updated = yield this.taskService.update(parseInt(id), updatedTask);
                this.logger.log(`Task updated: ${JSON.stringify(updated)}`);
                return { statusCode: 200, message: 'Task updated successfully', task: updated };
            }
            this.logger.warn(`Unauthorized update attempt by user ${user.userId} on task ${id}`);
            return { statusCode: 403, message: 'You are not authorized to update this task' };
        });
    }
    clearTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Clearing all tasks from the database.');
            yield this.taskService.clear();
            return { statusCode: 200, message: 'All tasks cleared successfully.' };
        });
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)('clear'),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "clearTasks", null);
exports.TasksController = TasksController = TasksController_1 = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TasksController);
