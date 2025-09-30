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
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const data_source_1 = __importDefault(require("./data-source"));
const logger = new common_1.Logger('RolesGuard');
logger.debug('Ensure debug logs are visible during tests.');
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize the database connection
        try {
            yield data_source_1.default.initialize();
            console.log('Database connection initialized successfully.');
        }
        catch (error) {
            console.error('Failed to initialize database connection:', error);
            process.exit(1);
        }
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        try {
            // Verify database connection
            console.log('Verifying database connection...');
            const dataSource = app.get('DataSource');
            if (dataSource.isInitialized) {
                console.log('Database connection verified successfully.');
            }
            else {
                console.error('Database connection is not initialized.');
            }
        }
        catch (error) {
            console.error('Database connection failed:', error);
        }
        finally {
            // Exit the process after verification
            yield app.close();
            process.exit(0);
        }
    });
}
bootstrap();
