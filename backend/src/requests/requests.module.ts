
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogsModule } from '../logs/logs.module.js';
import { RequestsController } from './requests.controller.js';
import { RequestsService } from './requests.service.js';

import { Request } from './entities/request.entity.js';
import { RequestHistory } from './entities/request-history.entity.js';

import { Area } from '../areas/entities/area.entity.js';
import { User } from '../users/entities/user.entity.js';

import { RequestRepository } from './repositories/request.repository.js';
import { TypeOrmRequestRepository } from './repositories/typeorm-request.repository.js';

import { RequestHistoryRepository } from './repositories/request-history.repository.js';
import { TypeOrmRequestHistoryRepository } from './repositories/typeorm-request-history.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request,
      RequestHistory,
      Area,
      User,
    ]),
    LogsModule,
  ],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    {
      provide: RequestRepository,
      useClass: TypeOrmRequestRepository,
    },
    {
      provide: RequestHistoryRepository,
      useClass: TypeOrmRequestHistoryRepository,
    },
  ],
  exports: [
    RequestRepository,
    RequestHistoryRepository,
    RequestsService,
  ],
})
export class RequestsModule { }
