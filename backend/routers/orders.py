from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional, List
from datetime import datetime, date
import json
import asyncio

from sse_starlette.sse import EventSourceResponse
from database import get_db, SessionLocal
from models import Order, OrderStatus
from schemas import OrderCreate, OrderResponse, OrderListResponse, OrderItem

router = APIRouter(prefix="/orders", tags=["orders"])

_clients: List[asyncio.Queue] = []
_clients_lock = asyncio.Lock()


def _broadcast_orders():
    async def _push():
        db = SessionLocal()
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        all_orders = [order_to_dict(o) for o in orders]
        db.close()
        payload = json.dumps(all_orders)
        async with _clients_lock:
            clients = list(_clients)
        for cq in clients:
            try:
                cq.put_nowait(payload)
            except Exception:
                pass
    try:
        loop = asyncio.get_running_loop()
        loop.call_soon_threadsafe(lambda: asyncio.create_task(_push()))
    except RuntimeError:
        pass


def get_next_token(db: Session) -> int:
    today = date.today()
    max_token = db.query(func.max(Order.token_number)).filter(
        cast(Order.created_at, Date) == today
    ).scalar()
    return (max_token or 0) + 1


def json_to_items(data: str) -> list:
    return json.loads(data)


def order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "token": order.token_number,
        "status": order.status,
        "total_amount": order.total_amount,
        "items": json_to_items(order.items),
        "created_at": order.created_at.isoformat(),
        "payment_method": order.payment_method
    }


async def orders_event_generator(request: Request):
    client_queue = asyncio.Queue()
    async with _clients_lock:
        _clients.append(client_queue)
    db = SessionLocal()
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    all_orders = [order_to_dict(o) for o in orders]
    db.close()
    yield {"event": "init", "data": json.dumps(all_orders)}
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                update = await asyncio.wait_for(client_queue.get(), timeout=3)
                yield {"event": "update", "data": update}
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": ":"}
    except Exception:
        pass
    finally:
        async with _clients_lock:
            if client_queue in _clients:
                _clients.remove(client_queue)


@router.get("/stream")
async def orders_stream(request: Request):
    return EventSourceResponse(orders_event_generator(request))


@router.post("", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    roll_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    token = get_next_token(db)
    total = order.total if order.total is not None else sum(item.price * item.item_qty for item in order.items)
    response_items = [
        {"menu_item_id": item.menu_item_id, "name": item.name, "qty": item.item_qty, "price": item.price}
        for item in order.items
    ]
    payment_method = order.payment_method or "cash"
    initial_status = "preparing" if payment_method == "upi" else "pending"
    db_order = Order(
        token_number=token,
        status=initial_status,
        total_amount=total,
        items=json.dumps(response_items),
        student_roll_number=roll_number,
        payment_method=payment_method
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    _broadcast_orders()
    result = OrderResponse(
        token=db_order.token_number,
        status=db_order.status,
        total=db_order.total_amount,
        items=[OrderItem(menu_item_id=i.get("menu_item_id"), name=i["name"], qty=i["qty"], price=i["price"]) for i in response_items],
        created_at=db_order.created_at
    )
    return result


@router.get("", response_model=List[OrderListResponse])
def list_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    from sqlalchemy import func
    query = db.query(Order)
    if status:
        query = query.filter(func.lower(Order.status) == status.lower())
    orders = query.order_by(Order.created_at.desc()).all()
    return [
        OrderListResponse(
            id=o.id,
            token=o.token_number,
            status=o.status.lower(),
            total_amount=o.total_amount,
            items=json_to_items(o.items),
            created_at=o.created_at
        )
        for o in orders
    ]


@router.get("/{token}", response_model=OrderResponse)
def get_order_by_token(token: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.token_number == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse(
        token=order.token_number,
        status=order.status,
        total=order.total_amount,
        items=json_to_items(order.items),
        created_at=order.created_at
    )


@router.patch("/{token}/confirm")
def confirm_order(token: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.token_number == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    current = order.status.lower()
    if current == "picked_up":
        raise HTTPException(status_code=400, detail="Order is already complete")
    if current != "pending":
        return {"message": "Order already processed", "status": order.status, "token": order.token_number}
    order.status = "preparing"
    db.commit()
    db.refresh(order)
    _broadcast_orders()
    return {"message": "Order confirmed", "status": order.status}


@router.patch("/{token}/ready")
def mark_ready(token: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.token_number == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "preparing":
        raise HTTPException(status_code=400, detail="Invalid status transition")
    order.status = "ready"
    db.commit()
    db.refresh(order)
    _broadcast_orders()
    return {"message": "Order is ready", "status": order.status}


@router.patch("/{token}/pickup")
def mark_picked_up(token: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.token_number == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "ready":
        raise HTTPException(status_code=400, detail="Invalid status transition")
    order.status = "picked_up"
    db.commit()
    db.refresh(order)
    _broadcast_orders()
    return {"message": "Order picked up", "status": order.status}