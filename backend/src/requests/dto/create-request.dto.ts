import {
    IsEnum,
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

export enum RequestPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export class CreateRequestDto {
    @IsString({
        message: 'O título deve ser um texto.',
    })
    @IsNotEmpty({
        message: 'O título é obrigatório.',
    })
    @MaxLength(150, {
        message: 'O título deve ter no máximo 150 caracteres.',
    })
    title!: string;

    @IsString({
        message: 'A descrição deve ser um texto.',
    })
    @IsNotEmpty({
        message: 'A descrição é obrigatória.',
    })
    description!: string;

    @IsEnum(RequestPriority, {
        message: 'A prioridade deve ser LOW, MEDIUM ou HIGH.',
    })
    priority!: RequestPriority;

    @IsUUID('4', {
        message: 'O identificador da área de destino deve ser um UUID válido.',
    })
    @IsNotEmpty({
        message: 'A área de destino é obrigatória.',
    })
    targetAreaId!: string;
}

