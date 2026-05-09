from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import MenuItem
from schemas import MenuItemResponse, MenuItemCreate

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("", response_model=List[MenuItemResponse])
def get_menu(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).filter(MenuItem.is_available == True)
    if category:
        query = query.filter(MenuItem.category == category)
    return query.all()


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=MenuItemResponse)
def create_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    db_item = MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}/availability", response_model=MenuItemResponse)
def update_availability(item_id: int, is_available: bool = None, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if is_available is not None:
        item.is_available = is_available
    db.commit()
    db.refresh(item)
    return item