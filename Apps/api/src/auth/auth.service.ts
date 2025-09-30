import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    console.log('AuthService initialized');
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username }, relations: ['role'] });

    console.log('Database User:', user); // Log the user fetched from the database
    console.log('User Role:', user?.role); // Log the role relation to ensure it is loaded

    if (user?.password && (await bcrypt.compare(pass, user.password))) {
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
  }

  async login(loginDto: { username: string; password: string }) {
    console.log('AuthService: login called');

    const user = await this.validateUser(loginDto.username, loginDto.password);
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
  }

  async register(registerDto: { username: string; password: string; role: string }) {
    console.log('AuthService: register called');

    const existingUser = await this.userRepository.findOne({ where: { username: registerDto.username } });
    if (existingUser) {
      console.error('User already exists:', registerDto.username);
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const role = await this.roleRepository.findOne({ where: { name: registerDto.role } });

    if (!role) {
      console.error('Role not found:', registerDto.role);
      throw new Error('Invalid role');
    }

    const newUser = this.userRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(newUser);
    console.log('User registered successfully:', newUser);
    return { id: newUser.id, message: 'User registered successfully' };
  }

  async deleteUser(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepository.remove(user);
  }

  async clearUsers() {
    await this.userRepository.clear();
    console.log('All users cleared from the database.');
    return { message: 'All users cleared successfully.' };
  }
}