from fastapi.exceptions import HTTPException
from datetime import datetime, timedelta

from passlib.context import CryptContext
from modules.database import db
from modules.auth.jwt_handler import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES


pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def register_user(username, password, role, created_at):
    cur = db.cursor()
    hashed_password = get_password_hash(password)

    # Check if username already exist in the database
    select_query = "SELECT COUNT(*) FROM users WHERE username=%s"
    cur.execute(select_query, (username,))
    count = cur.fetchone()[0]

    if count > 0:
        # Email or phone already exist, do not insert data
        return {"response":False, "msg":"username already exists..!"}
    else:
        query = '''INSERT INTO users(username,password,role,created_at) VALUES(%s, %s, %s, %s)'''
        cur.execute(query,(username, hashed_password, role, created_at))
        db.commit()
        cur.close()
        return {"response":True, "msg":f"Successfully registered as {role}"}

def is_valid(username,password):
    cur = db.cursor()

    # Check if username already exist in the database
    select_query = "SELECT * FROM users WHERE username=%s"
    cur.execute(select_query, (username,))
    user = cur.fetchone()
    
    if user:
        user_id = user[0]
        user_name = user[1]
        hashed_password = user[2]
        role = user[3]
        is_password_valid = verify_password(password,hashed_password)
        if is_password_valid:
            return {"response":True, "msg":"Successfully logged in...!", "user_id":user_id, "username":user_name, "role":role}
        else:
            return {"response":False, "msg":"Please enter valid password...!"}
    return {"response":False, "msg":"Invalid username or password...!"}


async def index():
    try:
        return {"Message" : "Welcome to Library Management System"}
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


async def signup(username,password,role):
    try:
        # Get the current timestamp
        current_timestamp = datetime.now()

        res = register_user(username=username,password=password,role=role, created_at=current_timestamp)

        if res['response']:
            return HTTPException(status_code=200, detail=res['msg'])
        return HTTPException(status_code=500, detail=res['msg'])
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


async def login(username,password):
    try:
        res = is_valid(username=username, password=password)
        
        if res['response']:
            # print(f"Active user ID: {res['user_id']}")
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"user_id":res['user_id'], "role":res['role']}, expires_delta=access_token_expires
            )
            return HTTPException(status_code=200, detail=res['msg'], headers={"Authorization":access_token})
        return HTTPException(status_code=502, detail=res['msg'])
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))