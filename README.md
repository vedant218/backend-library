# LMS - Library Management System

This project implements a robust backend for a library management system using FastAPI. It features role-based access control for Librarians and Members, secured with JWT authentication. The system enables librarians to manage books and inventory, while members can borrow and return books.

## Technology Stack

- **Language:** Python
- **Framework:** FastAPI
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** MySQL
- **API Documentation:** Auto-generated FastAPI Swagger UI
- **frontend:** HTML, CSS, JavaScript

## Getting Started

**Framework:** FastAPI

**Authentication:** JWT (JSON Web Tokens)

**Database:** MySQL Database

**Environment Management:** Python venv

**API Documentation:** FastAPI Swagger UI (auto-generated)

## Setup Instruction

Clone the Repository:

```bash
  git clone <repository-url>
```

2. Navigate to the project directory:

   ```bash
   cd <project-directory>
   ```

3. Set up a virtual environment (recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Linux and macOS
   venv\Scripts\activate     # On Windows
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   Create a `.env` file in the root directory with the following:

   ```bash
   SECRET_KEY=your-256-bit-secret
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10
   ```

6. Launch the application:

   ```bash
   uvicorn app:app --reload
   ```

7. Access the API documentation:
   Open your browser and visit `http://127.0.0.1:8000/docs` for the Swagger UI.

## API Endpoints

### Authentication

#### POST `/signup`

Register a new user (Librarian or Member).

#### POST `/login`

Authenticate and generate a token for existing users.

### Librarian Routes

JWT authentication with Librarian role required.

#### GET `/view/members`

Retrieve a list of all members.

#### GET `/book`

View all books in the library.

#### POST `/book`

Add a new book to the library.

#### PATCH `/book/update/{book_id}`

Update book details.

#### DELETE `/book/delete/{book_id}`

Remove a book from the library.

#### POST `/add/member`

Add a new user as a member.

#### DELETE `/member/delete/{member_id}`

Remove a member from the system.

### Member Routes

#### GET "/books"

- Description: To view all the books.

#### POST "/book/borrow/{book_id}"

- Description: To borrow a book from the library.

#### POST "/book/return/{book_id}"

- Description: To return a book from the library.

## Database Structure

The system utilizes the following tables:

1. Users Table: Stores details for Librarians and Members.
2. Books Table: Contains information about all books.
3. Borrowed Books Table: Tracks book borrowing activities.
4. Activity Log Table: Records all system activities.

### Sample Table Structures

Users Table:
| id | username | password | role | created_at |
|----|------------|-----------|-----------|---------------------|
| 1 | librarian1 | hashed_pw | LIBRARIAN | 2024-01-01 00:00:00 |
| 2 | member1 | hashed_pw | MEMBER | 2024-01-02 00:00:00 |

Books Table:
| id | title | author | status |
|----|---------------|------------|-----------|
| 1 | Python 101 | John Doe | AVAILABLE |
| 2 | FastAPI Guide | Jane Smith | BORROWED |

Borrowed Books Table:
| id | book_id | user_id | borrowed_at | due_date | returned_at |
|----|---------|---------|----------------------|----------------------|----------------------|
| 1 | 2 | 2 | 2024-01-05 10:00:00 | 2024-01-19 10:00:00 | 2024-01-10 14:00:00 |
