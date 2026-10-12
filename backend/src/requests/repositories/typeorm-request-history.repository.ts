
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RequestHistory } from '../entities/request-history.entity.js';
import { RequestHistoryRepository } from './request-history.repository.js';

@Injectable()
export class TypeOrmRequestHistoryRepository
    implements RequestHistoryRepository {
    constructor(
        @InjectRepository(RequestHistory)
        private readonly repository: Repository<RequestHistory>,
    ) { }

    create(data: Partial<RequestHistory>): RequestHistory {
        return this.repository.create(data);
    }

    async save(
        history: RequestHistory,
    ): Promise<RequestHistory> {
        return this.repository.save(history);
    }

    async findByRequestId(
        requestId: string,
    ): Promise<RequestHistory[]> {
        return this.repository.find({
            where: { requestId },
            relations: {
                changedByUser: true,
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }
}
