from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from .. import models, schemas, oauth2
from ..database import get_db
from datetime import date, timedelta
from typing import List

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(oauth2.get_current_user)],
)

@router.get("/sales-analytics")
def sales_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    # 1. Total Sales Value
    total_sales = db.query(func.sum(models.Sale.total_price)).scalar() or 0
    
    # 2. Total Products Sold
    total_products_sold = db.query(func.sum(models.Sale.quantity_sold)).scalar() or 0

    # 3. Average Order Value
    total_orders = db.query(func.count(models.Sale.id)).scalar() or 0
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0

    # 4. Best Selling Product (by quantity)
    best_selling = (
        db.query(models.Product.name, func.sum(models.Sale.quantity_sold).label("total_qty"))
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .group_by(models.Product.name)
        .order_by(desc(func.sum(models.Sale.quantity_sold)))
        .first()
    )
    best_selling_product = {"name": best_selling[0], "quantity": best_selling[1]} if best_selling else None

    # 5. Sales Today
    today = date.today()
    sales_today = (
        db.query(func.sum(models.Sale.total_price))
        .filter(func.date(models.Sale.sale_date) == today)
        .scalar()
    ) or 0

    # 6. Monthly Sales (current month)
    monthly_sales = (
        db.query(func.sum(models.Sale.total_price))
        .filter(func.extract("month", models.Sale.sale_date) == today.month)
        .filter(func.extract("year", models.Sale.sale_date) == today.year)
        .scalar()
    ) or 0

    return {
        "total_sales_value": total_sales,
        "total_products_sold": total_products_sold,
        "average_order_value": avg_order_value,
        "best_selling_product": best_selling_product,
        "sales_today": sales_today,
        "sales_this_month": monthly_sales,
    }

@router.get("/low-stock-alert", response_model=List[schemas.Product])
def low_stock_alert(low_stock_threshold: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    low_stock_products = db.query(models.Product).filter(models.Product.quantity <= low_stock_threshold).all()
    return low_stock_products

@router.get("/expiry-alert", response_model=List[schemas.Product])
def expiry_alert(days_before_expiry: int = 30, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    expiry_date = date.today() + timedelta(days=days_before_expiry)
    expiring_products = db.query(models.Product).filter(models.Product.expiry_date <= expiry_date).all()
    return expiring_products

@router.get("/sales-over-time")
def sales_over_time(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    sales_data = db.query(models.Sale.sale_date, func.sum(models.Sale.total_price).label("total_sales")).group_by(models.Sale.sale_date).order_by(models.Sale.sale_date).all()
    return sales_data

@router.get("/top-selling-products")
def top_selling_products(limit: int = 5, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    top_products = db.query(models.Product.name, func.sum(models.Sale.quantity_sold).label("total_sold")).join(models.Sale).group_by(models.Product.name).order_by(desc(func.sum(models.Sale.quantity_sold))).limit(limit).all()
    return top_products

@router.get("/stock-levels", response_model=List[schemas.Product])
def stock_levels(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    return db.query(models.Product).all()

@router.get("/sales-by-product")
def sales_by_product(db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    sales_data = db.query(models.Product.name, func.sum(models.Sale.total_price).label("total_revenue")).join(models.Sale).group_by(models.Product.name).all()
    return sales_data

@router.get("/all")
async def get_all_dashboard_data(
    low_stock_threshold: int = 10,
    days_before_expiry: int = 30,
    top_selling_limit: int = 5,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Sales Analytics
    total_sales = db.query(func.sum(models.Sale.total_price)).scalar() or 0
    total_products_sold = db.query(func.sum(models.Sale.quantity_sold)).scalar() or 0
    total_orders = db.query(func.count(models.Sale.id)).scalar() or 0
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    best_selling = (
        db.query(models.Product.name, func.sum(models.Sale.quantity_sold).label("total_qty"))
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .group_by(models.Product.name)
        .order_by(desc(func.sum(models.Sale.quantity_sold)))
        .first()
    )
    best_selling_product = {"name": best_selling[0], "quantity": best_selling[1]} if best_selling else None
    today = date.today()
    sales_today = (
        db.query(func.sum(models.Sale.total_price))
        .filter(func.date(models.Sale.sale_date) == today)
        .scalar()
    ) or 0
    monthly_sales = (
        db.query(func.sum(models.Sale.total_price))
        .filter(func.extract("month", models.Sale.sale_date) == today.month)
        .filter(func.extract("year", models.Sale.sale_date) == today.year)
        .scalar()
    ) or 0

    sales_analytics_data = {
        "total_sales_value": total_sales,
        "total_products_sold": total_products_sold,
        "average_order_value": avg_order_value,
        "best_selling_product": best_selling_product,
        "sales_today": sales_today,
        "sales_this_month": monthly_sales,
    }

    # Low Stock Alert
    low_stock_products = db.query(models.Product).filter(models.Product.quantity <= low_stock_threshold).all()

    # Expiry Alert
    expiry_limit_date = date.today() + timedelta(days=days_before_expiry)
    expiring_products = db.query(models.Product).filter(models.Product.expiry_date <= expiry_limit_date).all()

    # Sales Over Time
    sales_over_time_data = db.query(models.Sale.sale_date, func.sum(models.Sale.total_price).label("total_sales")).group_by(models.Sale.sale_date).order_by(models.Sale.sale_date).all()

    # Top Selling Products
    top_products = db.query(models.Product.name, func.sum(models.Sale.quantity_sold).label("total_sold")).join(models.Sale).group_by(models.Product.name).order_by(desc(func.sum(models.Sale.quantity_sold))).limit(top_selling_limit).all()

    # Stock Levels
    stock_levels_data = db.query(models.Product).all()
    
    # Sales by Product
    sales_by_product_data = db.query(models.Product.name, func.sum(models.Sale.total_price).label("total_revenue")).join(models.Sale).group_by(models.Product.name).all()

    return {
        "sales_analytics": sales_analytics_data,
        "low_stock_products": low_stock_products,
        "expiring_products": expiring_products,
        "sales_over_time": sales_over_time_data,
        "top_selling_products": top_products,
        "stock_levels": stock_levels_data,
        "sales_by_product": sales_by_product_data,
    }
