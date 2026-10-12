import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity.js';
import { Log } from './entities/log.entity.js';
import { LogsController } from './logs.controller.js';
import { LogsService } from './logs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Log, User])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule { }