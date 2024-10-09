// Authentication logic
const API_URL = 'https://backend-library-71vo.onrender.com'; 

const signupForm = document.getElementById('signup');
const signinForm = document.getElementById('signin');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    if (!username || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.headers && data.headers.Authorization) {
                localStorage.setItem('token', data.headers.Authorization);
                alert('Signed up successfully!');
                redirectUser();
            } else {
                alert('Sign up successful, but no token received. Please sign in.');
            }
        } else {
            alert(`Sign up failed: ${data.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error occurred during sign up. Please try again.');
    }
});

signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.headers && data.headers.Authorization) {
                const token = data.headers.Authorization;
                localStorage.setItem('token', token);
                alert('Signed in successfully!');
                const decodedToken = decodeJWT(token);
                redirectUser(decodedToken.role);
            } else {
                alert('Sign in successful, but no token received. Please try again.');
            }
        } else {
            alert(`Sign in failed: ${data.detail || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during sign in. Please try again.');
    }
});

function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function redirectUser(role) {
    if (!role) {
        console.error('No role provided');
        return;
    }
    
    role = role.toLowerCase();
    const currentPage = window.location.pathname;
    if (role === 'librarian' && currentPage !== '/frontend/librarian-dashboard.html') {
        window.location.href = '/frontend/librarian-dashboard.html';
    } else if (role === 'member' && currentPage !== '/frontend/member-dashboard.html') {
        window.location.href = '/frontend/member-dashboard.html';
    } else if (currentPage === '/frontend/index.html' || currentPage === '/') {
        // If on the login page, redirect based on role
        if (role === 'librarian') {
            window.location.href = '/frontend/librarian-dashboard.html';
        } else if (role === 'member') {
            window.location.href = '/frontend/member-dashboard.html';
        }
    } else {
        console.log('User already on correct dashboard');
    }
}
