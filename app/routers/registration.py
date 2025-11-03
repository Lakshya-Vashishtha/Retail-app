from fastapi import status,APIRouter
from ..database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from .. import models,schemas,utils

router=APIRouter(
    prefix="/auth",
    tags=["Login and signup"],
)

@router.post("/SignUp", status_code=status.HTTP_201_CREATED,response_model=schemas.USER)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_password = utils.hash_password(user.password)

    db_user = models.User(email=user.email,username=user.username, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user