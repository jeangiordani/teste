
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Controller,
    useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    registerSchema,
    type RegisterFormData,
} from '@/schemas/auth.schema';

import {
    getAreas,
    register as registerUser,
} from '@/lib/api';

import type { Area } from '@/types/auth.types';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
    const router = useRouter();

    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoadingAreas, setIsLoadingAreas] = useState(true);
    const [areasError, setAreasError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            areaId: '',
        },
    });

    useEffect(() => {
        let active = true;

        async function loadAreas() {
            try {
                const result = await getAreas();

                if (active) {
                    setAreas(result);
                }
            } catch (err) {
                if (active) {
                    setAreasError(
                        err instanceof Error
                            ? err.message
                            : 'Não foi possível carregar as áreas.',
                    );
                }
            } finally {
                if (active) {
                    setIsLoadingAreas(false);
                }
            }
        }

        void loadAreas();

        return () => {
            active = false;
        };
    }, []);

    async function handleRegister(data: RegisterFormData) {
        setSubmitError('');

        try {
            await registerUser(data);
            router.push('/login?registered=true');
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : 'Não foi possível realizar o cadastro.',
            );
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold">
                        Criar conta
                    </CardTitle>

                    <CardDescription>
                        Preencha seus dados para acessar o sistema
                        de solicitações.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(handleRegister)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>

                            <Input
                                id="name"
                                placeholder="Seu nome"
                                autoComplete="name"
                                maxLength={100}
                                aria-invalid={!!errors.name}
                                {...register('name')}
                            />

                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                placeholder="Mínimo de 8 caracteres"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={72}
                                aria-invalid={!!errors.password}
                                {...register('password')}
                            />

                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password.message}
                                </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Use entre 8 e 72 caracteres.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Área</Label>

                            <Controller
                                name="areaId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={
                                            isLoadingAreas ||
                                            areas.length === 0
                                        }
                                    >
                                        <SelectTrigger
                                            id="area"
                                            aria-invalid={!!errors.areaId}
                                        >
                                            <SelectValue
                                                placeholder={
                                                    isLoadingAreas
                                                        ? 'Carregando áreas...'
                                                        : 'Selecione sua área'
                                                }
                                            />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem
                                                    key={area.id}
                                                    value={area.id}
                                                >
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.areaId && (
                                <p className="text-sm text-destructive">
                                    {errors.areaId.message}
                                </p>
                            )}

                            {areasError && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {areasError}
                                </p>
                            )}

                            {!isLoadingAreas &&
                                !areasError &&
                                areas.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma área ativa está disponível
                                        para cadastro.
                                    </p>
                                )}
                        </div>

                        {submitError && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {submitError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                isSubmitting ||
                                isLoadingAreas ||
                                areas.length === 0
                            }
                        >
                            {isSubmitting
                                ? 'Criando conta...'
                                : 'Criar conta'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Fazer login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
