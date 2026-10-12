import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module.js';
import { AreasModule } from '../areas/areas.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    AreasModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error(
            'JWT_SECRET is not configured',
          );
        }

        return {
          secret,
        };
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService, JwtStrategy,
  ],
})
export class AuthModule { }