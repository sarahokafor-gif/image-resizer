/**
 * Authentication Module for Chronology Builder
 * Handles Firebase email/password authentication
 */

const ChronologyAuth = {
    currentUser: null,
    isLoading: true,

    // Initialize auth state listener
    init() {
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.isLoading = false;

            if (user) {
                console.log('User logged in:', user.email);
                this.hideAuthModal();
                this.showUserMenu();
            } else {
                console.log('No user logged in');
                this.showAuthModal();
                this.hideUserMenu();
            }
        });
    },

    // Login with email and password
    async login(email, password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    // Register new account
    async register(email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            if (userCredential.user) {
                await userCredential.user.sendEmailVerification();
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    // Send password reset email
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },

    // Logout
    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get user-friendly error messages
    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
            'auth/user-not-found': 'No account found with this email. Please register first.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Incorrect email or password. Please try again.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        };
        return messages[code] || 'An error occurred. Please try again.';
    },

    // Show auth modal
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    // Hide auth modal
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    // Show user menu in header
    showUserMenu() {
        const userMenu = document.getElementById('userMenuBtn');
        const userEmail = document.getElementById('userEmail');
        if (userMenu && this.currentUser) {
            const initial = this.currentUser.email ? this.currentUser.email[0].toUpperCase() : 'U';
            userMenu.querySelector('.user-initial').textContent = initial;
            userMenu.classList.remove('hidden');

            if (userEmail) {
                userEmail.textContent = this.currentUser.email;
            }
        }
    },

    // Hide user menu
    hideUserMenu() {
        const userMenu = document.getElementById('userMenuBtn');
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
    }
};

// Auth Modal Form Handling
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;

    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const disclaimerBox = document.getElementById('disclaimerBox');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const resetPasswordView = document.getElementById('resetPasswordView');
    const loginRegisterView = document.getElementById('loginRegisterView');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const resetForm = document.getElementById('resetForm');
    const resetError = document.getElementById('resetError');
    const resetSuccess = document.getElementById('resetSuccess');

    let isLoginMode = true;

    function setMode(login) {
        isLoginMode = login;
        authError.classList.add('hidden');
        authSuccess.classList.add('hidden');

        if (login) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Log in to access Chronology Builder';
            authSubmitBtn.textContent = 'Log In';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchBtn.textContent = 'Register for free';
            confirmPasswordGroup.classList.add('hidden');
            disclaimerBox.classList.add('hidden');
            forgotPasswordBtn.classList.remove('hidden');
        } else {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Register for free access';
            authSubmitBtn.textContent = 'Create Account';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchBtn.textContent = 'Log in';
            confirmPasswordGroup.classList.remove('hidden');
            disclaimerBox.classList.remove('hidden');
            forgotPasswordBtn.classList.add('hidden');
        }
    }

    authSwitchBtn?.addEventListener('click', () => {
        setMode(!isLoginMode);
    });

    forgotPasswordBtn?.addEventListener('click', () => {
        loginRegisterView.classList.add('hidden');
        resetPasswordView.classList.remove('hidden');
    });

    backToLoginBtn?.addEventListener('click', () => {
        resetPasswordView.classList.add('hidden');
        loginRegisterView.classList.remove('hidden');
        resetError.classList.add('hidden');
        resetSuccess.classList.add('hidden');
    });

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const confirmPassword = document.getElementById('authConfirmPassword')?.value;

        authError.classList.add('hidden');
        authSuccess.classList.add('hidden');
        authSubmitBtn.disabled = true;
        authSubmitBtn.innerHTML = '<div class="loading-spinner-small"></div>';

        if (!email || !password) {
            showAuthError('Please fill in all fields');
            return;
        }

        if (!isLoginMode) {
            if (password !== confirmPassword) {
                showAuthError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                showAuthError('Password must be at least 6 characters');
                return;
            }
            if (!termsCheckbox?.checked) {
                showAuthError('You must accept the disclaimer to register');
                return;
            }
        }

        let result;
        if (isLoginMode) {
            result = await ChronologyAuth.login(email, password);
        } else {
            result = await ChronologyAuth.register(email, password);
            if (result.success) {
                showAuthSuccess('Account created! You can now use Chronology Builder.');
            }
        }

        if (!result.success) {
            showAuthError(result.error);
        }

        setMode(isLoginMode);
    });

    resetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('resetEmail').value.trim();
        const submitBtn = resetForm.querySelector('button[type="submit"]');

        resetError.classList.add('hidden');
        resetSuccess.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading-spinner-small"></div>';

        const result = await ChronologyAuth.resetPassword(email);

        if (result.success) {
            resetSuccess.textContent = 'Password reset email sent! Check your inbox.';
            resetSuccess.classList.remove('hidden');
        } else {
            resetError.textContent = result.error;
            resetError.classList.remove('hidden');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    });

    function showAuthError(message) {
        authError.textContent = message;
        authError.classList.remove('hidden');
        authSubmitBtn.disabled = false;
        setMode(isLoginMode);
    }

    function showAuthSuccess(message) {
        authSuccess.textContent = message;
        authSuccess.classList.remove('hidden');
        authSubmitBtn.disabled = false;
    }

    // User menu dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    userMenuBtn?.addEventListener('click', () => {
        userDropdown?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!userMenuBtn?.contains(e.target) && !userDropdown?.contains(e.target)) {
            userDropdown?.classList.add('hidden');
        }
    });

    logoutBtn?.addEventListener('click', async () => {
        await ChronologyAuth.logout();
        userDropdown?.classList.add('hidden');
    });

    // Initialize auth
    ChronologyAuth.init();
});
