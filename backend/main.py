from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, SessionLocal, Base
from models import MenuItem, Student


MENU_ITEMS = [
    {"name": "Veg Thali", "category": "Thali", "price": 80.0, "description": "Rice, dal, 2 rotis, sabzi, salad", "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"},
    {"name": "Paneer Thali", "category": "Thali", "price": 100.0, "description": "Rice, dal, 2 rotis, paneer sabzi, salad", "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"},
    {"name": "Non-Veg Thali", "category": "Thali", "price": 120.0, "description": "Rice, dal, 2 rotis, chicken curry, salad", "image_url": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400"},
    {"name": "Masala Chai", "category": "Beverages", "price": 20.0, "description": "Spiced Indian tea", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"},
    {"name": "Filter Coffee", "category": "Beverages", "price": 25.0, "description": "South Indian filter coffee", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"},
    {"name": "Masala Pepsi", "category": "Beverages", "price": 30.0, "description": "Cold drink with masala", "image_url": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400"},
    {"name": "Samosa", "category": "Snacks", "price": 15.0, "description": "Crispy potato stuffed pastry", "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"},
    {"name": "Vada Pav", "category": "Snacks", "price": 20.0, "description": "Mumbai style potato burger", "image_url": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"},
    {"name": "Pav Bhaji", "category": "Snacks", "price": 50.0, "description": "Mashed veggie curry with butter pav", "image_url": "https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=400"},
    {"name": "Idli Sambar", "category": "South Indian", "price": 40.0, "description": "Steamed rice cakes with lentil soup", "image_url": "https://images.unsplash.com/photo-1589301760014-d92938567809?w=400"},
    {"name": "Dosa", "category": "South Indian", "price": 50.0, "description": "Crispy rice lentil crepe", "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400"},
    {"name": "Masala Dosa", "category": "South Indian", "price": 60.0, "description": "Dosa with spiced potato filling", "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400"},
    {"name": "Plain Rice", "category": "Rice", "price": 30.0, "description": "Steamed basmati rice", "image_url": "https://images.unsplash.com/photo-1516684732162-798a3002c310?w=400"},
    {"name": "Jeera Rice", "category": "Rice", "price": 40.0, "description": "Cumin flavored rice", "image_url": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400"},
    {"name": "Biryani", "category": "Rice", "price": 80.0, "description": "Fragrant saffron rice with veggies", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    count = db.query(MenuItem).count()
    if count == 0:
        for item in MENU_ITEMS:
            db_item = MenuItem(**item, is_available=True)
            db.add(db_item)
        db.commit()
    db.close()
    yield


app = FastAPI(title="Slick API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import menu
from routers.orders import router as orders_router
from routers.auth import router as auth_router
from routers.ratings import router as ratings_router

app.include_router(menu.router)
app.include_router(orders_router)
app.include_router(auth_router)
app.include_router(ratings_router)


@app.get("/")
def root():
    return {"message": "Slick API is running"}