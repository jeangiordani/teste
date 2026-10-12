
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
    Request,
    RequestStatus,
} from './entities/request.entity.js';

import { RequestHistory } from './entities/request-history.entity.js';

import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto.js';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto.js';

import { RequestRepository } from './repositories/request.repository.js';
import { RequestHistoryRepository } from './repositories/request-history.repository.js';

import { Area } from '../areas/entities/area.entity.js';
import {
    User,
    UserRole,
} from '../users/entities/user.entity.js';

@Injectable()
export class RequestsService {
    constructor(
        private readonly requestsRepository: RequestRepository,
        private readonly requestHistoryRepository: RequestHistoryRepository,

        @InjectRepository(Area)
        private readonly areasRepository: Repository<Area>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        private readonly dataSource: DataSource,
    ) { }

    async create(dto: CreateRequestDto, requesterId: string) {
        const user = await this.findUserOrFail(requesterId);

        const area = await this.areasRepository.findOne({
            where: {
                id: dto.targetAreaId,
                isActive: true,
            },
        });

        if (!area) {
            throw new NotFoundException(
                'A área de destino não existe ou está inativa.',
            );
        }

        const request = this.requestsRepository.create({
            title: dto.title.trim(),
            description: dto.description.trim(),
            requesterId: user.id,
            targetAreaId: area.id,
            priority: dto.priority,
            status: RequestStatus.OPEN,
        });

        const savedRequest =
            await this.requestsRepository.save(request);

        return this.findOne(savedRequest.id, requesterId);
    }

    async findAll(
        userId: string,
        filters: FindRequestsQueryDto,
    ) {
        await this.findUserOrFail(userId);

        const [requests, total] =
            await this.requestsRepository.findAll(filters);

        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;

        return {
            data: requests.map((request) =>
                this.toResponse(request),
            ),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, userId: string) {
        await this.findUserOrFail(userId);

        const request =
            await this.requestsRepository.findByIdWithRelations(id);

        if (!request) {
            throw new NotFoundException(
                'Solicitação não encontrada.',
            );
        }

        return this.toResponse(request);
    }

    async findHistory(id: string, userId: string) {
        await this.findUserOrFail(userId);
        await this.findRequestOrFail(id);

        const history =
            await this.requestHistoryRepository.findByRequestId(id);

        return history.map((entry) => ({
            id: entry.id,
            requestId: entry.requestId,
            previousStatus: entry.previousStatus,
            newStatus: entry.newStatus,
            comment: entry.comment,
            changedByUser: entry.changedByUser
                ? {
                    id: entry.changedByUser.id,
                    name: entry.changedByUser.name,
                    email: entry.changedByUser.email,
                }
                : undefined,
            createdAt: entry.createdAt,
        }));
    }

    async update(
        id: string,
        dto: UpdateRequestDto,
        userId: string,
    ) {
        const request = await this.findRequestOrFail(id);
        const user = await this.findUserOrFail(userId);

        this.ensureCanEdit(request, user);

        if (dto.targetAreaId !== undefined) {
            const area = await this.areasRepository.findOne({
                where: {
                    id: dto.targetAreaId,
                    isActive: true,
                },
            });

            if (!area) {
                throw new NotFoundException(
                    'A área de destino não existe ou está inativa.',
                );
            }

            request.targetAreaId = area.id;
        }

        if (dto.title !== undefined) {
            request.title = dto.title.trim();
        }

        if (dto.description !== undefined) {
            request.description = dto.description.trim();
        }

        if (dto.priority !== undefined) {
            request.priority = dto.priority;
        }

        await this.requestsRepository.save(request);

        return this.findOne(request.id, userId);
    }

    async updateStatus(
        id: string,
        dto: UpdateRequestStatusDto,
        userId: string,
    ) {
        await this.dataSource.transaction(async (manager) => {
            const requestsRepository =
                manager.getRepository(Request);

            const usersRepository =
                manager.getRepository(User);

            const historyRepository =
                manager.getRepository(RequestHistory);

            const request = await requestsRepository.findOne({
                where: { id },
            });

            if (!request) {
                throw new NotFoundException(
                    'Solicitação não encontrada.',
                );
            }

            const user = await usersRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException(
                    'Usuário não encontrado.',
                );
            }

            this.ensureCanManage(request, user);

            if (request.status === dto.status) {
                throw new BadRequestException(
                    'A solicitação já possui esse status.',
                );
            }

            const previousStatus = request.status;

            request.status = dto.status;

            await requestsRepository.save(request);

            const history = historyRepository.create({
                requestId: request.id,
                changedByUserId: user.id,
                previousStatus,
                newStatus: dto.status,
                comment: dto.comment?.trim() || null,
            });

            await historyRepository.save(history);
        });

        return this.findOne(id, userId);
    }

    async getStats() {
        const [total, open, approved, rejected, inAnalysis, byPriority] = await Promise.all([
            this.requestsRepository.count(),
            this.requestsRepository.countByStatus(RequestStatus.OPEN),
            this.requestsRepository.countByStatus(RequestStatus.APPROVED),
            this.requestsRepository.countByStatus(RequestStatus.REJECTED),
            this.requestsRepository.countByStatus(RequestStatus.IN_ANALYSIS),
            this.requestsRepository.countGroupByPriority(),
        ]);

        return {
            total,
            open,
            approved,
            rejected,
            inAnalysis,
            byPriority,
        };
    }

    async remove(id: string, userId: string) {
        const request = await this.findRequestOrFail(id);
        const user = await this.findUserOrFail(userId);

        this.ensureCanEdit(request, user);

        await this.requestsRepository.softRemove(request);

        return {
            message: 'Solicitação excluída com sucesso.',
        };
    }

    private ensureCanEdit(
        request: Request,
        user: User,
    ): void {
        const isAdmin = user.role === UserRole.ADMIN;
        const isRequester = request.requesterId === user.id;

        if (!isAdmin && !isRequester) {
            throw new ForbiddenException(
                'Somente o criador da solicitação ou um administrador pode editá-la.',
            );
        }
    }

    private ensureCanManage(
        request: Request,
        user: User,
    ): void {
        const isAdmin = user.role === UserRole.ADMIN;
        const belongsToTargetArea =
            user.areaId === request.targetAreaId;

        if (!isAdmin && !belongsToTargetArea) {
            throw new ForbiddenException(
                'Somente usuários da área de destino ou administradores podem realizar esta operação.',
            );
        }
    }

    private async findUserOrFail(
        userId: string,
    ): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(
                'Usuário não encontrado.',
            );
        }

        return user;
    }

    private async findRequestOrFail(
        id: string,
    ): Promise<Request> {
        const request =
            await this.requestsRepository.findById(id);

        if (!request) {
            throw new NotFoundException(
                'Solicitação não encontrada.',
            );
        }

        return request;
    }

    private toResponse(request: Request) {
        return {
            id: request.id,
            title: request.title,
            description: request.description,
            priority: request.priority,
            status: request.status,
            requester: request.requester
                ? {
                    id: request.requester.id,
                    name: request.requester.name,
                    email: request.requester.email,
                }
                : undefined,
            targetArea: request.targetArea
                ? {
                    id: request.targetArea.id,
                    name: request.targetArea.name,
                }
                : undefined,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        };
    }
}
