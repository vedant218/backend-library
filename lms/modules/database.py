import mysql.connector
from passlib.context import CryptContext

# Connection with MySQL Database
db = mysql.connector.connect(host = "localhost", user="root", password="vedant465")
cur = db.cursor()

# Create database if doesn't exists
cur.execute("CREATE DATABASE IF NOT EXISTS library_ms")
cur.close()

# Connect to the newly created databas
db = mysql.connector.connect(host = "localhost", user="root", password="vedant465", database="library_ms")
cur = db.cursor()

# Create table "users"
cur.execute('''CREATE TABLE IF NOT EXISTS users(
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('LIBRARIAN','MEMBER') NOT NULL,
            created_at TIMESTAMP NOT NULL,
            deleted_at TIMESTAMP
            )
''')

# Create table "books"
cur.execute('''CREATE TABLE IF NOT EXISTS books(
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            status ENUM('AVAILABLE', 'BORROWED') NOT NULL,
            created_at TIMESTAMP NOT NULL
            )
''')

# Create table "borrowed_books"
cur.execute('''CREATE TABLE IF NOT EXISTS borrowed_books(
            id INT AUTO_INCREMENT PRIMARY KEY,
            book_id INT,
            user_id INT,
            borrowed_at TIMESTAMP NOT NULL,
            returned_at TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
''')

# Create table "activity_log"
cur.execute('''CREATE TABLE IF NOT EXISTS activity_log(
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(255),
            created_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
''')

# Close the database cursor
cur.close()


def get_user(user_id):
    cur = db.cursor()

    # Check if username already exist in the database
    select_query = "SELECT username,role FROM users WHERE id=%s"
    cur.execute(select_query, (user_id,))
    user = cur.fetchone()
    return user