document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.status === 201) {
            alert('Registration successful!');
            // Route based on role
            if (userData.role === 'admin') {
                window.location.href = 'Admin.html';
            } else {
                window.location.href = 'login.html';
            }
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed');
    }
}); 