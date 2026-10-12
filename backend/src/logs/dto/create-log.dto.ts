import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateLogDto {
    @IsString({ message: 'A ação deve ser um texto.' })
    @IsNotEmpty({ message: 'A ação é obrigatória.' })
    @MaxLength(100, {
        message: 'A ação deve ter no máximo 100 caracteres.',
    })
    action!: string;

    @IsString({ message: 'A descrição deve ser um texto.' })
    @IsNotEmpty({ message: 'A descrição é obrigatória.' })
    description!: string;

    @IsOptional()
    @IsObject({ message: 'Os metadados devem ser um objeto.' })
    metadata?: Record<string, unknown>;
}