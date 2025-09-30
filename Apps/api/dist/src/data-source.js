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
require("reflect-metadata");
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
console.log('DEBUG: Resolved entities path:', path_1.default.resolve(__dirname, './entities'));
const entities_1 = require("./entities");
const task_entity_1 = require("./tasks/task.entity"); // Isolate Task entity import
console.log('DEBUG: Entities registered:', [entities_1.User, entities_1.Role, task_entity_1.Task]);
console.log('DEBUG: Resolved entities file path:', path_1.default.resolve(__dirname, './entities.ts'));
const isTestEnv = process.env.NODE_ENV === 'test';
console.log('DEBUG: AppDataSource options:', {
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [entities_1.User, entities_1.Role, task_entity_1.Task],
    synchronize: !isTestEnv,
});
class CustomLogger {
    logQuery(query, parameters) {
        console.log('QUERY:', query, parameters);
    }
    logQueryError(error, query, parameters) {
        console.error('QUERY ERROR:', error, query, parameters);
    }
    logQuerySlow(time, query, parameters) {
        console.warn('SLOW QUERY:', time, query, parameters);
    }
    logSchemaBuild(message) {
        console.log('SCHEMA BUILD:', message);
    }
    logMigration(message) {
        console.log('MIGRATION:', message);
    }
    log(level, message) {
        console[level]('LOG:', message);
    }
}
const AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [entities_1.User, entities_1.Role, task_entity_1.Task],
    synchronize: true, // Temporarily enable synchronize to test schema initialization
    logging: true, // Enable verbose logging
    logger: new CustomLogger(), // Use custom logger
});
console.log('DEBUG: DataSource instance created:', AppDataSource);
console.log('DEBUG: Initializing AppDataSource with entities:', [entities_1.User, entities_1.Role, task_entity_1.Task]);
console.log('DEBUG: Starting AppDataSource initialization...');
AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('DEBUG: AppDataSource initialized successfully with entities:', AppDataSource.options.entities);
    // Debugging entity metadata
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log('DEBUG: Loaded entity metadata:', entityMetadatas.map(meta => meta.name));
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = yield queryRunner.getTables();
    console.log('DEBUG: Tables in the database:', tables.map(table => table.name));
    yield queryRunner.release();
}))
    .catch((error) => {
    console.error('DEBUG: Error during AppDataSource initialization:', error);
});
console.log('DEBUG: Verifying Task entity:', task_entity_1.Task);
console.log('DEBUG: Task entity metadata:', AppDataSource.getMetadata(task_entity_1.Task));
exports.default = AppDataSource;
