from fastapi import status
from fastapi.exceptions import HTTPException
from modules.database import db, get_user
from modules.auth.controllers import register_user
from datetime import datetime
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def get_books():
    try:
        cur = db.cursor()
        query = "SELECT * FROM books"
        cur.execute(query)
        all_books = cur.fetchall()
        return all_books
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def add_book(title,author,status,user_role):
    try:
        if user_role != "LIBRARIAN":
            return HTTPException(status_code=401, detail="This feature allow only for the Librarian...!")
        cur = db.cursor()

        # Get the current timestamp
        current_timestamp = datetime.now()

        query = '''INSERT INTO books(title,author,status,created_at) VALUES(%s, %s, %s, %s)'''
        cur.execute(query,(title,author,status,current_timestamp))
        db.commit()
        cur.close()
        return HTTPException(status_code=200, detail="Book succesfully added...!")
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def update_book(book_id,title,author,status,user_role):
    try:
        if user_role != "LIBRARIAN":
            return HTTPException(status_code=401, detail="This feature allow only for the Librarian...!")
        
        cur = db.cursor()
        query = "UPDATE books SET title=%s,author=%s,status=%s WHERE id=%s"
        cur.execute(query,(title,author,status,book_id))
        db.commit()
        cur.close()
        return HTTPException(status_code=200, detail="Book succesfully updated...!")
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def delete_book(book_id,user_role):
    try:
        if user_role != "LIBRARIAN":
            return HTTPException(status_code=401, detail="This feature allow only for the Librarian...!")
        
        cur = db.cursor()
        query = "DELETE FROM books WHERE id=%s"
        cur.execute(query,(book_id,))
        db.commit()
        cur.close()
        return HTTPException(status_code=200, detail=f"Book succesfully deleted that has id: {book_id}")
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def get_borrowing_history(user_role):
    try:
        if user_role != "LIBRARIAN":
            raise HTTPException(status_code=401, detail="This feature is only allowed for the Librarian!")
        
        cur = db.cursor()
        query = """
        SELECT b.title, u.username, bb.borrowed_at, bb.returned_at
        FROM borrowed_books bb
        JOIN books b ON bb.book_id = b.id
        JOIN users u ON bb.user_id = u.id
        ORDER BY bb.borrowed_at DESC
        """
        cur.execute(query)
        all_history = cur.fetchall()
        
        # Convert to list of dictionaries for easier JSON serialization
        history = [
            {
                "book_title": row[0],
                "username": row[1],
                "borrowed_at": row[2].isoformat() if row[2] else None,
                "returned_at": row[3].isoformat() if row[3] else None
            }
            for row in all_history
        ]
        
        return history  # Return the array directly
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()

async def add_member(username, password, user_role):
    try:
        if user_role != "LIBRARIAN":
            return HTTPException(status_code=401, detail="This feature allow only for the Librarian...!")
        
        role = "MEMBER"
        hashed_password = get_password_hash(password)

        # Get the current timestamp
        current_timestamp = datetime.now()

        res = register_user(username=username,password=hashed_password,role=role, created_at=current_timestamp)
        return HTTPException(status_code=200, detail="Member succesfully added...!")
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def view_members(user_role):
    try:
        if user_role != "LIBRARIAN":
            return HTTPException(status_code=401, detail="This feature allow only for the Librarian...!")
        
        cur = db.cursor()
        query = "SELECT id,username,role,created_at FROM users WHERE role='MEMBER'"
        cur.execute(query)
        all_members = cur.fetchall()
        return all_members
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

async def delete_member(member_id, user_role):
    try:
        if user_role != "LIBRARIAN":
            raise HTTPException(status_code=401, detail="This feature is only allowed for the Librarian!")
        
        cur = db.cursor()

        # Get member information before deletion
        member = get_user(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        username = member[0]  # Assuming the username is the second item in the tuple

        # Add entry to activity log
        log_query = "INSERT INTO activity_log (user_id, action, created_at) VALUES (%s, %s, %s)"
        log_values = (member_id, f"account deleted", datetime.now())
        cur.execute(log_query, log_values)

        # Delete member
        delete_query = "DELETE FROM users WHERE id=%s"
        cur.execute(delete_query, (member_id,))

        db.commit()
        cur.close()
        return {"message": f"Member successfully removed with id: {member_id}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def get_deleted_member(user_role):
    try:
        if user_role != "LIBRARIAN":
            raise HTTPException(status_code=401, detail="This feature is only allowed for the Librarian!")
        
        cur = db.cursor()
        query = """
        SELECT al.user_id, u.username, al.action, al.created_at
        FROM activity_log al
        JOIN users u ON al.user_id = u.id
        WHERE al.action = 'account deleted' AND u.role = 'MEMBER'
        ORDER BY al.created_at DESC
        """
        cur.execute(query)
        deleted_members = cur.fetchall()
        
        result = [
            {
                "user_id": member[0],
                "username": member[1],
                "action": member[2],
                "created_at": member[3],
            }
            for member in deleted_members
        ]
        
        return result
    finally:
        cur.close()

