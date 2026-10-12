
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    loginSchema,
    type LoginFormData,
} from '@/schemas/auth.schema';

import {
    login,
    saveAccessToken,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function handleLogin(data: LoginFormData) {
        setError('');

        try {
            const response = await login(data);
            const token =
                response.access_token ?? response.accessToken;

            if (!token) {
                setError(
                    'A API não retornou o token de autenticação esperado.',
                );
                return;
            }

            saveAccessToken(token);
            router.push('/dashboard');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Não foi possível realizar o login.',
            );
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold">
                        Entrar
                    </CardTitle>

                    <CardDescription>
                        Informe seus dados para acessar o sistema.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(handleLogin)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="voce@empresa.com"
                                autoComplete="email"
                                maxLength={150}
                                aria-invalid={!!errors.email}
                                {...register('email')}
                            />

                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Sua senha"
                                autoComplete="current-password"
                                maxLength={72}
                                aria-invalid={!!errors.password}
                                {...register('password')}
                            />

                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
