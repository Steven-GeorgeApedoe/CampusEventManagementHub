document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            
            // Decode token to get user role
            const tokenData = parseJwt(data.token);
            if (tokenData.role === 'admin') {
                window.location.href = 'Admin.html';
            } else {
                window.location.href = 'Home.html';
            }
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed');
    }
});

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
} 