"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_module_1 = require("./auth/auth.module");
const entities_1 = require("./entities");
const tasks_module_1 = require("./tasks/tasks.module");
const data_source_1 = __importDefault(require("./data-source"));
const audit_log_controller_1 = require("./audit-log/audit-log.controller");
const isTestEnvironment = process.env.NODE_ENV === 'test';
const dataSourceOptions = isTestEnvironment
    ? data_source_1.default.options
    : {
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [entities_1.User, entities_1.Role, entities_1.Task, entities_1.Organization],
        synchronize: true,
    };
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(dataSourceOptions),
            auth_module_1.AuthModule,
            tasks_module_1.TasksModule, // Import TasksModule to register TaskRepository
        ],
        controllers: [
            audit_log_controller_1.AuditLogController, // Added the new controller
        ],
        providers: [
            {
                provide: 'DataSource',
                useFactory: (dataSource) => dataSource,
                inject: [typeorm_2.DataSource],
            },
        ],
        exports: ['DataSource'],
    })
], AppModule);
