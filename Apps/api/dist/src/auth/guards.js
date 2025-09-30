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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var RolesGuard_1, JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const task_service_1 = require("../tasks/task.service");
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector, taskService) {
        this.reflector = reflector;
        this.taskService = taskService;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    canActivate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const handlerName = context.getHandler().name;
            this.logger.debug(`Processing route handler: ${handlerName}`);
            const roles = this.reflector.get('roles', context.getHandler());
            if (!roles) {
                this.logger.debug('No roles required for this route.');
                return true;
            }
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (!user || !user.userId || !user.roles || user.roles.length === 0) {
                this.logger.error('Invalid user object in request.');
                return false;
            }
            const hasRole = roles.some((role) => { var _a; return (_a = user.roles) === null || _a === void 0 ? void 0 : _a.map(String).includes(String(role)); });
            const rawResourceOwnerId = ((_a = request.body) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = request.params) === null || _b === void 0 ? void 0 : _b.userId);
            let resourceOwnerId = rawResourceOwnerId ? Number(rawResourceOwnerId) : undefined;
            this.logger.debug(`Raw resourceOwnerId from body: ${(_c = request.body) === null || _c === void 0 ? void 0 : _c.userId}`);
            this.logger.debug(`Raw resourceOwnerId from params: ${(_d = request.params) === null || _d === void 0 ? void 0 : _d.userId}`);
            this.logger.debug(`Final resourceOwnerId after parsing: ${resourceOwnerId}`);
            // Attempt to extract resourceOwnerId from the task data if not found in body or params
            if (!resourceOwnerId) {
                const taskId = ((_e = request.params) === null || _e === void 0 ? void 0 : _e.id) || ((_f = request.body) === null || _f === void 0 ? void 0 : _f.id);
                this.logger.debug(`Fetching task data for id: ${taskId}`);
                const task = yield this.taskService.findOne(Number(taskId));
                resourceOwnerId = task === null || task === void 0 ? void 0 : task.userId;
                this.logger.debug(`Extracted resourceOwnerId from task data: ${resourceOwnerId}`);
            }
            const isOwner = resourceOwnerId !== undefined && resourceOwnerId === user.userId;
            if (!isOwner && !hasRole) {
                this.logger.error('Access denied: User does not have the required permissions.');
                throw new common_1.ForbiddenException('You do not have permission to access this resource.');
            }
            return hasRole || isOwner;
        });
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, task_service_1.TaskService])
], RolesGuard);
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(err, user, info, context) {
        console.log('JwtAuthGuard: handleRequest called');
        const logger = new common_1.Logger(JwtAuthGuard_1.name);
        console.log('JwtAuthGuard: Token being validated:', context.switchToHttp().getRequest().headers.authorization);
        console.log('JwtAuthGuard: Error info:', info);
        if (err || !user) {
            logger.error(`Authentication failed: ${info === null || info === void 0 ? void 0 : info.message}`);
            logger.error(`Error details: ${JSON.stringify(err)}`);
            throw err || new common_1.UnauthorizedException();
        }
        logger.debug(`Authenticated user: ${JSON.stringify(user)}`);
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
