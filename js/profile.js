document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
                'Authorization': token
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('username').textContent = userData.username;
            document.getElementById('email').textContent = userData.email;
            document.getElementById('role').textContent = userData.role === 'admin' ? 'Administrator' : 'Student';
        } else {
            throw new Error('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load profile');
    }
}); 