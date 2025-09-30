import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    console.log('JwtStrategy: constructor called');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for JWT secret
    });
    console.log('JwtStrategy: Using secret key:', process.env.JWT_SECRET || 'your_jwt_secret');
  }

  async validate(payload: any) {
    console.log('JwtStrategy: validate called');
    console.log('Raw payload:', payload);
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
    this.logger.debug(`Payload roles: ${JSON.stringify(payload.roles)}`);
    this.logger.debug(`Payload username: ${payload.username}`);
    this.logger.debug(`Payload userId: ${payload.sub}`);
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}