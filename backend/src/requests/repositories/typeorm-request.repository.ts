import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { Request, RequestStatus } from '../entities/request.entity.js';
import { FindRequestsQueryDto } from '../dto/find-requests-query.dto.js';
import { RequestRepository } from './request.repository.js';
import { RequestPriority } from '../dto/create-request.dto.js';

@Injectable()
export class TypeOrmRequestRepository
    implements RequestRepository {
    constructor(
        @InjectRepository(Request)
        private readonly repository: Repository<Request>,
    ) { }

    create(data: Partial<Request>): Request {
        return this.repository.create(data);
    }

    async save(request: Request): Promise<Request> {
        return this.repository.save(request);
    }

    async findAll(
        filters: FindRequestsQueryDto,
    ): Promise<[Request[], number]> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const sortOrder = filters.order ?? 'DESC';

        const query = this.repository
            .createQueryBuilder('request')
            .leftJoinAndSelect(
                'request.requester',
                'requester',
            )
            .leftJoinAndSelect(
                'request.targetArea',
                'targetArea',
            )
            .orderBy('request.createdAt', sortOrder);

        if (filters.search?.trim()) {
            query.andWhere(
                `(
                    request.title ILIKE :search
                    OR request.description ILIKE :search
                )`,
                {
                    search: `%${filters.search.trim()}%`,
                },
            );
        }

        if (filters.status) {
            query.andWhere(
                'request.status = :status',
                { status: filters.status },
            );
        }

        if (filters.priority) {
            query.andWhere(
                'request.priority = :priority',
                { priority: filters.priority },
            );
        }

        query
            .skip((page - 1) * limit)
            .take(limit);

        return query.getManyAndCount();
    }

    async findById(
        id: string,
    ): Promise<Request | null> {
        return this.repository.findOne({
            where: { id },
        });
    }

    async findByIdWithRelations(
        id: string,
    ): Promise<Request | null> {
        return this.repository.findOne({
            where: { id },
            relations: {
                requester: true,
                targetArea: true,
            },
        });
    }

    async softRemove(request: Request): Promise<Request> {
        return this.repository.softRemove(request);
    }

    async count(): Promise<number> {
        return this.repository.countBy({ deletedAt: IsNull() });
    }

    async countByStatus(status: RequestStatus): Promise<number> {
        return this.repository.count({
            where: { status, deletedAt: IsNull() },
        });
    }

    async countGroupByPriority(): Promise<Record<RequestPriority, number>> {
        const rows = await this.repository
            .createQueryBuilder('r')
            .select('r.priority', 'priority')
            .addSelect('COUNT(*)', 'count')
            .andWhere('r.deletedAt IS NULL')
            .groupBy('r.priority')
            .getRawMany<{ priority: RequestPriority; count: string }>();

        return {
            [RequestPriority.LOW]: Number(rows.find((r) => r.priority === RequestPriority.LOW)?.count ?? 0),
            [RequestPriority.MEDIUM]: Number(rows.find((r) => r.priority === RequestPriority.MEDIUM)?.count ?? 0),
            [RequestPriority.HIGH]: Number(rows.find((r) => r.priority === RequestPriority.HIGH)?.count ?? 0),
        };
    }
}