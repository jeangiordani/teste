
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity.js';
import {
    UsersRepository,
} from './users.repository.js';
import { CreateUserDto } from '../dto/create-user.dto.js';

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
        });
    }

    async create(data: CreateUserDto): Promise<User> {
        const userData = {
            name: data.name,
            email: data.email,
            passwordHash: data.password,
            areaId: data.areaId,
        };
        const user = this.repository.create(userData);

        return this.repository.save(user);
    }

    async findByIdWithArea(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: {
                area: true,
            },
        });
    }
}