
import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AreasService } from '../areas/areas.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly areasService: AreasService,
    ) { }



    async login(dto: LoginDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }

        const passwordMatches = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get<string>(
                'JWT_EXPIRES_IN',
                '60m',
            ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        });

        return {
            access_token: accessToken,
            token_type: 'Bearer',
        };
    }

    async currentUser(userId: string) {
        const user = await this.usersService.findByIdWithArea(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            areaId: user.areaId,
            createdAt: user.createdAt,
        };
    }
}