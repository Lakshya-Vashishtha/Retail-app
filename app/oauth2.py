from jose import JWTError, jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from . import schemas, models, database
from sqlalchemy.orm import Session
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# Load environment variables from .env file
load_dotenv()

# Access the secret key
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data:dict):
    to_encode = data.copy() 

    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})

    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

    return encoded_jwt

def verify_token(token:str,credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # token is created with key "user_id" in auth.login
        id: str = payload.get("user_id") or payload.get("users_id")

        if id is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=id)
        return token_data
    except JWTError:
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                        detail=f"Could not validate credentials",
                                        headers={"WWW-Authenticate":"Bearer"})
    token_data = verify_token(token, credential_exception)

    # token_data.id should be the user id
    try:
        user_id = int(token_data.id)
    except Exception:
        user_id = token_data.id

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credential_exception
    return user


