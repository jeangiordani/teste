
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
    createUserSchema,
    type CreateUserFormData,
} from '@/schemas/user.schema';

import {
    apiRequest,
    clearAccessToken,
    getAccessToken,
    getAreas,
    getCurrentUser,
} from '@/lib/api';

import type { Area, AuthUser } from '@/types/auth.types';

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

export default function NewUserPage() {
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [pageError, setPageError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            areaId: '',
        },
    });

    useEffect(() => {
        let active = true;

        async function initializePage() {
            try {
                if (!getAccessToken()) {
                    router.replace('/login');
                    return;
                }

                const user = await getCurrentUser();

                if (!active) {
                    return;
                }

                if (user.role !== 'ADMIN') {
                    setCurrentUser(user);
                    setPageError(
                        'Você não tem permissão para cadastrar usuários.',
                    );
                    return;
                }

                setCurrentUser(user);

                const activeAreas = await getAreas();

                if (active) {
                    setAreas(activeAreas);
                }
            } catch {
                if (active) {
                    clearAccessToken();
                    router.replace('/login');
                }
            } finally {
                if (active) {
                    setIsCheckingAccess(false);
                }
            }
        }

        void initializePage();

        return () => {
            active = false;
        };
    }, [router]);

    async function handleCreateUser(data: CreateUserFormData) {
        setPageError('');
        setSuccessMessage('');

        try {
            await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            setSuccessMessage('Usuário cadastrado com sucesso.');

            reset({
                name: '',
                email: '',
                password: '',
                areaId: '',
            });
        } catch (err) {
            setPageError(
                err instanceof Error
                    ? err.message
                    : 'Não foi possível cadastrar o usuário.',
            );
        }
    }

    if (isCheckingAccess) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    Verificando permissões...
                </p>
            </main>
        );
    }

    if (currentUser?.role !== 'ADMIN') {
        return (
            <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Acesso negado</CardTitle>
                        <CardDescription>
                            Esta funcionalidade está disponível apenas para
                            administradores.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {pageError && (
                            <p
                                role="alert"
                                className="mb-4 text-sm text-destructive"
                            >
                                {pageError}
                            </p>
                        )}

                        <Button
                            className="w-full"
                            onClick={() => router.push('/dashboard')}
                        >
                            Voltar ao painel
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-muted/40 px-4 py-10">
            <div className="mx-auto w-full max-w-2xl space-y-6">
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                        ← Voltar ao painel
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">
                            Cadastrar usuário
                        </CardTitle>

                        <CardDescription>
                            Preencha os dados para criar uma conta de usuário.
                            A conta será criada com o papel USER.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit(handleCreateUser)}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>

                                <Input
                                    id="name"
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
                                <Label htmlFor="password">Senha inicial</Label>

                                <Input
                                    id="password"
                                    type="password"
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
                                    A senha deve ter entre 8 e 72 caracteres.
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
                                            disabled={areas.length === 0}
                                        >
                                            <SelectTrigger
                                                id="area"
                                                aria-invalid={!!errors.areaId}
                                            >
                                                <SelectValue placeholder="Selecione uma área">
                                                    {field.value
                                                        ? areas.find((a) => a.id === field.value)?.name
                                                        : undefined}
                                                </SelectValue>
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

                                {areas.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma área ativa disponível.
                                    </p>
                                )}
                            </div>

                            {pageError && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {pageError}
                                </p>
                            )}

                            {successMessage && (
                                <p
                                    role="status"
                                    className="text-sm text-green-700"
                                >
                                    {successMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isSubmitting ||
                                    areas.length === 0
                                }
                            >
                                {isSubmitting
                                    ? 'Cadastrando...'
                                    : 'Cadastrar usuário'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
