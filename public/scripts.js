// Tab switching functionality
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginform');
const registerForm = document.getElementById('registerform');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            messageEl.style.color = 'green';
            messageEl.innerText = result.message;
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            messageEl.style.color = 'red';
            messageEl.innerText = result.message;
        }
    } catch (error) {
        messageEl.style.color = 'red';
        messageEl.innerText = 'An error occurred. Please try again.';
    }
});

// Register form handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('registerMessage');

    // Validate passwords match
    if (password !== confirmPassword) {
        messageEl.style.color = 'red';
        messageEl.innerText = 'Passwords do not match!';
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        
        if (response.ok) {
            messageEl.style.color = 'green';
            messageEl.innerText = result.message;
            // Switch to login tab after successful registration
            setTimeout(() => {
                loginTab.click();
                registerForm.reset();
                messageEl.innerText = '';
            }, 2000);
        } else {
            messageEl.style.color = 'red';
            messageEl.innerText = result.message;
        }
    } catch (error) {
        messageEl.style.color = 'red';
        messageEl.innerText = 'An error occurred. Please try again.';
    }
});
