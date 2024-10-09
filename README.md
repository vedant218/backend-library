# Library Management System

This project implements a fullstack application for a library management system using FastAPI. It features role-based access control for Librarians and Members, secured with JWT authentication. The system enables librarians to manage books and inventory, while members can borrow and return books.

## Technology Stack

- **Language:** Python
- **Framework:** FastAPI
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** MySQL
- **API Documentation:** Auto-generated FastAPI Swagger UI
- **frontend:** HTML, CSS, JavaScript
- **Hosting:** Netlify(Frontend) : https://famous-kataifi-e3edcb.netlify.app/. Vercel(Backend) [Serverless functions in vercel and render not working. Need to use GCP or AWS for database hosting]
## Setup Instruction

Clone the Repository:

```bash
  git clone <repository-url>
```

2. Navigate to the project directory:

   ```bash
   cd lms
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

#### GET "/deleted-members"

Description: To get a list of all the deleted members in the library.


### Member Routes

#### GET "/books"

- Description: To view all the books.

#### POST "/book/borrow/{book_id}"

- Description: To borrow a book from the library.

#### POST "/book/return/{book_id}"

- Description: To return a book from the library.

#### GET "/borrowed-books"

- Description: To get a list of borrowed books history in the library.
  
![APIs](https://github.com/user-attachments/assets/fbbd4d33-dd70-45f6-ba5c-357716267ee0)

## Database Structure
![image](https://github.com/user-attachments/assets/8f82362c-f835-451a-b2d5-3335128af62c)

The system utilizes the following tables:

1. Users Table: Stores details for Librarians and Members.
2. Books Table: Contains information about all books.
3. Borrowed Books Table: Tracks book borrowing activities.
4. Activity Log Table: Records all system activities.
   

### Output/Frontend/Working

![image](https://github.com/user-attachments/assets/06ad54bf-7c27-4b0f-a534-725c3e793e37)
### Sign Up
![image](https://github.com/user-attachments/assets/6c88b638-cf33-4b9f-8c54-46fcd44ac511)
### Sign In
![image](https://github.com/user-attachments/assets/beb5789d-3f77-406e-87a9-f0d27e6e3fb2)

### Librarian Dashboard
![image](https://github.com/user-attachments/assets/f078372a-c635-41df-b515-7d7a45cba97f)
![image](https://github.com/user-attachments/assets/208f69b7-d5f8-408d-967b-e4a54672a73b)
![image](https://github.com/user-attachments/assets/4a5e20d3-b342-475d-b236-092d0b9e3e01)
![image](https://github.com/user-attachments/assets/aaa16fa3-7fbf-4086-98be-c3da11af1fa3)
![image](https://github.com/user-attachments/assets/fd164a9c-8f75-4661-a744-b011f27d4919)
![image](https://github.com/user-attachments/assets/0b512120-8897-445a-914f-19b6e1847423)
### Delete
![image](https://github.com/user-attachments/assets/7cdbd2e5-d2a1-453a-a71f-2b11ab83cf6f)
### Manage Members (Add/Delete)
![image](https://github.com/user-attachments/assets/b03eb60a-2157-4ebb-9ca8-d68656fcd3e1)
![image](https://github.com/user-attachments/assets/a2a87941-a0a4-4d71-81b3-4f951cbdf245)
### Borrow/Return (Based on Members)
![image](https://github.com/user-attachments/assets/2c7d4b7a-e1af-4645-9184-157016491bd9)
![image](https://github.com/user-attachments/assets/2fc5ac36-d300-479b-94d9-6a26afcecd16)

### Member Dashboard
### books available
![image](https://github.com/user-attachments/assets/13c76166-40d6-4e1b-81f9-8dca2666ec39)
### Borrow history + not returned books
![image](https://github.com/user-attachments/assets/e42960ec-09bd-4143-b550-efd086e91b9a)




