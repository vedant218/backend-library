// Librarian page logic
const API_URL = 'https://backend-library-71vo.onrender.com'; 

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const booksBtn = document.getElementById('books-btn');
    const membersBtn = document.getElementById('members-btn');
    const historyBtn = document.getElementById('history-btn');
    const deletedMembersBtn = document.getElementById('deleted-members-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Abstract fetch error handling
    async function fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }

    // Use the new fetchWithErrorHandling function
    booksBtn.addEventListener('click', async () => {
        try {
            const books = await fetchWithErrorHandling(`${API_URL}/books`);
            displayBooks(books);
        } catch (error) {
            contentDiv.innerHTML = '<p>Error loading books. Please try again later.</p>';
        }
    });

    membersBtn.addEventListener('click', async () => {
        try {
            const members = await fetchWithErrorHandling(`${API_URL}/view/members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            displayMembers(members);
        } catch (error) {
            console.error('Error fetching members:', error);
            contentDiv.innerHTML = '<p>Error loading members. Please try again later.</p>';
        }
    });

    historyBtn.addEventListener('click', async () => {
        try {
            const history = await fetchWithErrorHandling(`${API_URL}/books/borrowing-history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            displayBorrowingHistory(history);
        } catch (error) {
            console.error('Error fetching borrowing history:', error);
            contentDiv.innerHTML = '<p>Error loading borrowing history. Please try again later.</p>';
        }
    });

    deletedMembersBtn.addEventListener('click', async () => {
        try {
            const deletedMembers = await fetchWithErrorHandling(`${API_URL}/delete-member`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            displayDeletedMembers(deletedMembers);
        } catch (error) {
            console.error('Error fetching deleted members:', error);
            contentDiv.innerHTML = '<p>Error loading deleted members. Please try again later.</p>';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/frontend/index.html';
    });

    function displayBooks(books) {
        contentDiv.innerHTML = `
            <h2>Manage Books</h2>
            <button onclick="addBook()">Add New Book</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Added Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${books.map(book => `
                        <tr>
                            <td>${book[0]}</td>
                            <td>${book[1]}</td>
                            <td>${book[2]}</td>
                            <td>${book[3]}</td>
                            <td>${new Date(book[4]).toLocaleDateString()}</td>
                            <td>
                                <button onclick="editBook(${book[0]})">Edit</button>
                                <button onclick="deleteBook(${book[0]})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function displayMembers(members) {
        contentDiv.innerHTML = `
            <h2>Manage Members</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(member => `
                        <tr>
                            <td>${member[0]}</td>
                            <td>${member[1]}</td>
                            <td>${member[2]}</td>
                            <td>${new Date(member[3]).toLocaleDateString()}</td>
                            <td>
                                <button onclick="deleteMember('${member[0]}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button onclick="showAddMemberForm()">Add New Member</button>
        `;
    }
    

    function displayBorrowingHistory(history) {
        if (!Array.isArray(history)) {
            console.error('History is not an array:', history);
            contentDiv.innerHTML = '<p>Error: Invalid history data received.</p>';
            return;
        }
    
        contentDiv.innerHTML = `
            <h2>Borrowing History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Username</th>
                        <th>Borrowed At</th>
                        <th>Returned At</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(item => `
                        <tr>
                            <td>${item.book_title}</td>
                            <td>${item.username}</td>
                            <td>${new Date(item.borrowed_at).toLocaleString()}</td>
                            <td>${item.returned_at ? new Date(item.returned_at).toLocaleString() : 'Not returned'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function displayDeletedMembers(deletedMembers) {
        contentDiv.innerHTML = `
            <h2>Deleted Members</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Action</th>
                        <th>Deleted On</th>
                    </tr>
                </thead>
                <tbody>
                    ${deletedMembers.map(member => `
                        <tr>
                            <td>${member.user_id}</td>
                            <td>${member.username}</td>
                            <td>${member.action}</td>
                            <td>${new Date(member.timestamp).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

   // ... existing code ...

window.editBook = async (bookId) => {
    try {
        // First, try to fetch the book details from the books list
        const booksResponse = await fetch(`${API_URL}/books`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (booksResponse.ok) {
            const books = await booksResponse.json();
            const book = books.find(b => b[0] === bookId);
            if (book) {
                displayEditBookForm({
                    id: book[0],
                    title: book[1],
                    author: book[2],
                    status: book[3]
                });
                return;
            }
        }
        
        // If we couldn't find the book in the list, show an error
        throw new Error('Book not found');
    } catch (error) {
        console.error('Error fetching book details:', error);
        alert(error.message || 'An error occurred while fetching book details. Please try again later.');
    }
};

function displayEditBookForm(book) {
    const editForm = `
        <h3>Edit Book</h3>
        <form id="edit-book-form">
            <input type="text" id="edit-book-title" value="${book.title}" required>
            <input type="text" id="edit-book-author" value="${book.author}" required>
            <select id="edit-book-status">
                <option value="AVAILABLE" ${book.status === 'AVAILABLE' ? 'selected' : ''}>Available</option>
                <option value="BORROWED" ${book.status === 'BORROWED' ? 'selected' : ''}>Borrowed</option>
            </select>
            <button type="submit">Update Book</button>
        </form>
    `;
    contentDiv.innerHTML = editForm;

    document.getElementById('edit-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('edit-book-title').value;
        const author = document.getElementById('edit-book-author').value;
        const status = document.getElementById('edit-book-status').value;

        try {
            const response = await fetch(`${API_URL}/book/update/${book.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, author, status })
            });

            if (response.ok) {
                alert('Book updated successfully!');
                booksBtn.click(); // Refresh the book list
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update book');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            alert('An error occurred while updating the book. Please try again later.');
        }
    });
};

// ... existing code ...

    window.deleteBook = async (bookId) => {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                const response = await fetch(`${API_URL}/book/delete/${bookId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    alert('Book deleted successfully!');
                    booksBtn.click(); // Refresh the book list
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to delete book');
                }
            } catch (error) {
                console.error('Error deleting book:', error);
                alert('An error occurred while deleting the book. Please try again later.');
            }
        }
    };

    window.addBook = () => {
        const bookForm = `
            <h3>Add New Book</h3>
            <form id="add-book-form">
                <input type="text" id="book-title" placeholder="Book Title" required>
                <input type="text" id="book-author" placeholder="Author" required>
                <button type="submit">Add Book</button>
            </form>
        `;
        contentDiv.innerHTML = bookForm;

        document.getElementById('add-book-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('book-title').value;
            const author = document.getElementById('book-author').value;

            try {
                const response = await fetch(`${API_URL}/book`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
                    },
                    body: JSON.stringify({ title, author })
                });

                if (response.ok) {
                    alert('Book added successfully!');
                    booksBtn.click(); // Refresh the book list
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to add book');
                }
            } catch (error) {
                console.error('Error adding book:', error);
                alert('An error occurred while adding the book. Please try again later.');
            }
        });
    };

    window.editMember = (username) => {
        // Implement edit member functionality
        alert(`Edit member functionality for username ${username} will be implemented here.`);
    };

    window.deleteMember = async (memberId) => {
        if (confirm('Are you sure you want to delete this member?')) {
            try {
                console.log(`Attempting to delete member with ID: ${memberId}`); // Add this line for debugging
                const response = await fetch(`${API_URL}/member/delete/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    alert('Member deleted successfully!');
                    membersBtn.click(); // Refresh the member list
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to delete member');
                }
            } catch (error) {
                console.error('Error deleting member:', error);
                alert('An error occurred while deleting the member. Please try again later.');
            }
        }
    };

    window.addMember = () => {
        // Implement add member functionality
        alert('Add member functionality will be implemented here.');
    };

    window.returnBook = async (borrowId) => {
        try {
            const response = await fetch(`${API_URL}/return-book/${borrowId}`, {
                method: 'POST',
            });
            if (response.ok) {
                alert('Book marked as returned successfully!');
                historyBtn.click(); // Refresh the borrowing history
            } else {
                throw new Error('Failed to mark book as returned');
            }
        } catch (error) {
            console.error('Error marking book as returned:', error);
            alert('An error occurred while marking the book as returned. Please try again later.');
        }
    };

    console.log('Librarian dashboard script loaded');

    // Member management functions
    window.viewMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/view/members`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }

            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }

            const members = await response.json();
            displayMembers(members);
        } catch (error) {
            console.error('Error fetching members:', error);
            alert(error.message || 'An error occurred while fetching members. Please try again later.');
            
            // If unauthorized, redirect to login
            if (error.message === 'Unauthorized: Please log in again') {
                logout(); // Implement this function to clear local storage and redirect to login page
            }
        }
    };

  
    window.showAddMemberForm = () => {
        const formHtml = `
            <h3>Add New Member</h3>
            <form id="add-member-form">
                <input type="text" id="new-member-username" placeholder="Username" required>
                <input type="password" id="new-member-password" placeholder="Password" required>
                <button type="submit">Add Member</button>
            </form>
        `;
        contentDiv.innerHTML = formHtml;

        document.getElementById('add-member-form').addEventListener('submit', addMember);
    };

    async function addMember(e) {
        e.preventDefault();
        const username = document.getElementById('new-member-username').value;
        const password = document.getElementById('new-member-password').value;

        try {
            const response = await fetch(`${API_URL}/add/member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert('Member added successfully!');
                viewMembers(); // Refresh the member list
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to add member');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert(error.message || 'An error occurred while adding the member. Please try again later.');
        }
    }

    window.deleteMember = async (memberId) => {
        if (confirm('Are you sure you want to delete this member?')) {
            try {
                const response = await fetch(`${API_URL}/member/delete/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    alert('Member deleted successfully!');
                    viewMembers(); // Refresh the member list
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to delete member');
                }
            } catch (error) {
                console.error('Error deleting member:', error);
                alert('An error occurred while deleting the member. Please try again later.');
            }
        }
    };
});