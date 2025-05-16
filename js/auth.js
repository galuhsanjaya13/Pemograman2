// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize users array in localStorage if it doesn't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            alert('Username atau password salah!');
        }
    });
}

// Handle register form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Password tidak cocok!');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            alert('Username sudah digunakan!');
            return;
        }
        
        // Add new user
        const newUser = {
            id: Date.now().toString(),
            fullname,
            username,
            password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registrasi berhasil! Silakan login.');
        window.location.href = 'login.html';
    });
}

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Check authentication on page load
checkAuth();
