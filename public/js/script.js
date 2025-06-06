function togglePassword() {
    const passwordInput = document.getElementById('account_password')
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'
    passwordInput.setAttribute('type', type)
}

