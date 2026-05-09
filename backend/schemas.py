from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrderItem(BaseModel):
    menu_item_id: Optional[int] = Field(default=None, validation_alias="menu_item_id")
    quantity: Optional[int] = Field(default=None, validation_alias="quantity")
    name: str
    price: float
    qty: Optional[int] = Field(default=None, validation_alias="qty")

    @property
    def item_qty(self) -> int:
        return self.quantity if self.quantity is not None else (self.qty or 1)

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class StudentCreate(BaseModel):
    roll_number: str
    password: str


class StudentResponse(BaseModel):
    roll_number: str
    message: str
    menu_item_id: Optional[int] = Field(default=None, validation_alias="menu_item_id")
    quantity: Optional[int] = Field(default=None, validation_alias="quantity")
    name: str
    price: float
    qty: Optional[int] = Field(default=None, validation_alias="qty")

    @property
    def item_qty(self) -> int:
        return self.quantity if self.quantity is not None else (self.qty or 1)

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }


class MenuItemCreate(BaseModel):
    name: str
    category: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: Optional[str]
    is_available: bool
    image_url: Optional[str]

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    items: list[OrderItem]
    total: Optional[float] = None
    payment_method: Optional[str] = Field(default=None, validation_alias="payment_method")


class OrderResponse(BaseModel):
    token: int
    status: str
    total: float
    items: list[OrderItem]
    created_at: datetime
    payment_method: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    id: int
    token: int
    status: str
    total_amount: float
    items: list[OrderItem]
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: str