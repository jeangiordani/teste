
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcryptjs';
import type { Repository } from 'typeorm';

import { AppModule } from '../app.module.js';
import { Area } from '../areas/entities/area.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';

const DEFAULT_AREAS = [
    {
        name: 'Tecnologia e Processos',
        description: 'Área responsável por tecnologia e processos.',
    },
    {
        name: 'Crédito',
        description: 'Área responsável por assuntos de crédito.',
    },
    {
        name: 'Compliance',
        description: 'Área responsável por compliance e conformidade.',
    },
] as const;

async function seed(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    try {
        const config = app.get(ConfigService);

        const areasRepository = app.get<Repository<Area>>(
            getRepositoryToken(Area),
        );

        const usersRepository = app.get<Repository<User>>(
            getRepositoryToken(User),
        );

        const adminName = config.get<string>(
            'SEED_ADMIN_NAME',
            'Administrador',
        );

        const adminEmail = config
            .get<string>('SEED_ADMIN_EMAIL', 'admin@localhost.com')
            .trim()
            .toLowerCase();

        const adminPassword = config.get<string>('SEED_ADMIN_PASSWORD');

        if (!adminPassword || adminPassword.length < 8) {
            throw new Error(
                'Defina SEED_ADMIN_PASSWORD com pelo menos 8 caracteres.',
            );
        }

        console.log('Iniciando seed do banco de dados...');

        const areasByName = new Map<string, Area>();

        for (const areaData of DEFAULT_AREAS) {
            let area = await areasRepository.findOneBy({
                name: areaData.name,
            });

            if (!area) {
                area = areasRepository.create({
                    ...areaData,
                    isActive: true,
                });

                area = await areasRepository.save(area);

                console.log(`Área criada: ${area.name}`);
            } else {
                console.log(`Área já existente: ${area.name}`);
            }

            areasByName.set(area.name, area);
        }

        const adminArea = areasByName.get('Tecnologia e Processos');

        if (!adminArea) {
            throw new Error('Não foi possível obter a área do administrador.');
        }

        let admin = await usersRepository.findOneBy({
            email: adminEmail,
        });

        if (!admin) {
            const passwordHash = await hash(adminPassword, 12);

            admin = usersRepository.create({
                name: adminName,
                email: adminEmail,
                passwordHash,
                role: UserRole.ADMIN,
                areaId: adminArea.id,
            });

            await usersRepository.save(admin);

            console.log(`Administrador criado: ${adminEmail}`);
        } else {
            console.log(
                `Administrador já existente; senha e dados preservados: ${adminEmail}`,
            );
        }

        console.log('Seed concluído com sucesso.');
    } finally {
        await app.close();
    }
}

seed().catch((error: unknown) => {
    console.error('Erro ao executar o seed:', error);
    process.exitCode = 1;
});
