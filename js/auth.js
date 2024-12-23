// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length < 8) {
        feedback.push('Password must be at least 8 characters');
    } else {
        strength += 25;
    }

    // Contains number
    if (/\d/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Add a number');
    }

    // Contains letter
    if (/[a-zA-Z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Add a letter');
    }

    // Contains special character
    if (/[!@#$%^&*]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Add a special character');
    }

    return { strength, feedback };
}

// Email validator
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Setup form validation
if (document.getElementById('signupForm')) {
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const strengthIndicator = document.querySelector('.password-strength');
    const passwordHint = document.getElementById('passwordHint');

    passwordInput.addEventListener('input', (e) => {
        const { strength, feedback } = checkPasswordStrength(e.target.value);
        
        // Update strength indicator
        strengthIndicator.style.width = `${strength}%`;
        if (strength < 50) {
            strengthIndicator.classList.remove('bg-yellow-500', 'bg-green-500');
            strengthIndicator.classList.add('bg-red-500');
        } else if (strength < 75) {
            strengthIndicator.classList.remove('bg-red-500', 'bg-green-500');
            strengthIndicator.classList.add('bg-yellow-500');
        } else {
            strengthIndicator.classList.remove('bg-yellow-500', 'bg-red-500');
            strengthIndicator.classList.add('bg-green-500');
        }

        // Update hint text
        passwordHint.textContent = feedback.join(', ') || 'Strong password!';
    });

    emailInput.addEventListener('blur', (e) => {
        const emailError = document.getElementById('emailError');
        if (!isValidEmail(e.target.value)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.classList.remove('hidden');
        } else {
            emailError.classList.add('hidden');
        }
    });
}

// Signup handler
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.text-red-600').forEach(el => el.classList.add('hidden'));

    // Validate inputs
    let hasError = false;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (name.length < 2) {
        document.getElementById('nameError').textContent = 'Name must be at least 2 characters';
        document.getElementById('nameError').classList.remove('hidden');
        hasError = true;
    }

    if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        document.getElementById('emailError').classList.remove('hidden');
        hasError = true;
    }

    const { strength, feedback } = checkPasswordStrength(password);
    if (strength < 75) {
        document.getElementById('passwordError').textContent = feedback.join(', ');
        document.getElementById('passwordError').classList.remove('hidden');
        hasError = true;
    }

    if (hasError) return;

    const role = document.getElementById('role').value;
    const preferences = Array.from(document.getElementsByName('preferences'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role,
                preferences
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Route based on role
            window.location.href = role === 'admin' ? '/pages/adminLogin.html' : '/pages/login.html';
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred during registration');
    }
});

// Login handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            
            // Route based on role
            if (data.user.role === 'admin') {
                window.location.href = '/pages/admin.html';
            } else {
                window.location.href = '/pages/dashboard.html';
            }
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred during login');
    }
});

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    const userRole = localStorage.getItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Route based on previous role
    window.location.href = userRole === 'admin' ? '/pages/adminLogin.html' : '/pages/login.html';
}); 