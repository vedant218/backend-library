// Member page logic
const API_URL = 'https://backend-library-71vo.onrender.com'; 

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login page if token is not present
        window.location.href = '/frontend/index.html';
        return;
    }

    const contentDiv = document.getElementById('content');
    const booksBtn = document.getElementById('books-btn');
    const historyBtn = document.getElementById('history-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const logoutBtn = document.getElementById('logout-btn');

    booksBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/books`);
            if (response.ok) {
                const books = await response.json();
                displayBooks(books);
            } else {
                throw new Error('Failed to fetch books');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            contentDiv.innerHTML = '<p>Error loading books. Please try again later.</p>';
        }
    });

    historyBtn.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in again.');
            }

            const response = await fetch(`${API_URL}/borrowed-books`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const borrowedBooks = await response.json();
                displayBorrowedBooks(borrowedBooks);
            } else if (response.status === 401) {
                throw new Error('Unauthorized. Please log in again.');
            } else {
                throw new Error('Failed to fetch borrowed books');
            }
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
            contentDiv.innerHTML = '<p>Error loading borrowed books. Please try again later.</p>';
            if (error.message.includes('Unauthorized') || error.message.includes('No token found')) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
            }
        }
    });

    deleteAccountBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in again.');
                }

                const response = await fetch(`${API_URL}/delete-account`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.removeItem('token');
                    alert(data.message || 'Your account has been deleted.');
                    window.location.href = '/frontend/index.html';
                } else if (response.status === 401) {
                    throw new Error('Unauthorized. Please log in again.');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to delete account');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert(error.message || 'An error occurred while deleting your account. Please try again later.');
                if (error.message.includes('Unauthorized')) {
                    localStorage.removeItem('token');
                    window.location.href = '/frontend/login.html';
                }
            }
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/frontend/index.html';
    });

    function displayBooks(books) {
        const availableBooks = books.filter(book => book[3] === 'AVAILABLE');
        contentDiv.innerHTML = `
            <h2>Available Books</h2>
            ${availableBooks.length > 0 ? `
                <ul>
                    ${availableBooks.map(book => `
                        <li>
                            ${book[1]} by ${book[2]}
                            <button class="borrow-btn" data-book-id="${book[0]}">Borrow</button>
                        </li>
                    `).join('')}
                </ul>
            ` : '<p>No books are currently available.</p>'}
        `;

        // Add event listeners to borrow buttons
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', handleBorrowBook);
        });
    }

    async function handleBorrowBook(event) {
        const bookId = event.target.getAttribute('data-book-id');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in again.');
            }

            const response = await fetch(`${API_URL}/book/borrow/${bookId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.detail || 'Book borrowed successfully');
                // Refresh the book list
                const booksResponse = await fetch(`${API_URL}/books`);
                if (booksResponse.ok) {
                    const books = await booksResponse.json();
                    displayBooks(books);
                }
            } else if (response.status === 401) {
                throw new Error('Unauthorized. Please log in again.');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to borrow book');
            }
        } catch (error) {
            console.error('Error borrowing book:', error);
            alert(error.message || 'An error occurred while borrowing the book. Please try again later.');
            if (error.message.includes('Unauthorized') || error.message.includes('No token found')) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
            }
        }
    }

    function displayBorrowedBooks(books) {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = `
            <h2>Your Borrowed Books</h2>
            ${books.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Borrowed On</th>
                            <th>Returned At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${books.map(book => `
                            <tr>
                                <td>${book.title}</td>
                                <td>${book.author}</td>
                                <td>${new Date(book.borrowed_at).toLocaleString()}</td>
                                <td>${book.returned_at ? new Date(book.returned_at).toLocaleString() : 'Not returned'}</td>
                                <td>
                                    ${book.returned_at 
                                        ? 'Returned' 
                                        : `<button class="return-btn" data-book-id="${book.id}">Return Book</button>`
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>You have not borrowed any books yet.</p>'}
        `;

        // Add event listeners to return buttons
        document.querySelectorAll('.return-btn').forEach(button => {
            button.addEventListener('click', handleReturnBook);
        });
    }

    async function handleReturnBook(event) {
        const bookId = event.target.getAttribute('data-book-id');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in again.');
            }

            const response = await fetch(`${API_URL}/book/return/${bookId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Book returned successfully');
                // Refresh the borrowed books list
                await fetchAndDisplayBorrowedBooks();
            } else {
                throw new Error(result.detail || 'Failed to return book');
            }
        } catch (error) {
            console.error('Error returning book:', error);
            alert(error.message || 'An error occurred while returning the book. Please try again later.');
            if (error.message.includes('Unauthorized') || error.message.includes('No token found')) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
            }
        }
    }

    async function fetchAndDisplayBorrowedBooks() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in again.');
            }

            const response = await fetch(`${API_URL}/borrowed-books`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const borrowedBooks = await response.json();
                displayBorrowedBooks(borrowedBooks);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch borrowed books');
            }
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
            alert(error.message || 'An error occurred while fetching borrowed books. Please try again later.');
            if (error.message.includes('Unauthorized') || error.message.includes('No token found')) {
                localStorage.removeItem('token');
                window.location.href = '/frontend/login.html';
            }
        }
    }

    console.log('Member dashboard script loaded');
});