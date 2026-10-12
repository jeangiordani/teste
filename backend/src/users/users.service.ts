
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';

import { UsersRepository } from './repositories/users.repository.js';
import { AreasService } from '../areas/areas.service.js';

@Injectable()
@ApiBearerAuth('access-token')
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly areasService: AreasService,
    ) { }

    findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findByEmail(email);
    }

    findById(id: string): Promise<User | null> {
        return this.usersRepository.findById(id);
    }

    findByIdWithArea(id: string): Promise<User | null> {
        return this.usersRepository.findByIdWithArea(id);
    }

    async create(dto: CreateUserDto) {
        const name = dto.name.trim();
        const email = dto.email.trim().toLowerCase();
        const areaId = dto.areaId;

        const existingUser = await this.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('E-mail já registrado.');
        }

        if (!(await this.areasService.existsById(areaId))) {
            throw new NotFoundException('Área não encontrada.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        try {
            const user = await this.usersRepository.create({
                name,
                email,
                password: passwordHash,
                areaId,
            });

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                areaId: user.areaId,
            };
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === '23505'
            ) {
                throw new ConflictException('E-mail já registrado.');
            }

            throw error;
        }
    }
}
