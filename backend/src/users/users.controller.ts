
import {
    Body,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersService } from './users.service.js';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    register(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
}