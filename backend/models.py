from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey
from datetime import datetime
import enum

from database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    READY = "READY"
    PICKED_UP = "PICKED_UP"


class Student(Base):
    __tablename__ = "students"

    roll_number = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    token_number = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(Integer, nullable=False, index=True)
    status = Column(String, default=OrderStatus.PENDING.value)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    items = Column(String, nullable=False)
    student_roll_number = Column(String, ForeignKey("students.roll_number"), nullable=True)
    payment_method = Column(String, nullable=True)