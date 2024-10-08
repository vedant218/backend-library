from fastapi.exceptions import HTTPException
from modules.database import db
from datetime import datetime


async def borrow_book(current_user_id, book_id):
    try:
        cur = db.cursor()

        # Check if the book is available
        check_query = "SELECT status FROM books WHERE id = %s"
        cur.execute(check_query, (book_id,))
        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail=f"Book with id {book_id} not found")
        
        if result[0] != 'AVAILABLE':
            raise HTTPException(status_code=400, detail=f"Book with id {book_id} is not available for borrowing")

        # Get the current timestamp
        current_timestamp = datetime.now()

        # Insert borrowing record
        insert_query = "INSERT INTO borrowed_books (book_id, user_id, borrowed_at) VALUES (%s, %s, %s)"
        cur.execute(insert_query, (book_id, current_user_id, current_timestamp))

        # Update book status
        update_query = "UPDATE books SET status = 'BORROWED' WHERE id = %s"
        cur.execute(update_query, (book_id,))

        db.commit()
        cur.close()
        return {"message": f"Book borrowed successfully with id: {book_id}"}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def return_book(book_id):
    try:
        cur = db.cursor()

        # Get the current timestamp
        current_timestamp = datetime.now()

        # Check if the book is already returned
        check_query = """
        SELECT id, returned_at 
        FROM borrowed_books 
        WHERE book_id = %s 
        ORDER BY borrowed_at DESC 
        LIMIT 1
        """
        cur.execute(check_query, (book_id,))
        borrow_record = cur.fetchone()

        if not borrow_record:
            raise HTTPException(status_code=404, detail=f"No borrowing record found for book with id {book_id}")

        if borrow_record[1] is not None:
            raise HTTPException(status_code=400, detail=f"Book with id {book_id} has already been returned")

        # Update book status
        update_book_query = "UPDATE books SET status = 'AVAILABLE' WHERE id = %s"
        cur.execute(update_book_query, (book_id,))

        # Update borrowed_books record
        update_borrow_query = "UPDATE borrowed_books SET returned_at = %s WHERE id = %s"
        cur.execute(update_borrow_query, (current_timestamp, borrow_record[0]))

        db.commit()
        cur.close()
        return {"message": f"Book returned successfully with id: {book_id}", "returned_at": current_timestamp.isoformat()}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def delete_account(current_user_id):
    try:
        cur = db.cursor()

        # Get user information before deletion
        user = get_user(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        username = user[0]

        # Add entry to activity log
    # Add entry to activity log
        log_query = "INSERT INTO activity_log (user_id, username, action, created_at) VALUES (%s, %s, %s, %s)"
        log_values = (member_id, username, "account deleted", datetime.now())
        cur.execute(log_query, log_values)

        # Delete user
        delete_query = "DELETE FROM users WHERE id=%s"
        cur.execute(delete_query, (current_user_id,))

        db.commit()
        cur.close()
        return {"message": "Your account has been successfully deleted"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

async def get_borrowed_books(user_id):
    try:
        cur = db.cursor(dictionary=True)
        query = """
        SELECT b.id, b.title, b.author, bb.borrowed_at, bb.returned_at
        FROM borrowed_books bb
        JOIN books b ON bb.book_id = b.id
        WHERE bb.user_id = %s
        ORDER BY bb.borrowed_at DESC
        """
        cur.execute(query, (user_id,))
        books = cur.fetchall()
        cur.close()
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
