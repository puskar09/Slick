# Slick — Backend

Campus canteen pre-order system. FastAPI backend.

## Stack
- Python 3.11+
- FastAPI — REST API framework
- SQLAlchemy — ORM
- SQLite — database (file: slick.db, no setup needed)
- Uvicorn — ASGI server
- python-dotenv — env vars

## Run
```bash
pip install fastapi uvicorn sqlalchemy python-dotenv
uvicorn main:app --reload --port 8000
```

## Project Structure
```
backend/
├── main.py           # FastAPI app entry, CORS, router includes
├── database.py       # SQLAlchemy engine + session + Base
├── models.py         # SQLAlchemy ORM models
├── schemas.py        # Pydantic request/response schemas
├── routers/
│   ├── menu.py       # GET /menu
│   └── orders.py     # CRUD for orders
└── slick.db          # SQLite database (auto-created on first run)
```

## Database Models

### MenuItem
- id, name, category, price, description, is_available, image_url

### Order
- id, token_number (int, resets daily), status, total_amount, created_at, items (JSON)

### OrderStatus enum
- PENDING → PAID → PREPARING → READY → PICKED_UP

## API Endpoints

### Menu
- `GET /menu` — list all available menu items
- `GET /menu/{id}` — single item
- `POST /menu` — add item (admin)
- `PATCH /menu/{id}` — update availability (admin)

### Orders
- `POST /orders` — create new order, returns token number
- `GET /orders` — list all orders (admin, supports ?status= filter)
- `GET /orders/{token}` — get order by token number
- `PATCH /orders/{token}/confirm` — cashier confirms payment → status: PAID
- `PATCH /orders/{token}/ready` — kitchen marks ready → status: READY
- `PATCH /orders/{token}/pickup` — mark picked up → status: PICKED_UP

## Token Number Logic
- Auto-incrementing integer per day
- Resets to 1 at midnight
- Stored in DB, calculated on order creation
- Format: plain integer (e.g. 42), encoded as string in QR code

## CORS
- Allowed origins: http://localhost:5173 (React dev server)
- Allow all methods and headers

## Response Format
All endpoints return JSON. Example order response:
```json
{
  "token": 42,
  "status": "PENDING",
  "total": 120.00,
  "items": [
    { "name": "Veg Thali", "qty": 1, "price": 80.00 },
    { "name": "Chai", "qty": 2, "price": 20.00 }
  ],
  "created_at": "2026-05-09T14:30:00Z"
}
```

## Notes for AI Agent
- Always use SQLAlchemy sessions via dependency injection (Depends(get_db))
- Never use raw SQL — always go through ORM models
- Token number must be unique per day — query max token for today before inserting
- All status transitions are one-way: PENDING → PAID → PREPARING → READY → PICKED_UP
- CORS middleware must always be present — frontend is on a different port
- SQLite file (slick.db) is auto-created — never commit it to git
- Keep main.py clean — all route logic goes in routers/
- Use Pydantic v2 syntax for schemas (model_config instead of class Config)
