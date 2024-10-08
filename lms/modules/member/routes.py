'''
As a Member
1. I can view, borrow, and return available Books
2. Once a book is borrowed, its status will change to BORROWED
3. Once a book is returned, its status will change to AVAILABLE
4. I can delete my own account

'''

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import modules.member.controllers as member_controller 
from modules.auth.routes import get_current_user

router = APIRouter()

# For Borrow the books
@router.post("/book/borrow/{book_id}")
async def borrow_book(book_id:int, current_user: dict = Depends(get_current_user)):
    try:
        current_user_id = current_user.get("user_id")
        return await member_controller.borrow_book(current_user_id,book_id)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Returned the books
@router.post("/book/return/{book_id}")
async def return_book(book_id:int, current_user: dict = Depends(get_current_user)):
    try:
        return await member_controller.return_book(book_id)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Delete my own account
@router.get("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    try:
        current_user_id = current_user.get("user_id")
        return await member_controller.delete_account(current_user_id)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Borrowed Books
@router.get("/borrowed-books")
async def get_borrowed_books(current_user: dict = Depends(get_current_user)):
    try:
        current_user_id = current_user.get("user_id")
        return await member_controller.get_borrowed_books(current_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



