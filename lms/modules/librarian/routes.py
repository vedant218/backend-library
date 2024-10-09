from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import modules.librarian.controllers as librarian_controller 
from modules.auth.jwt_handler import get_current_user

router = APIRouter()


class Book(BaseModel):
    title: str
    author: str

class UpdateBookDetail(BaseModel):
    title: str
    author: str
    status: str

@router.get("/books")
async def get_books():
    try:
        return await librarian_controller.get_books()
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


# For Add the Book
@router.post("/book")
async def add_book(book_detail: Book, current_user: dict = Depends(get_current_user)):
    try:
        title = book_detail.title
        author = book_detail.author
        status = "AVAILABLE"
        user_role = current_user.get("user_role")
        return await librarian_controller.add_book(title,author,status,user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Update the Book
@router.patch("/book/update/{book_id}")
async def update_book(book_id: int, updateBookDetail:UpdateBookDetail, current_user: dict = Depends(get_current_user)):
    try:
        title = updateBookDetail.title
        author = updateBookDetail.author
        status = updateBookDetail.status
        user_role = current_user.get("user_role")
        return await librarian_controller.update_book(book_id,title,author,status,user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@router.get("/books/borrowing-history")
async def get_borrowing_history(current_user: dict = Depends(get_current_user)):
    try:
        user_role = current_user.get("user_role")
        return await librarian_controller.get_borrowing_history(user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# For Delete the Book
@router.delete("/book/delete/{book_id}")
async def delete_book(book_id: int, current_user: dict = Depends(get_current_user)):
    try:
        user_role = current_user.get("user_role")
        return await librarian_controller.delete_book(book_id,user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


class Member_detail(BaseModel):
    username: str
    password: str

# Fetch all the Members
@router.get("/view/members")
async def view_members(current_user: dict = Depends(get_current_user)):
    try:
        user_role = current_user.get("user_role")
        return await librarian_controller.view_members(user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# Add the Member
@router.post("/add/member")
async def add_member(member_detail: Member_detail, current_user: dict = Depends(get_current_user)):
    try:
        username = member_detail.username
        password = member_detail.password
        user_role = current_user.get("user_role")
        print(user_role)
        return await librarian_controller.add_member(username,password,user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

# Remove the Member
@router.delete("/member/delete/{member_id}")
async def delete_member(member_id, current_user: dict = Depends(get_current_user)):
    try:
        user_role = current_user.get("user_role")
        return await librarian_controller.delete_member(member_id,user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))
    
@router.get("/delete-member")
async def get_deleted_member(current_user: dict = Depends(get_current_user)):
    try:
        user_role = current_user.get("user_role")
        return await librarian_controller.get_deleted_member(user_role)
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

