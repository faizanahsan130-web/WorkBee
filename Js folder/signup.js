document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('.auth-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const password = signupForm.querySelector('input[type="password"]:nth-of-type(1)').value;
            const confirmPassword = signupForm.querySelector('input[type="password"]:nth-of-type(2)').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match! Please check again.');
                return;
            }

            // Successful signup simulation
            alert('Account created successfully! Redirecting to login...');
            window.location.href = 'login.html';
        });
    }
});