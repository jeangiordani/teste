import { Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

import { RequestPriority } from './create-request.dto.js';
import { RequestStatus } from '../entities/request.entity.js';

export class FindRequestsQueryDto {
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString({
        message: 'A pesquisa deve ser um texto.',
    })
    @MaxLength(150, {
        message: 'A pesquisa deve ter no máximo 150 caracteres.',
    })
    search?: string;

    @IsOptional()
    @IsEnum(RequestStatus, {
        message: 'O status informado é inválido.',
    })
    status?: RequestStatus;

    @IsOptional()
    @IsEnum(RequestPriority, {
        message: 'A prioridade informada é inválida.',
    })
    priority?: RequestPriority;

    @IsOptional()
    @IsIn(['ASC', 'DESC'], {
        message: 'A ordenação deve ser ASC ou DESC.',
    })
    order: 'ASC' | 'DESC' = 'DESC';

    @IsOptional()
    @Type(() => Number)
    @IsInt({
        message: 'A página deve ser um número inteiro.',
    })
    @Min(1, {
        message: 'A página deve ser maior que zero.',
    })
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({
        message: 'O limite deve ser um número inteiro.',
    })
    @Min(1, {
        message: 'O limite deve ser maior que zero.',
    })
    @Max(100, {
        message: 'O limite máximo é de 100 solicitações por página.',
    })
    limit = 10;
}

