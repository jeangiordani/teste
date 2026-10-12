import 'reflect-metadata';

import { randomUUID } from 'node:crypto';

import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In, type Repository } from 'typeorm';
import request from 'supertest';

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';

import { AppModule } from '../src/app.module.js';

import { Area } from '../src/areas/entities/area.entity.js';

import {
    User,
    UserRole,
} from '../src/users/entities/user.entity.js';

import {
    Request as RequestEntity,
    RequestStatus,
} from '../src/requests/entities/request.entity.js';

import { RequestHistory } from '../src/requests/entities/request-history.entity.js';

import {
    RequestPriority,
} from '../src/requests/dto/create-request.dto.js';

interface TestUser {
    user: User;
    token: string;
}

describe('PATCH e DELETE /api/requests — permissões', () => {
    let app: INestApplication | undefined;

    let areasRepository: Repository<Area>;
    let usersRepository: Repository<User>;
    let requestsRepository: Repository<RequestEntity>;
    let historyRepository: Repository<RequestHistory>;

    let financeArea: Area;
    let creditArea: Area;
    let otherArea: Area;

    let joao: TestUser;
    let creditUser: TestUser;
    let otherUser: TestUser;
    let admin: TestUser;

    const createdRequestIds: string[] = [];

    const identifier = `permissoes-${randomUUID()}`;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error(
                'NODE_ENV deve ser test para executar estes testes.',
            );
        }

        process.loadEnvFile('.env.test');

        if (process.env.DB_DATABASE !== 'backend_test') {
            throw new Error(
                'Os testes devem utilizar o banco backend_test.',
            );
        }

        app = await NestFactory.create(AppModule, {
            logger: false,
        });

        app.setGlobalPrefix('api');

        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();

        const config = app.get(ConfigService);

        if (config.get<string>('DB_DATABASE') !== 'backend_test') {
            throw new Error(
                'A configuração do TypeORM não aponta para backend_test.',
            );
        }

        areasRepository = app.get<Repository<Area>>(
            getRepositoryToken(Area),
        );

        usersRepository = app.get<Repository<User>>(
            getRepositoryToken(User),
        );

        requestsRepository = app.get<Repository<RequestEntity>>(
            getRepositoryToken(RequestEntity),
        );

        historyRepository = app.get<Repository<RequestHistory>>(
            getRepositoryToken(RequestHistory),
        );

        const jwtService = app.get(JwtService);

        financeArea = await areasRepository.save(
            areasRepository.create({
                name: `Financeiro ${randomUUID()}`,
                description: 'Área de origem dos testes.',
                isActive: true,
            }),
        );

        creditArea = await areasRepository.save(
            areasRepository.create({
                name: `Crédito ${randomUUID()}`,
                description: 'Área de destino dos testes.',
                isActive: true,
            }),
        );

        otherArea = await areasRepository.save(
            areasRepository.create({
                name: `Outra área ${randomUUID()}`,
                description: 'Área para testar permissões.',
                isActive: true,
            }),
        );

        async function createTestUser(
            name: string,
            role: UserRole,
            areaId: string,
        ): Promise<TestUser> {
            const user = await usersRepository.save(
                usersRepository.create({
                    name,
                    email: `${randomUUID()}@example.com`,
                    passwordHash: 'usuario123',
                    role,
                    areaId,
                }),
            );

            const token = jwtService.sign({
                sub: user.id,
                email: user.email,
            });

            return { user, token };
        }

        joao = await createTestUser(
            'João do Financeiro',
            UserRole.USER,
            financeArea.id,
        );

        creditUser = await createTestUser(
            'Usuário do Crédito',
            UserRole.USER,
            creditArea.id,
        );

        otherUser = await createTestUser(
            'Usuário de outra área',
            UserRole.USER,
            otherArea.id,
        );

        admin = await createTestUser(
            'Administrador',
            UserRole.ADMIN,
            financeArea.id,
        );
    }, 30000);

    afterAll(async () => {
        try {
            if (createdRequestIds.length > 0) {
                await historyRepository.delete({
                    requestId: In(createdRequestIds),
                });

                await requestsRepository.delete(createdRequestIds);
            }

            if (usersRepository) {
                for (const testUser of [
                    joao,
                    creditUser,
                    otherUser,
                    admin,
                ]) {
                    if (testUser?.user) {
                        await usersRepository.delete({
                            id: testUser.user.id,
                        });
                    }
                }
            }

            if (areasRepository) {
                for (const area of [
                    financeArea,
                    creditArea,
                    otherArea,
                ]) {
                    if (area?.id) {
                        await areasRepository.delete({
                            id: area.id,
                        });
                    }
                }
            }
        } finally {
            if (app) {
                await app.close();
            }
        }
    }, 30000);

    async function createRequest(): Promise<string> {
        if (!app) {
            throw new Error('A aplicação não foi inicializada.');
        }

        const response = await request(app.getHttpServer())
            .post('/api/requests')
            .set('Authorization', `Bearer ${joao.token}`)
            .send({
                title: `${identifier} Solicitação`,
                description: 'Solicitação criada por João.',
                targetAreaId: creditArea.id,
                priority: RequestPriority.MEDIUM,
            })
            .expect(201);

        const requestId = response.body.id as string;

        createdRequestIds.push(requestId);

        return requestId;
    }

    function patchRequest(
        requestId: string,
        token: string,
        payload: object,
    ) {
        if (!app) {
            throw new Error('A aplicação não foi inicializada.');
        }

        return request(app.getHttpServer())
            .patch(`/api/requests/${requestId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
    }

    function patchStatus(
        requestId: string,
        token: string,
        status: RequestStatus,
    ) {
        if (!app) {
            throw new Error('A aplicação não foi inicializada.');
        }

        return request(app.getHttpServer())
            .patch(`/api/requests/${requestId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status,
                comment: 'Alteração feita durante o teste.',
            });
    }

    function deleteRequest(
        requestId: string,
        token: string,
    ) {
        if (!app) {
            throw new Error('A aplicação não foi inicializada.');
        }

        return request(app.getHttpServer())
            .delete(`/api/requests/${requestId}`)
            .set('Authorization', `Bearer ${token}`);
    }

    describe('edição dos dados da solicitação', () => {
        it('deve permitir que João edite sua própria solicitação', async () => {
            const requestId = await createRequest();

            const response = await patchRequest(
                requestId,
                joao.token,
                {
                    title: `${identifier} Título alterado por João`,
                    description: 'Descrição alterada por João.',
                },
            ).expect(200);

            expect(response.body.title).toBe(
                `${identifier} Título alterado por João`,
            );

            expect(response.body.description).toBe(
                'Descrição alterada por João.',
            );
        });

        it('deve impedir que um usuário do Crédito edite os dados de João', async () => {
            const requestId = await createRequest();

            await patchRequest(
                requestId,
                creditUser.token,
                {
                    title: 'Título alterado indevidamente',
                },
            ).expect(403);
        });

        it('deve impedir que um usuário de outra área edite os dados de João', async () => {
            const requestId = await createRequest();

            await patchRequest(
                requestId,
                otherUser.token,
                {
                    title: 'Título alterado indevidamente',
                },
            ).expect(403);
        });

        it('deve permitir que um administrador edite os dados', async () => {
            const requestId = await createRequest();

            const response = await patchRequest(
                requestId,
                admin.token,
                {
                    title: `${identifier} Título alterado pelo admin`,
                },
            ).expect(200);

            expect(response.body.title).toBe(
                `${identifier} Título alterado pelo admin`,
            );
        });
    });

    describe('exclusão da solicitação', () => {
        it('deve impedir que o Crédito exclua a solicitação de João', async () => {
            const requestId = await createRequest();

            await deleteRequest(
                requestId,
                creditUser.token,
            ).expect(403);
        });

        it('deve permitir que João exclua sua própria solicitação', async () => {
            const requestId = await createRequest();

            await deleteRequest(
                requestId,
                joao.token,
            ).expect(200);

            await request(app!.getHttpServer())
                .get(`/api/requests/${requestId}`)
                .set('Authorization', `Bearer ${joao.token}`)
                .expect(404);
        });

        it('deve permitir que um administrador exclua a solicitação', async () => {
            const requestId = await createRequest();

            await deleteRequest(
                requestId,
                admin.token,
            ).expect(200);

            await request(app!.getHttpServer())
                .get(`/api/requests/${requestId}`)
                .set('Authorization', `Bearer ${admin.token}`)
                .expect(404);
        });
    });

    describe('alteração do status', () => {
        it('deve impedir que João altere o status da solicitação', async () => {
            const requestId = await createRequest();

            await patchStatus(
                requestId,
                joao.token,
                RequestStatus.IN_ANALYSIS,
            ).expect(403);
        });

        it('deve impedir que um usuário de outra área altere o status', async () => {
            const requestId = await createRequest();

            await patchStatus(
                requestId,
                otherUser.token,
                RequestStatus.IN_ANALYSIS,
            ).expect(403);
        });

        it('deve permitir que o Crédito altere o status e criar histórico', async () => {
            const requestId = await createRequest();

            const response = await patchStatus(
                requestId,
                creditUser.token,
                RequestStatus.IN_ANALYSIS,
            ).expect(200);

            expect(response.body.status).toBe(
                RequestStatus.IN_ANALYSIS,
            );

            const historyResponse = await request(
                app!.getHttpServer(),
            )
                .get(`/api/requests/${requestId}/history`)
                .set(
                    'Authorization',
                    `Bearer ${creditUser.token}`,
                )
                .expect(200);

            expect(historyResponse.body).toHaveLength(1);

            expect(historyResponse.body[0]).toMatchObject({
                requestId,
                previousStatus: RequestStatus.OPEN,
                newStatus: RequestStatus.IN_ANALYSIS,
                changedByUser: {
                    id: creditUser.user.id,
                    name: creditUser.user.name,
                },
                comment: 'Alteração feita durante o teste.',
            });
        });

        it('deve permitir que um administrador altere o status', async () => {
            const requestId = await createRequest();

            const response = await patchStatus(
                requestId,
                admin.token,
                RequestStatus.APPROVED,
            ).expect(200);

            expect(response.body.status).toBe(
                RequestStatus.APPROVED,
            );

            const historyResponse = await request(
                app!.getHttpServer(),
            )
                .get(`/api/requests/${requestId}/history`)
                .set('Authorization', `Bearer ${admin.token}`)
                .expect(200);

            expect(historyResponse.body).toHaveLength(1);
            expect(historyResponse.body[0].newStatus).toBe(
                RequestStatus.APPROVED,
            );
        });
    });
});