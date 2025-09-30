"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const entities_1 = require("../entities");
let AuthService = class AuthService {
    constructor(jwtService, userRepository, roleRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        console.log('AuthService initialized');
    }
    validateUser(username, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { username }, relations: ['role'] });
            console.log('Database User:', user); // Log the user fetched from the database
            console.log('User Role:', user === null || user === void 0 ? void 0 : user.role); // Log the role relation to ensure it is loaded
            if ((user === null || user === void 0 ? void 0 : user.password) && (yield bcrypt.compare(pass, user.password))) {
                const validatedUser = {
                    userId: user.id, // Ensure this is the user's ID
                    username: user.username,
                    roles: user.role ? [user.role.name] : [], // Ensure roles are included
                };
                console.log('Validated User:', validatedUser); // Debugging log
                return validatedUser;
            }
            console.error('User validation failed for username:', username);
            return null;
        });
    }
    login(loginDto) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('AuthService: login called');
            const user = yield this.validateUser(loginDto.username, loginDto.password);
            if (!user) {
                console.error('Invalid credentials for user:', loginDto.username);
                throw new Error('Invalid credentials');
            }
            console.log('Validated User:', user);
            const payload = {
                username: user.username,
                sub: user.userId, // Ensure this is the user's ID
                roles: user.roles || [], // Ensure roles are always an array
            };
            console.log('Payload for token:', payload);
            const token = this.jwtService.sign(payload); // Use default secret from JwtModule configuration
            console.log('Generated Token:', token);
            return {
                access_token: token,
            };
        });
    }
    register(registerDto) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('AuthService: register called');
            const existingUser = yield this.userRepository.findOne({ where: { username: registerDto.username } });
            if (existingUser) {
                console.error('User already exists:', registerDto.username);
                throw new Error('User already exists');
            }
            const hashedPassword = yield bcrypt.hash(registerDto.password, 10);
            const role = yield this.roleRepository.findOne({ where: { name: registerDto.role } });
            if (!role) {
                console.error('Role not found:', registerDto.role);
                throw new Error('Invalid role');
            }
            const newUser = this.userRepository.create({
                username: registerDto.username,
                password: hashedPassword,
                role,
            });
            yield this.userRepository.save(newUser);
            console.log('User registered successfully:', newUser);
            return { id: newUser.id, message: 'User registered successfully' };
        });
    }
    deleteUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { username } });
            if (!user) {
                throw new Error('User not found');
            }
            return this.userRepository.remove(user);
        });
    }
    clearUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.clear();
            console.log('All users cleared from the database.');
            return { message: 'All users cleared successfully.' };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Role)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
