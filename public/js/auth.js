// Authentication functionality
const API_URL = window.location.origin;

// Check if already authenticated
async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/api/auth/status`, {
            credentials: 'include'
        });
        const data = await res.json();

        if (data.authenticated) {
            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/journey.html';
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');

    // Clear previous messages
    errorMsg.classList.remove('show');
    successMsg.classList.remove('show');

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Show success message
        successMsg.textContent = `Welcome! Redirecting... 💕`;
        successMsg.classList.add('show');

        // Redirect based on role
        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/journey.html';
            }
        }, 1000);

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.add('show');
    }
});

// Logout function (used in other pages)
async function logout() {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}

// Check auth on page load (for index.html)
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    checkAuth();
}
