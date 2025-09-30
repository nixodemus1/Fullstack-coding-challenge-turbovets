import { Controller, Post, Body, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { Roles } from './roles.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: { username: string; password: string; role: string }) {
    return this.authService.register(registerDto);
  }

  @Delete('user')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async deleteUser(@Body() deleteDto: { username: string }, @Req() req: Request) {
    return this.authService.deleteUser(deleteDto.username);
  }

  @Delete('clear-users')
  async clearUsers() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('This endpoint is only available in the test environment.');
    }
    return this.authService.clearUsers();
  }
}