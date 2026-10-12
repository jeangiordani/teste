
import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Request as ExpressRequest } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { LogsService } from '../logs/logs.service.js';

import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto.js';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto.js';

import { RequestsService } from './requests.service.js';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        userId: string;
        email: string;
    };
}

@ApiTags('Requests')
@ApiBearerAuth('access-token')
@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
    constructor(
        private readonly requestsService: RequestsService,
        @Inject(LogsService)
        private readonly logsService: LogsService,
    ) { }

    @Post()
    create(
        @Body() dto: CreateRequestDto,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_CREATE',
                description: `Solicitação "${dto.title}" criada com sucesso.`,
                metadata: {
                    title: dto.title,
                    targetAreaId: dto.targetAreaId,
                    priority: dto.priority,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.create(
            dto,
            req.user.userId,
        );
    }

    @Get()
    findAll(
        @Query() query: FindRequestsQueryDto,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_LIST',
                description: 'Listagem de solicitações realizada.',
                metadata: {
                    page: query.page,
                    limit: query.limit,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.findAll(
            req.user.userId,
            query,
        );
    }

    @Get('stats')
    getStats(@Req() req: AuthenticatedRequest) {
        void this.logsService.create(
            {
                action: 'REQUEST_STATS',
                description: 'Consultada estatística de solicitações.',
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.getStats();
    }

    @Get(':id/history')
    findHistory(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_HISTORY',
                description: `Histórico da solicitação ${id} consultado.`,
                metadata: {
                    requestId: id,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.findHistory(
            id,
            req.user.userId,
        );
    }

    @Get(':id')
    findOne(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_FIND',
                description: `Solicitação ${id} consultada.`,
                metadata: {
                    requestId: id,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.findOne(
            id,
            req.user.userId,
        );
    }

    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
        @Body() dto: UpdateRequestDto,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_UPDATE',
                description: `Solicitação ${id} atualizada.`,
                metadata: {
                    requestId: id,
                    updatedFields: Object.keys(dto),
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.update(
            id,
            dto,
            req.user.userId,
        );
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
        @Body() dto: UpdateRequestStatusDto,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_STATUS_UPDATE',
                description: `Status da solicitação ${id} alterado para ${dto.status}.`,
                metadata: {
                    requestId: id,
                    newStatus: dto.status,
                    comment: dto.comment,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.updateStatus(
            id,
            dto,
            req.user.userId,
        );
    }

    @Delete(':id')
    remove(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
        @Req() req: AuthenticatedRequest,
    ) {
        void this.logsService.create(
            {
                action: 'REQUEST_DELETE',
                description: `Solicitação ${id} excluída.`,
                metadata: {
                    requestId: id,
                },
            },
            req.user.userId,
            req.ip ?? null,
        );

        return this.requestsService.remove(
            id,
            req.user.userId,
        );
    }
}
