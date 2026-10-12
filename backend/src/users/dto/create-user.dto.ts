import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString({
        message: 'O nome deve ser um texto.',
    })
    @IsNotEmpty({
        message: 'O nome é obrigatório.',
    })
    @MaxLength(100, {
        message: 'O nome deve ter no máximo 100 caracteres.',
    })
    name!: string;

    @IsEmail({}, {
        message: 'Informe um endereço de e-mail válido.',
    })
    @IsNotEmpty({
        message: 'O e-mail é obrigatório.',
    })
    @MaxLength(150, {
        message: 'O e-mail deve ter no máximo 150 caracteres.',
    })
    email!: string;

    @IsString({
        message: 'A senha deve ser um texto.',
    })
    @IsNotEmpty({
        message: 'A senha é obrigatória.',
    })
    @MinLength(8, {
        message: 'A senha deve ter pelo menos 8 caracteres.',
    })
    @MaxLength(72, {
        message: 'A senha deve ter no máximo 72 caracteres.',
    })
    password!: string;

    @IsUUID('4', {
        message: 'O identificador da área deve ser um UUID válido.',
    })
    @IsNotEmpty({
        message: 'A área é obrigatória.',
    })
    areaId!: string;
}

