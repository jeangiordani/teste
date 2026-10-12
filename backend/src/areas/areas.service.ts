import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { AreaRepository } from './repositories/area.repository.js';

@Injectable()
export class AreasService {
    constructor(
        private readonly areasRepository: AreaRepository,
    ) { }

    async findAll() {
        return this.areasRepository.findAll();
    }

    async findOne(id: string) {
        const area = await this.areasRepository.findById(id);

        if (!area) {
            throw new NotFoundException(
                'Área não encontrada.',
            );
        }

        return area;
    }

    async remove(id: string) {
        const area = await this.findOne(id);

        await this.areasRepository.remove(area);

        return {
            message: 'Área excluída com sucesso.',
        };
    }

    async existsById(id: string): Promise<boolean> {
        return this.areasRepository.existsById(id);
    }
}