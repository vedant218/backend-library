from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from modules.auth.jwt_handler import create_access_token
# others
import modules.database as database
from modules.auth.jwt_handler import get_current_user
import modules.auth.controllers as auth_controllers
from datetime import timedelta


router = APIRouter()


class UserRegistration(BaseModel):
    username: str
    password: str
    role: str   # Either 'LIBRARIAN' OR 'MEMBER'

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str



# For Index
@router.get("/")
async def index(current_user: dict = Depends(get_current_user)):
    try:
        return await auth_controllers.index()
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Signup
@router.post("/signup")
async def signup(user_detail: UserRegistration):
    try:
        username = user_detail.username
        password = user_detail.password
        role = user_detail.role
        return await auth_controllers.signup(username,password,role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Login
@router.post("/login")
async def login(user_detail: UserLogin):
    try:
        username = user_detail.username
        password = user_detail.password
        return await auth_controllers.login(username,password)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_controllers.is_valid(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}
