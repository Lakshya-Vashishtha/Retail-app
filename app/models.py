from .database import Base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    Brand = Column(String)
    category = Column(String, index=True)
    price = Column(Float)
    cost_price = Column(Float)
    quantity = Column(Integer)
    expiry_date = Column(Date)
    sales = relationship("Sale", back_populates="product")

class Sale(Base):
    __tablename__ = 'sales'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity_sold = Column(Integer)
    sale_date = Column(Date)
    total_price = Column(Float)
    product = relationship("Product", back_populates="sales")