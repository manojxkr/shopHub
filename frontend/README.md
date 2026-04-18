# BookStore Frontend (React)

This is a React frontend that integrates with your existing Spring Boot BookStore backend.

## Backend expectations

- Backend runs on `http://localhost:8081`
- API base path is `/api`
- Auth endpoints:
  - `POST /api/register`
  - `POST /api/login` → returns `{ data: { token: "..." } }`
- Books:
  - `GET /api/books` (public)
  - `GET /api/books/search` (public)
  - `GET /api/books/{id}` (public)
  - `POST /api/books` (ADMIN)
  - `PUT /api/book/{id}` (ADMIN)
  - `DELETE /api/books/{id}` (ADMIN)
- Orders:
  - `POST /api/orders` (USER)
  - `GET /api/orders/my` (USER)
  - `GET /api/orders` (ADMIN)
  - `PUT /api/orders/{id}/status` (ADMIN)

## Configure API base URL

Copy `.env.example` to `.env` and adjust:

- `VITE_API_BASE_URL=http://localhost:8081/api`

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Role detection note

Your backend JWT token contains only the email (subject), not the role.
So the frontend infers role by calling:

- `GET /api/orders/my` → if allowed, the user is `ROLE_USER`
- else `GET /api/orders` → if allowed, the user is `ROLE_ADMIN`

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
