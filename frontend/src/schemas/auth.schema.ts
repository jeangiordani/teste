
import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'O e-mail é obrigatório.')
        .email('Informe um endereço de e-mail válido.')
        .max(150, 'O e-mail deve ter no máximo 150 caracteres.'),

    password: z
        .string()
        .min(1, 'A senha é obrigatória.')
        .max(72, 'A senha deve ter no máximo 72 caracteres.'),
});

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'O nome é obrigatório.')
        .max(100, 'O nome deve ter no máximo 100 caracteres.'),

    email: z
        .string()
        .trim()
        .min(1, 'O e-mail é obrigatório.')
        .email('Informe um endereço de e-mail válido.')
        .max(150, 'O e-mail deve ter no máximo 150 caracteres.'),

    password: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres.')
        .max(72, 'A senha deve ter no máximo 72 caracteres.'),

    areaId: z
        .string()
        .uuid('Selecione uma área válida.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
