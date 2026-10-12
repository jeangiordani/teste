
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: AuthenticatedRequest) {
        return this.authService.currentUser(req.user.userId);
    }
}