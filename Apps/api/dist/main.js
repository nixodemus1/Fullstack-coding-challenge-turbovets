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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
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
