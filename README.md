# My Expenses — Frontend

Interface web para controle de finanças pessoais. Consome a API REST `my_expenses_api` (FastAPI).

## Funcionalidades

- Login e cadastro de conta
- Dashboard com relatório mensal — receitas, despesas, saldo, gastos por categoria
- Listagem de transações com filtros por mês, ano e tipo
- Cadastro manual de transações e importação via CSV
- CRUD completo de categorias com padrão regex para categorização automática

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- [React Router v6](https://reactrouter.com/)
- CSS puro com variáveis (sem framework de UI)
- Docker + Nginx para produção

## Pré-requisitos

- Node 20+
- Backend `my_expenses_api` rodando em `http://localhost:8000`

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

## Produção com Docker

```bash
docker compose up --build
```

Acesse em `http://localhost:3000`.

O build usa multi-stage: Node compila os estáticos, Nginx os serve com suporte a rotas SPA.

## Variáveis de ambiente

Por padrão a API é acessada em `http://localhost:8000`. Para alterar, atualize a URL base nos arquivos de página em `src/pages/`.

## Estrutura

```
src/
  components/     — Header, PrivateRoute
  pages/          — uma página por rota
  utils/          — utilitários compartilhados (ex: cores de categoria)
  index.css       — design system global
```
