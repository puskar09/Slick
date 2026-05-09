# Slick — Frontend

Campus canteen pre-order system. React + Vite frontend.

## Stack
- React 19 + Vite 8
- Tailwind CSS v4 with custom amber/black theme tokens
- Framer Motion — slow-fade transitions on every page and card
- Zustand with persist middleware — all state survives reloads via localStorage
- qrcode.react — QR code generation for order tokens
- lucide-react — icons
- HashRouter — works from file:// or any static host

## Design System
- Background: #0a0a0a (pure black)
- Accent: #f59e0b (warm amber) — CTAs, highlights, token numbers
- Available: #22c55e (neon green)
- Unavailable: #ef4444 (red)
- Cards: glassmorphism — backdrop-blur, translucent borders, subtle glow
- Typography: bold editorial headlines, thin subtext
- Layout: asymmetric grids, lots of breathing room

## Project Structure
```
src/
├── components/         # GlassCard, Header, PageTransition
├── data/
│   └── menu.js         # 15 hardcoded menu items across 4 categories
├── pages/
│   ├── student/
│   │   ├── Menu.jsx        # Browse + add to cart
│   │   ├── OrderSummary.jsx # Bill + token number + QR code
│   │   └── OrderStatus.jsx  # Token search + live queue
│   └── admin/
│       ├── CashierPanel.jsx # Confirm payments
│       └── KitchenPanel.jsx # Mark ready / picked up
├── store/
│   ├── useCartStore.js     # Zustand cart state
│   └── useOrderStore.js    # Orders, tokens, queue
└── App.jsx                 # HashRouter routes
```

## Routes
- Student: `/#/student/menu`, `/#/student/cart`, `/#/student/status`
- Admin: `/#/admin/cashier`, `/#/admin/kitchen`

## Run
```bash
npm install
npm run dev      # localhost:5173
npm run build    # production build → dist/
```

## Current State
Fully functional frontend demo. All state in localStorage — no backend yet.
- Students can browse menu, add items, place orders, get token + QR code
- Admins can confirm payment (Cashier Panel) and mark orders ready (Kitchen Panel)

## Backend Integration (next phase)
Replace all localStorage calls with axios API calls to FastAPI backend at `http://localhost:8000`.
Endpoints to connect:
- `POST /orders` — place order
- `GET /orders` — list all orders (admin)
- `PATCH /orders/{token}/confirm` — cashier confirms payment
- `PATCH /orders/{token}/ready` — kitchen marks ready
- `GET /menu` — fetch live menu

## Notes for AI Agent
- Always maintain the dark glassmorphism aesthetic — never use white backgrounds or boxy cards
- Framer Motion is already installed — use it for any new animations
- Zustand stores are in /src/store/ — always update state there, never local component state for shared data
- Token numbers are integers, reset daily
- QR code encodes the token number as a string
