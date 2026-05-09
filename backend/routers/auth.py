from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import json

from database import get_db
from models import Student, Order, OrderStatus
from schemas import StudentCreate, StudentResponse, OrderListResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(credentials: StudentCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.roll_number == credentials.roll_number).first()
    if student:
        if student.password != credentials.password:
            raise HTTPException(status_code=401, detail="Incorrect password")
        return {"roll_number": student.roll_number, "message": "Login successful"}
    student = Student(roll_number=credentials.roll_number, password=credentials.password)
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"roll_number": student.roll_number, "message": "Account created and logged in"}


@router.get("/history/{roll_number}")
def get_order_history(roll_number: str, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(
        Order.student_roll_number == roll_number
    ).order_by(Order.created_at.desc()).all()
    return [
        {
            "id": o.id,
            "token": o.token_number,
            "status": o.status,
            "total_amount": o.total_amount,
            "items": json.loads(o.items),
            "created_at": o.created_at.isoformat()
        }
        for o in orders
    ]