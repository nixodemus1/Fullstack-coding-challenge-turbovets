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
var AuditLogController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const roles_decorator_1 = require("../auth/roles.decorator");
const fs_1 = require("fs");
const path_1 = require("path");
const LOG_FILE_PATH = (0, path_1.join)(__dirname, '../../logs.txt');
let AuditLogController = AuditLogController_1 = class AuditLogController {
    constructor() {
        this.logger = new common_1.Logger(AuditLogController_1.name);
    }
    getAuditLog(req) {
        this.logger.debug(`User making request: ${JSON.stringify(req.user)}`);
        if (!(0, fs_1.existsSync)(LOG_FILE_PATH)) {
            return { logs: 'No logs available.' };
        }
        const logs = (0, fs_1.readFileSync)(LOG_FILE_PATH, { encoding: 'utf8' });
        return { logs };
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuditLogController.prototype, "getAuditLog", null);
exports.AuditLogController = AuditLogController = AuditLogController_1 = __decorate([
    (0, common_1.Controller)('audit-log'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard)
], AuditLogController);
