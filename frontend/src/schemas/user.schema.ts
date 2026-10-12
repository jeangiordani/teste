
import { z } from 'zod';

export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'O nome é obrigatório.')
        .max(100, 'O nome deve ter no máximo 100 caracteres.'),

    email: z
        .string()
        .trim()
        .min(1, 'O e-mail é obrigatório.')
        .email('Informe um e-mail válido.')
        .max(150, 'O e-mail deve ter no máximo 150 caracteres.'),

    password: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres.')
        .max(72, 'A senha deve ter no máximo 72 caracteres.'),

    areaId: z
        .string()
        .uuid('Selecione uma área válida.'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
