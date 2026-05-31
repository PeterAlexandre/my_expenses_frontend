# My Expenses — Frontend

React frontend for the `my_expenses_api` FastAPI backend.

## Context

- **Backend repo:** `~/dev/my_expenses_api`
- **Backend base URL (dev):** `http://localhost:8000`
- **API docs (when running):** `http://localhost:8000/docs`

## Learning context

Peter is learning React from scratch (basic HTML/CSS background). The initial curriculum (Módulos 1–9) was completed. Claude Code now operates in standard agent mode — edit files directly, explain what changed.

**Curriculum concluído:**
- [x] Módulo 1 — Setup e Primeiro Componente
- [x] Módulo 2 — Props e Estado
- [x] Módulo 3 — Roteamento
- [x] Módulo 4 — Integração com API (fetch + useEffect)
- [x] Módulo 5 — Autenticação (Login, Cadastro, JWT)
- [x] Módulo 6 — CRUD de Categorias
- [x] Módulo 7 — Listagem de Transações com Filtros
- [x] Módulo 8 — Cadastro e Importação de Transações
- [x] Módulo 9 — Relatório Mensal

## Tech stack

- Vite + React 18
- React Router v6
- CSS puro com variáveis (sem frameworks de UI)
- fetch API nativa (sem axios)
- Docker + Nginx (produção)

## Estrutura

```
src/
  components/
    Header.jsx / Header.css   — nav bar com links ativos e logout
    PrivateRoute.jsx          — redireciona para /login se sem token
  pages/
    LoginPage.jsx             — POST /token (form-urlencoded)
    RegisterPage.jsx          — POST /account (JSON)
    DashboardPage.jsx         — GET /reports/monthly com filtro mês/ano
    TransactionsPage.jsx      — listagem, criação e importação CSV
    CategoriesPage.jsx        — CRUD completo de categorias
  utils/
    categoryColors.js         — paleta de cores por category_id (id % 8)
  index.css                   — design system (variáveis, layout, componentes)
  main.jsx                    — entry point
  App.jsx                     — BrowserRouter + Routes
```

## Rotas

```
/login          → LoginPage      (pública)
/register       → RegisterPage   (pública)
/               → DashboardPage  (privada)
/transactions   → TransactionsPage (privada)
/categories     → CategoriesPage   (privada)
```

## Design system

Variáveis em `index.css` (`:root`):
- `--accent: #2a7a38` — verde principal
- `--bg: #f4f7f4` — fundo levemente esverdeado
- `--surface: #ffffff` — cards e painéis
- `--danger: #dc2626` / `--success: #16a34a` — expense/income

## Decisões relevantes

- **Token:** armazenado em `localStorage` com chave `token`
- **Auth header:** `Authorization: Bearer <token>` em todas as rotas privadas
- **Status de transação:** aceita `done` ou `provision` (não `pending`)
- **Métodos de pagamento usados:** `credit_card` e `account`
- **Income:** força `payment_method = 'account'` automaticamente no form
- **Categorias:** recebem cor consistente via `categoryColor(id)` — usado em transações e na listagem de categorias

---

## Backend API Reference

### Authentication

**Login** — `POST /token`
- Body: `application/x-www-form-urlencoded` com `username` (email) e `password`
- Resposta: `{ "access_token": "...", "token_type": "bearer" }`
- Todas as rotas protegidas exigem header: `Authorization: Bearer <token>`

**Cadastro** — `POST /account` (sem auth)
- Body JSON: `{ "email": "...", "name": "...", "password": "..." }`

---

### Transactions — `/transactions`

**Listar** — `GET /transactions` (auth)
Query params opcionais: `month`, `year`, `type` (expense|income), `status`, `payment_method`, `category_id`

**Criar** — `POST /transactions` (auth)
```json
{
  "transaction_type": "expense" | "income",
  "description": "string",
  "amount": 0.00,
  "transaction_date": "YYYY-MM-DD",
  "status": "done" | "provision",
  "payment_method": "credit_card" | "account" | null,
  "is_recurring": false,
  "creditcard": "1234" | null,
  "category_id": 1 | null
}
```

**Atualizar** — `PATCH /transactions/{id}` — campos opcionais
**Deletar** — `DELETE /transactions/{id}` — retorna 204

**Importar CSV** — `POST /transactions/import/csv` (auth)
- `multipart/form-data` com campo `file`
- Query params: `transaction_type`, `status`, `payment_method`
- Resposta: `{ "imported": 5, "skipped": 1 }`

---

### Categories — `/categories`

**Listar** — `GET /categories` (auth)
**Criar** — `POST /categories` — `{ "name": "Alimentação", "pattern": "mercado|ifood" }`
**Atualizar** — `PATCH /categories/{id}`
**Deletar** — `DELETE /categories/{id}` — retorna 204

`pattern` é regex opcional para categorização automática na importação CSV.

---

### Reports — `/reports`

**Relatório mensal** — `GET /reports/monthly?month=5&year=2026` (auth)

```json
{
  "period": { "year": 2026, "month": 5 },
  "summary": { "income_total": "3000.00", "expenses_total": "1500.00", "difference": "1500.00" },
  "credit_card_total": "800.00",
  "current_balance": "1500.00",
  "by_category": [{ "name": "Alimentação", "total": "400.00", "percentage": 26.7 }],
  "provisions": {
    "to_receive": { "total": "500.00", "transactions": [] },
    "to_pay": { "total": "200.00", "transactions": [] }
  }
}
```
