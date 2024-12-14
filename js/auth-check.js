// Add this script to pages that require authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Check if token is expired
    try {
        const tokenData = parseJwt(token);
        if (tokenData.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
});

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
} 