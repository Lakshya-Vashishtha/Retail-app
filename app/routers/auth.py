from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from .. import database, models, utils, oauth2
from ..schemas import UserLogin
from fastapi.security.oauth2 import OAuth2PasswordRequestForm


router = APIRouter(prefix="/auth",tags=["Login and signup"])

@router.post('/')
def login(user_credentials: UserLogin, db:Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    if not utils.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    
    #Create a Token
    #Return the Token
    access_token = oauth2.create_access_token(data={"user_id":user.id})
    return {"access_token":access_token, "token_type":"bearer"}  
 
          
