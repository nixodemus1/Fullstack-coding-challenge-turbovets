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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
let TaskService = class TaskService {
    constructor(taskRepository, dataSource) {
        this.taskRepository = taskRepository;
        this.dataSource = dataSource;
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('DEBUG: Fetching all tasks using repository.find');
            const tasks = yield this.taskRepository.find();
            console.log('DEBUG: Tasks fetched:', tasks);
            return tasks;
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.taskRepository.findOneBy({ id });
        });
    }
    create(task) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                const newTask = manager.getRepository(task_entity_1.Task).create(task);
                return manager.getRepository(task_entity_1.Task).save(newTask);
            }));
        });
    }
    update(id, task) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.getRepository(task_entity_1.Task).update(id, task);
                return manager.getRepository(task_entity_1.Task).findOneBy({ id });
            }));
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.getRepository(task_entity_1.Task).delete(id);
            }));
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                yield manager.getRepository(task_entity_1.Task).clear();
            }));
        });
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], TaskService);
