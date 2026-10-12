import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { AreasService } from './areas.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('areas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AreasController {
    constructor(
        private readonly areasService: AreasService,
    ) { }
    @Get()
    findAll() {
        return this.areasService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', new ParseUUIDPipe({ version: '4' }))
        id: string,
    ) {
        return this.areasService.findOne(id);
    }

}