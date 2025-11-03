from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
)

@router.post("/",  status_code=status.HTTP_201_CREATED,response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.quantity < sale.quantity_sold:
        raise HTTPException(status_code=400, detail="Not enough stock")

    db_product.quantity -= sale.quantity_sold
    db_sale = models.Sale(**sale.model_dump())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/", response_model=list[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    sales = db.query(models.Sale).offset(skip).limit(limit).all()
    return sales

@router.get("/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale

@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Revert the stock change from the original sale
    db_product = db.query(models.Product).filter(models.Product.id == db_sale.product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.quantity += db_sale.quantity_sold

    # Apply the stock change for the updated sale
    updated_product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if updated_product.quantity < sale.quantity_sold:
        db_product.quantity -= db_sale.quantity_sold # Revert the revert
        raise HTTPException(status_code=400, detail="Not enough stock")
    updated_product.quantity -= sale.quantity_sold

    for var, value in vars(sale).items():
        setattr(db_sale, var, value) if value else None
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.delete("/{sale_id}", response_model=schemas.Sale)
def delete_sale(sale_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")

    db_product = db.query(models.Product).filter(models.Product.id == db_sale.product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.quantity += db_sale.quantity_sold

    db.delete(db_sale)
    db.commit()
    return db_sale
