import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Area } from './entities/area.entity.js';
import { AreasController } from './areas.controller.js';
import { AreasService } from './areas.service.js';

import { AreaRepository } from './repositories/area.repository.js';
import { TypeOrmAreaRepository } from './repositories/typeorm-area.repository.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Area]),
    ],
    controllers: [AreasController],
    providers: [
        AreasService,
        {
            provide: AreaRepository,
            useClass: TypeOrmAreaRepository,
        },
    ],
    exports: [
        AreasService,
    ],
})
export class AreasModule { }