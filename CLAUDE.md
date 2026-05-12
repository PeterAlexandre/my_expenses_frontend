# My Expenses — Frontend

React frontend for the `my_expenses_api` FastAPI backend.

## Context

- **Backend repo:** `~/dev/my_expenses_api`
- **Backend base URL (dev):** `http://localhost:8000`
- **API docs (when running):** `http://localhost:8000/docs`

## Learning context

Peter is learning React from scratch (basic HTML/CSS background). We are following a structured course approach, building this frontend module by module. Explain concepts from first principles, using backend/Python analogies when helpful. Do not skip steps or introduce abstractions before they are needed in the curriculum.

**Curriculum progress:** track which modules are done as we go.
- [ ] Módulo 1 — Setup e Primeiro Componente
- [ ] Módulo 2 — Props e Estado
- [ ] Módulo 3 — Roteamento
- [ ] Módulo 4 — Integração com API (fetch + useEffect)
- [ ] Módulo 5 — Autenticação (Login, Cadastro, JWT)
- [ ] Módulo 6 — CRUD de Categorias
- [ ] Módulo 7 — Listagem de Transações com Filtros
- [ ] Módulo 8 — Cadastro e Importação de Transações
- [ ] Módulo 9 — Relatório Mensal

## Tech stack

- Vite + React 18
- React Router v6
- CSS puro / CSS Modules (sem frameworks de UI por ora)
- fetch API nativa (sem axios por enquanto)

## Planned routes

```
/login          → LoginPage
/register       → RegisterPage
/               → DashboardPage (relatório mensal)
/transactions   → TransactionsPage
/categories     → CategoriesPage
```

---

## Backend API Reference

### Authentication

**Login** — `POST /token`
- Body: `application/x-www-form-urlencoded` com `username` (email) e `password`
- Resposta: `{ "access_token": "...", "token_type": "bearer" }`
- Todas as rotas protegidas exigem header: `Authorization: Bearer <token>`

**Cadastro** — `POST /account` (sem auth)
- Body JSON: `{ "email": "...", "name": "...", "password": "..." }`

**Perfil** — `GET /account` (auth)
**Atualizar** — `PATCH /account` (auth)

---

### Transactions — `/transactions`

**Listar** — `GET /transactions` (auth)
Query params opcionais:
- `month` (1-12), `year` (≥2000)
- `type`: `expense` | `income`
- `status`: `done` | `pending`
- `payment_method`: `credit_card` | `debit_card` | `pix` | `cash` | `account`
- `category_id`: int

**Criar** — `POST /transactions` (auth)
```json
{
  "transaction_type": "expense" | "income",
  "description": "string",
  "amount": 0.00,
  "transaction_date": "YYYY-MM-DD",
  "status": "done" | "pending",
  "payment_method": "credit_card" | "debit_card" | "pix" | "cash" | "account" | null,
  "is_recurring": false,
  "creditcard": "1234" | null,
  "category_id": 1 | null
}
```

**Detalhe** — `GET /transactions/{id}` (auth)
**Atualizar** — `PATCH /transactions/{id}` (auth) — mesmos campos de criação, todos opcionais
**Deletar** — `DELETE /transactions/{id}` (auth) — retorna 204

**Importar CSV** — `POST /transactions/import/csv` (auth)
- `multipart/form-data` com campo `file` (arquivo .csv)
- Query params: `transaction_type`, `status`, `payment_method`
- Resposta: `{ "imported": 5, "skipped": 1 }`

**TransactionRead** (resposta):
```json
{
  "transaction_id": 1,
  "transaction_type": "expense",
  "description": "Mercado",
  "amount": "150.00",
  "transaction_date": "2026-05-10",
  "status": "done",
  "payment_method": "credit_card",
  "is_recurring": false,
  "creditcard": "1234",
  "category_id": 2,
  "import_batch_id": null,
  "import_batch_row": null,
  "user_id": 1
}
```

---

### Categories — `/categories`

**Listar** — `GET /categories` (auth)
**Criar** — `POST /categories` (auth)
```json
{ "name": "Alimentação", "pattern": "mercado|ifood" }
```
`pattern` é regex opcional usado para categorização automática na importação CSV.

**Detalhe** — `GET /categories/{id}` (auth)
**Atualizar** — `PATCH /categories/{id}` (auth) — campos opcionais
**Deletar** — `DELETE /categories/{id}` (auth) — retorna 204

**CategoryRead** (resposta):
```json
{ "category_id": 1, "name": "Alimentação", "pattern": "mercado", "user_id": 1 }
```

---

### Reports — `/reports`

**Relatório mensal** — `GET /reports/monthly` (auth)
Query params: `month` (1-12), `year` (≥2000) — padrão: mês/ano atual

Resposta:
```json
{
  "period": { "year": 2026, "month": 5 },
  "summary": {
    "income_total": "3000.00",
    "expenses_total": "1500.00",
    "difference": "1500.00"
  },
  "credit_card_total": "800.00",
  "current_balance": "1500.00",
  "by_category": [
    { "name": "Alimentação", "total": "400.00", "percentage": 26.7 }
  ],
  "provisions": {
    "to_receive": { "total": "500.00", "transactions": [...] },
    "to_pay":    { "total": "200.00", "transactions": [...] }
  }
}
```
