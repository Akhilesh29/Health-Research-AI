# HealthGuide AI 🏥

An AI-powered symptom checker built with React, Node.js, PostgreSQL, and Claude.

![HealthGuide AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-red?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)

## Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Query |
| Backend    | Node.js + Express + TypeScript + Prisma ORM      |
| Database   | PostgreSQL                                       |
| AI         | Anthropic Claude (`@anthropic-ai/sdk`)           |
| Auth       | JWT + bcryptjs                                   |
| Deploy FE  | Vercel                                           |
| Deploy BE  | Railway                                          |
| Deploy DB  | Railway PostgreSQL                               |

---

## Project Structure

```
healthguide-ai/
├── backend/
│   ├── src/
│   │   ├── config/env.ts            # Env validation with Zod
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Signup, login, me
│   │   │   └── symptom.controller.ts # AI analysis + CRUD
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT guard
│   │   │   └── error.middleware.ts  # Global error handler
│   │   ├── routes/index.ts          # All routes
│   │   ├── services/ai.service.ts   # Claude API integration
│   │   ├── types/index.ts
│   │   ├── app.ts                   # Express + helmet + cors + rate-limit
│   │   └── server.ts                # Entry point
│   ├── prisma/schema.prisma         # User + SymptomCheck models
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts            # Axios + auth interceptors
    │   │   ├── auth.ts
    │   │   └── symptoms.ts
    │   ├── store/authStore.ts       # Zustand auth state
    │   ├── pages/
    │   │   ├── AuthPage.tsx         # Login + Signup
    │   │   ├── DashboardPage.tsx    # Stats + recent activity
    │   │   ├── CheckerPage.tsx      # Symptom input + AI result
    │   │   ├── HistoryPage.tsx      # Paginated history
    │   │   └── ProfilePage.tsx
    │   ├── components/
    │   │   ├── Layout.tsx           # Sidebar navigation
    │   │   └── SymptomResult.tsx    # AI analysis display
    │   ├── types/index.ts
    │   └── App.tsx
    ├── public/favicon.svg           # Red cross logo
    ├── vercel.json
    ├── .env.example
    └── package.json
```

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or Docker)
- Anthropic API key — [get one here](https://console.anthropic.com)

### 1. Clone & install

```bash
git clone <your-repo>
cd healthguide-ai

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthguide"
JWT_SECRET="your-super-secret-32-char-minimum-key"
ANTHROPIC_API_KEY="sk-ant-..."
FRONTEND_URL="http://localhost:5173"
```

### 3. Set up the database

```bash
cd backend
npm run db:push        # Push schema to DB
npm run db:generate    # Generate Prisma client
```

### 4. Run the backend

```bash
cd backend
npm run dev
# → Running on http://localhost:4000
```

### 5. Configure frontend

```bash
cd frontend
cp .env.example .env
# Leave VITE_API_URL empty to use Vite proxy (points to localhost:4000)
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
# → Running on http://localhost:5173
```

---

## API Reference

### Auth

| Method | Endpoint         | Auth | Body                              |
|--------|------------------|------|-----------------------------------|
| POST   | `/api/auth/signup` | No  | `{ name, email, password }`      |
| POST   | `/api/auth/login`  | No  | `{ email, password }`            |
| GET    | `/api/auth/me`     | Yes | —                                 |

### Symptoms

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/symptoms`       | Yes  | Run AI analysis          |
| GET    | `/api/symptoms`       | Yes  | List (paginated)         |
| GET    | `/api/symptoms/stats` | Yes  | Dashboard stats          |
| GET    | `/api/symptoms/:id`   | Yes  | Get single check         |
| DELETE | `/api/symptoms/:id`   | Yes  | Delete check             |

**POST `/api/symptoms` body:**
```json
{
  "symptoms": ["headache", "fever"],
  "age": 28,
  "gender": "female",
  "severity": "moderate",
  "duration": "2 days"
}
```

---

## Deployment

### Backend → Railway

1. Create a new Railway project
2. Add a **PostgreSQL** service
3. Add a **Web Service** pointing to `backend/`
4. Set environment variables (see `.env.example`)
5. Railway auto-detects the `Dockerfile`

The `CMD` in Dockerfile runs `prisma migrate deploy` before starting the server.

### Frontend → Vercel

1. Import the repo into Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app/api
   ```
4. Deploy — `vercel.json` handles SPA routing

---

## Security

- Helmet.js for HTTP security headers
- CORS restricted to frontend origin
- Rate limiting: 100 req/15 min globally, 20 AI analyses/hour
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- All symptom routes protected by JWT middleware
- Request body limited to 10kb
- Input validation with Zod on all endpoints

---

## License

MIT
