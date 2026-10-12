
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AreasModule } from '../areas/areas.module.js';

import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './repositories/users.repository.js';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AreasModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule { }
