import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Area } from '../entities/area.entity.js';
import { AreaRepository } from './area.repository.js';

@Injectable()
export class TypeOrmAreaRepository implements AreaRepository {
    constructor(
        @InjectRepository(Area)
        private readonly repository: Repository<Area>,
    ) { }

    async findAll(): Promise<Area[]> {
        return this.repository.find({
            order: {
                name: 'ASC',
            },
        });
    }

    async findById(id: string): Promise<Area | null> {
        return this.repository.findOne({
            where: { id },
        });
    }

    async findByName(name: string): Promise<Area | null> {
        return this.repository.findOne({
            where: { name },
        });
    }

    async remove(area: Area): Promise<void> {
        await this.repository.remove(area);
    }

    async existsById(id: string): Promise<boolean> {
        return await this.repository.exists({
            where: { id },
        });
    }

}