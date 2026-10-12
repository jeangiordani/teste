
import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { RequestStatus } from '../entities/request.entity.js';

export class UpdateRequestStatusDto {
    @IsEnum(RequestStatus, {
        message: 'O status informado é inválido.',
    })
    status!: RequestStatus;

    @IsOptional()
    @IsString({
        message: 'O comentário deve ser um texto.',
    })
    @MaxLength(500, {
        message: 'O comentário deve ter no máximo 500 caracteres.',
    })
    comment?: string | null;
}
