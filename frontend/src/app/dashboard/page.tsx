'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    clearAccessToken,
    getAccessToken,
    getCurrentUser,
} from '@/lib/api';

import type { AuthUser } from '@/types/auth.types';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useRequestStats } from '@/hooks/useRequestStats';
import { TrendingUp, ClockCheck, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { stats, isLoading: isStatsLoading } = useRequestStats();

    useEffect(() => {
        let active = true;

        async function loadUser() {
            if (!getAccessToken()) {
                router.replace('/login');
                return;
            }

            try {
                const currentUser = await getCurrentUser();

                if (active) {
                    setUser(currentUser);
                }
            } catch {
                if (active) {
                    clearAccessToken();
                    router.replace('/login');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadUser();

        return () => {
            active = false;
        };
    }, [router]);

    function handleLogout() {
        clearAccessToken();
        router.replace('/login');
    }

    if (isLoading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
                <p className="text-sm text-muted-foreground">
                    Carregando painel...
                </p>
            </main>
        );
    }

    const formatNumber = (num: number) => num.toLocaleString('pt-BR');

    return (
        <main className="min-h-screen bg-muted/40">
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <div>
                        <h1 className="text-xl font-bold">
                            Painel de solicitações
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Bem-vindo, {user.name}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleLogout}
                    >
                        Sair
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
                {!isStatsLoading && stats && (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Estatísticas de solicitações">
                        <StatCard
                            title="Total"
                            value={formatNumber(stats.total)}
                            icon={<TrendingUp className="h-5 w-5 text-primary" />}
                        />
                        <StatCard
                            title="Abertas"
                            value={formatNumber(stats.open)}
                            icon={<ClockCheck className="h-5 w-5 text-amber-500" />}
                        />
                        <StatCard
                            title="Em análise"
                            value={formatNumber(stats.inAnalysis)}
                            icon={<ClockCheck className="h-5 w-5 text-blue-500" />}
                        />
                        <StatCard
                            title="Aprovadas"
                            value={formatNumber(stats.approved)}
                            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                        />
                        <StatCard
                            title="Rejeitadas"
                            value={formatNumber(stats.rejected)}
                            icon={<XCircle className="h-5 w-5 text-red-500" />}
                        />
                    </section>
                )}

                {isStatsLoading && (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Estatísticas de solicitações">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="pt-6">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                    <div className="h-8 bg-muted rounded w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold">
                        Dashboard
                    </h2>

                    <p className="mt-1 text-muted-foreground">
                        Acesse as funcionalidades disponíveis para sua conta.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meu perfil</CardTitle>

                            <CardDescription>
                                Informações da sua conta.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Nome
                                </p>

                                <p className="font-medium">
                                    {user.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    E-mail
                                </p>

                                <p className="break-all font-medium">
                                    {user.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Perfil de acesso
                                </p>

                                <p className="font-medium">
                                    {user.role === 'ADMIN'
                                        ? 'Administrador'
                                        : 'Usuário'}
                                </p>
                            </div>

                            {user.areaId && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Identificador da área
                                    </p>

                                    <p className="break-all text-sm">
                                        {user.areaId}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitações</CardTitle>

                            <CardDescription>
                                Acompanhe as solicitações do sistema.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={() => router.push('/requests')}
                            >
                                Acessar solicitações
                            </Button>
                        </CardContent>
                    </Card>

                    {user.role === 'ADMIN' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Gerenciar usuários</CardTitle>

                                <CardDescription>
                                    Cadastre novas contas para acessar o sistema.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <Button
                                    className="w-full"
                                    onClick={() => router.push('/users/new')}
                                >
                                    Cadastrar usuário
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {!isStatsLoading && stats && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Por Prioridade</CardTitle>
                                <CardDescription>
                                    Distribuição das solicitações por nível de prioridade
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <PriorityStatCard
                                        label="Baixa"
                                        value={formatNumber(stats.byPriority.LOW)}
                                        color="text-blue-500"
                                        bgColor="bg-blue-500/10"
                                        icon={<ArrowDownRight className="h-4 w-4" />}
                                    />
                                    <PriorityStatCard
                                        label="Média"
                                        value={formatNumber(stats.byPriority.MEDIUM)}
                                        color="text-amber-500"
                                        bgColor="bg-amber-500/10"
                                        icon={<TrendingUp className="h-4 w-4" />}
                                    />
                                    <PriorityStatCard
                                        label="Alta"
                                        value={formatNumber(stats.byPriority.HIGH)}
                                        color="text-red-500"
                                        bgColor="bg-red-500/10"
                                        icon={<ArrowUpRight className="h-4 w-4" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </main>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="mt-1 text-3xl font-bold">{value}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

interface PriorityStatCardProps {
    label: string;
    value: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

function PriorityStatCard({ label, value, color, bgColor, icon }: PriorityStatCardProps) {
    return (
        <div className={`p-4 rounded-lg border ${bgColor}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${color}`}>{label}</span>
                <span className={`p-2 rounded-lg ${bgColor}`}>{icon}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}