import { supabase } from './supabaseClient.js';

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const errorBox = document.getElementById('auth-error');
const messageBox = document.getElementById('auth-message');

function showMessage(el, text, isError = false) {
    el.textContent = text;
    el.classList.remove("hidden");
    el.classList.toggle("text-red-500", isError);
    el.classList.toggle("text-green-600", !isError);
    setTimeout(() => el.classList.add("hidden"), 4000);
}

let authMode = 'login';
loginButton.addEventListener('click', () => authMode = 'login');
signupButton.addEventListener('click', () => authMode = 'signup');

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage(errorBox, "Please enter both email and password.", true);
        return;
    }

    loginButton.disabled = true;
    signupButton.disabled = true;

    try {
        if (authMode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showMessage(messageBox, "Login successful! Redirecting...");
            setTimeout(() => {
                window.location.href = 'tasks.html';
            }, 1000);
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            showMessage(messageBox, 'Signup successful! Please check your email to confirm.');
        }
    } catch (err) {
        showMessage(errorBox, err.message, true);
    } finally {
        loginButton.disabled = false;
        signupButton.disabled = false;
    }
});