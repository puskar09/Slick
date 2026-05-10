from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List

from database import get_db
from models import Rating, MenuItem
from schemas import RatingCreate, RatingResponse, RatingSummary

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.post("", response_model=RatingResponse)
def submit_rating(rating_data: RatingCreate, db: Session = Depends(get_db)):
    item_id = rating_data.menu_item_id

    if item_id == 0 and rating_data.name:
        menu_item = db.query(MenuItem).filter(MenuItem.name == rating_data.name).first()
        if menu_item:
            item_id = menu_item.id
        else:
            raise HTTPException(status_code=404, detail="Menu item not found")

    existing = db.query(Rating).filter(
        Rating.menu_item_id == item_id,
        Rating.token_number == rating_data.token_number
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Rating already submitted for this item and order")

    db_rating = Rating(
        menu_item_id=item_id,
        token_number=rating_data.token_number,
        rating=rating_data.rating
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating


@router.get("/summary", response_model=List[RatingSummary])
def get_rating_summary(db: Session = Depends(get_db)):
    results = db.query(
        Rating.menu_item_id,
        func.sum(case((Rating.rating == 1, 1), else_=0)).label("thumbs_up"),
        func.sum(case((Rating.rating == 0, 1), else_=0)).label("thumbs_down"),
        func.count(Rating.id).label("total")
    ).group_by(Rating.menu_item_id).all()

    return [
        RatingSummary(
            menu_item_id=r.menu_item_id,
            thumbs_up=r.thumbs_up or 0,
            thumbs_down=r.thumbs_down or 0,
            total=r.total
        )
        for r in results
    ]