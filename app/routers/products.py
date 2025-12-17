from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from .. import models, schemas, oauth2
from typing import List, Dict, Any, Optional
from ..database import get_db
import csv
import io
from datetime import datetime

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=list[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for var, value in vars(product).items():
        setattr(db_product, var, value) if value else None
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return db_product

@router.post("/upload-csv/", status_code=status.HTTP_201_CREATED)
async def upload_products_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if file.content_type != 'text/csv':
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    
    content = await file.read()
    try:
        content_decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8.")

    reader = csv.DictReader(io.StringIO(content_decoded))
    
    products_added = []
    errors = []
    skipped = 0
    
    for i, row in enumerate(reader):
        try:
            # Validate and convert expiry_date
            expiry_date_str = row.get("expiry_date")
            expiry_date = None
            if expiry_date_str:
                try:
                    expiry_date = datetime.strptime(expiry_date_str, '%Y-%m-%d').date()
                except ValueError:
                    errors.append({"row": i + 2, "error": f"Invalid date format for expiry_date: '{expiry_date_str}'. Expected YYYY-MM-DD."})
                    continue
            
            # Check for required columns
            required_columns = ["name", "brand", "quantity", "price", "category"]
            for col in required_columns:
                if col not in row:
                    raise KeyError(f"Missing column: {col}")

            # Skip duplicates: consider duplicate when same name exists
            existing = db.query(models.Product).filter(models.Product.name == row["name"]).first()
            if existing:
                skipped += 1
                continue

            product_data = {
                "name": row["name"],
                "Brand": row["brand"],
                "category": row["category"],
                "quantity": int(row["quantity"]),
                "price": float(row["price"]),
                "expiry_date": expiry_date
            }

            db_product = models.Product(**product_data)
            db.add(db_product)
            products_added.append(product_data)

        except KeyError as e:
            errors.append({"row": i + 2, "error": str(e)})
        except ValueError as e:
            errors.append({"row": i + 2, "error": f"Invalid data type for a value in row: {e}"})
        except Exception as e:
            db.rollback()
            errors.append({"row": i + 2, "error": f"An unexpected error occurred: {str(e)}"})

    if not products_added and errors:
        raise HTTPException(status_code=400, detail={"message": "CSV processing failed for all rows.", "errors": errors})

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

    return {
        "detail": f"Successfully added {len(products_added)} products. Skipped {skipped} duplicates.",
        "products_added": len(products_added),
        "skipped": skipped,
        "errors": errors if errors else "None",
        "error_count": len(errors)
    }