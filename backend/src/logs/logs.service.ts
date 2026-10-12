import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity.js';
import { CreateLogDto } from './dto/create-log.dto.js';
import { Log } from './entities/log.entity.js';

@Injectable()
export class LogsService {
    constructor(
        @InjectRepository(Log)
        private readonly logsRepository: Repository<Log>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(
        dto: CreateLogDto,
        userId: string | null = null,
        ipAddress: string | null = null,
    ): Promise<Log> {
        const log = this.logsRepository.create({
            userId,
            action: dto.action,
            description: dto.description,
            metadata: dto.metadata ?? null,
            ipAddress,
        });

        return this.logsRepository.save(log);
    }

    async findAll(
        userId: string,
        page = 1,
        limit = 20,
    ): Promise<{
        data: Log[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        if (user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Somente administradores podem consultar os logs.',
            );
        }

        const safePage = Number.isInteger(page) && page > 0 ? page : 1;
        const safeLimit =
            Number.isInteger(limit) && limit > 0
                ? Math.min(limit, 100)
                : 20;

        const [data, total] = await this.logsRepository.findAndCount({
            order: {
                createdAt: 'DESC',
            },
            skip: (safePage - 1) * safeLimit,
            take: safeLimit,
        });

        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit),
        };
    }
}