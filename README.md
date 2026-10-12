# Teste Técnico — Assessor

Sistema de **gerenciamento de solicitações** (requests) com controle de áreas, usuários, histórico de alterações de status e trilha de auditoria (logs).

## Arquitetura

```
teste/
├── backend/    # API REST — NestJS 12 + TypeORM + PostgreSQL + JWT + Swagger
└── frontend/   # Web app — Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/Base UI
```

**Módulos do backend:** `auth` (login/me), `users`, `areas`, `requests`, `logs`.

**Páginas do frontend:** login, dashboard, solicitações, usuários.

---

## Pré-requisitos

| Ferramenta | Versão | Observação |
| --- | --- | --- |
| Node.js | **24.x** (backend) / 20.x (frontend) | Imagens Docker usam `node:24-bookworm-slim` e `node:20-alpine` |
| npm | 11.x+ | instalado com o Node |
| PostgreSQL | 18 | ou use o `docker-compose.yml` do backend |
| Docker + Docker Compose | — | necessário para rodar os containers |

> Com Docker instalado, não é necessário ter Node.js nem PostgreSQL locais.

---

A API NestJS tem o prefixo global `api` (ex.: `POST /api/auth/login`).

### Portas

| Serviço | Porta |
| --- | --- |
| Backend (API + Swagger) | 3000 |
| Frontend | 3001  |

---

## Instruções de execução

### Docker

**Backend** (sobe PostgreSQL 18 + API, e executa o seed automaticamente ao iniciar):

```bash
cd backend
docker compose up --build
```

**Frontend** (em outro terminal):

```bash
cd frontend
docker compose up --build
```

Acesse:
- Frontend: http://localhost:3001
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

**Acesso padrão criado pelo seed (Docker):** `admin@localhost.com` / `admin123`

---

## API de referência

Documentação interativa (Swagger/OpenAPI) em **http://localhost:3000/docs** com autenticação Bearer JWT.

Principais endpoints (todos com prefixo `/api`, exceto login):

- `POST /api/auth/login` → retorna token JWT (validade em `JWT_EXPIRES_IN`)
- `GET  /api/auth/me`
- `POST /api/users` (protegido)
- `GET  /api/areas`
- `GET/POST /api/requests`, `GET/PATCH/DELETE /api/requests/:id`, `PATCH /api/requests/:id/status`, `GET /api/requests/:id/history`, `GET /api/requests/stats`

O header de autorização é: `Authorization: Bearer <token>`.
