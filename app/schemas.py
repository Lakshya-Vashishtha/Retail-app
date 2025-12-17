from typing import List
from pydantic import BaseModel, EmailStr
from datetime import date

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    username: str
    password:str

class USER(UserCreate):
    id: int
    username:str
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int | str

class ProductBase(BaseModel):
    name: str
    Brand: str | None = None
    price: float
    quantity: int
    category: str | None = None
    expiry_date: date

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    product_id: int
    quantity_sold: int
    sale_date: date
    total_price: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int

    class Config:
        orm_mode = True

class AskRequest(BaseModel):
    question: str
    k: int = 5

class AskResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
