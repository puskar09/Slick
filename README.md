# Slick — Campus Canteen, Reimagined

> Eliminate canteen queues. Real-time order tracking. One-click campus food.

Slick is a modern full-stack campus canteen app that connects students with kitchen staff through a seamless real-time workflow. Students browse the menu, place orders, and track their token status — all from their phone. Kitchen and cashier staff manage the queue with zero-friction real-time panels.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Framer Motion |
| Backend | FastAPI, SQLAlchemy, SSE (Server-Sent Events) |
| Database | SQLite (local) / Neon PostgreSQL (production) |
| Auth | Simple roll-number + password (auto-registration) |
| Deploy | Vercel (frontend), Render (backend) |

---

## Key Features

### Student Flow
- **Access Gatekeeper** — Single entry point. Students enter access code `0000` to reach the menu. Staff use `1111` for admin panels.
- **Real-time Menu** — Browse by category with live Unsplash food imagery.
- **Smart Cart** — Add items, adjust quantities, clear cart.
- **Dual Payment** — Choose **UPI** (instant, simulated QR processing) to skip the cashier and go straight to the kitchen, or **Cash at Counter** which routes the order to the Cashier panel first.
- **Order Tracking** — Auto-loads token from session, polls every 3 seconds + live SSE updates. Status messages: *Waiting for payment*, *Getting ready (5–10 min)*, *Already ready!*, *Order completed*.
- **Order History** — Persistent per-student order history with status badges.

### Admin Panels
- **Cashier Panel** — Shows all pending cash orders. Confirming sends the order to the kitchen instantly via SSE. Optimistic UI removes the card before SSE even delivers.
- **Kitchen Panel** — Two-column Kanban: **Preparing** (amber, token cards with elapsed timer) and **Ready for Pickup** (green). One click moves an order between columns.
- **Real-time SSE Sync** — All panels receive live updates the moment any order changes status. Automatic reconnection with 2-second backoff.

---

## Architecture

```
frontend/          React 19 + Vite + Tailwind v4 + Zustand
  src/
    api/           Axios client, SSE subscription helper
    components/    StudentHeader, AdminHeader, LoginModal, CheckoutModal
    pages/
      student/    Menu, OrderSummary, OrderStatus, Profile
      admin/      CashierPanel, KitchenPanel
    store/         useCartStore, useAuthStore (Zustand + persist)

backend/          FastAPI + SQLAlchemy
  routers/
    orders.py     POST/GET/PATCH /orders, GET /orders/stream (SSE)
    auth.py       POST /auth/login, GET /auth/history/{roll}
    menu.py       GET /menu
  models.py        Student, MenuItem, Order (SQLAlchemy)
  database.py     Engine (env-driven: SQLite ↔ Neon PostgreSQL)
  main.py         FastAPI app, CORS, lifespan menu seeding
```

### Order State Machine

```
[Student places order]
        |
        +-- payment_method=upi  -->  pending --> preparing --> ready --> picked_up
        |                                  (cash route)
        +-- payment_method=cash -->  pending --> (cashier confirms) --> preparing --> ready --> picked_up
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend starts at `http://localhost:8000`. On first run it seeds the menu automatically.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

### Access Codes
| Code | Destination |
|---|---|
| `0000` | Student Menu |
| `1111` | Admin (Cashier) Panel |

### Environment Variables
Create `frontend/.env` for production API URL:
```
VITE_API_URL=https://your-backend.render.com
```

Create `backend/.env` for production database:
```
DATABASE_URL=postgresql://user:pass@host/dbname
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login with `{roll_number, password}` |
| `GET` | `/auth/history/{roll}` | Order history for a student |
| `GET` | `/menu` | Full menu items |
| `POST` | `/orders` | Place order (include `payment_method`) |
| `GET` | `/orders` | List all orders (admin) |
| `GET` | `/orders/{token}` | Get single order by token |
| `PATCH` | `/orders/{token}/confirm` | Cashier confirms → kitchen |
| `PATCH` | `/orders/{token}/ready` | Kitchen marks ready |
| `PATCH` | `/orders/{token}/pickup` | Mark picked up |
| `GET` | `/orders/stream` | SSE real-time order stream |

---

## Production Deploy

### Frontend (Vercel)
```bash
vercel deploy
```
Set `VITE_API_URL` environment variable to your backend URL.

### Backend (Render)
1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add `DATABASE_URL` environment variable (Neon PostgreSQL connection string)

---

## License

MIT