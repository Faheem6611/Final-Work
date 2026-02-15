document.addEventListener('DOMContentLoaded', function () {

    // ==============================
    // NAVIGATION & TAB SWITCHING
    // ==============================
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    showTab('home');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            showTab(this.getAttribute('data-tab'));
            navMenu.classList.remove('active');
        });
    });

    if (hamburger) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    function showTab(tabName) {
        tabContents.forEach(c => c.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));
        const tab = document.getElementById(tabName);
        if (tab) tab.classList.add('active');
        const link = document.querySelector(`[data-tab="${tabName}"]`);
        if (link) link.classList.add('active');
    }

    // ==============================
    // AUTHENTICATION FORMS
    // ==============================
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    authTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            switchAuthForm(this.getAttribute('data-form'));
        });
    });

    function switchAuthForm(formType) {
        authTabBtns.forEach(btn => btn.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));
        const form = document.getElementById(`${formType}-form`);
        if (form) form.classList.add('active');
        const btn = document.querySelector(`[data-form="${formType}"]`);
        if (btn) btn.classList.add('active');
    }

    window.switchAuthForm = switchAuthForm;

    // ==============================
    // FORM SUBMISSIONS
    // ==============================
    const loginForm = document.querySelector('#login-form ');
    const signupForm = document.querySelector('#signup-form');
    const contactForm = document.querySelector('#contact form');
    const checkReviewForm = document.querySelector('#check-review-form');

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) return alert('Please fill all fields.');

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) loginForm.reset();
        });
    }

    // ===============================
// SIGNUP HANDLER (FIXED)
// ===============================
document.getElementById("signup-form").addEventListener("submit", async function(e) {

    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    try {

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

    const data = await response.json();

    if (data.success) {
        alert("Signup successful!");
        document.getElementById("profile-pic").style.display = "inline-block";
        document.getElementById("profile-name").textContent = name;
        localStorage.setItem("username", name);
        signupForm.reset();
    } else {
        alert(data.message);  // shows "Email already registered"
    }

} catch (error) {

    console.error(error);
    alert("Server error. Please try again.");

}

});


   // CONTACT FORM SUBMIT WITH RESULT DISPLAY
const contactFormElement = document.getElementById("contact-form");
const contactResult = document.getElementById("contact-result");

if (contactFormElement) {

    contactFormElement.addEventListener("submit", async function(e) {

        e.preventDefault();

        contactResult.innerHTML = "<p>Sending message...</p>";

        const name = document.getElementById("contact-name").value;
        const email = document.getElementById("contact-email").value;
        const subject = document.getElementById("contact-subject").value;
        const message = document.getElementById("contact-message-text").value;

        try {

            const res = await fetch("/api/contact", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message
                })

            });

            const data = await res.json();

            if (data.success) {

                contactResult.innerHTML =
                    "<p style='color:green; font-weight:bold;'>✅ Message sent successfully!</p>";

                contactFormElement.reset();

            } else {

                contactResult.innerHTML =
                    "<p style='color:red;'>❌ " + data.message + "</p>";

            }

        } catch (error) {

            contactResult.innerHTML =
                "<p style='color:red;'>❌ Server error. Try again.</p>";

        }

    });

}

    // ===============================
// CHECK REVIEW WITH MODAL POPUP
// ===============================

// Get modal and close button
const modal = document.getElementById("reviewModal");
const closeBtn = document.querySelector(".close");
const checkBtn = document.getElementById("checkBtn");

checkBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // prevent default form submission

    const reviewText = document.getElementById("review-text").value.trim();
    if (!reviewText) {
        alert("Please enter a review!");
        return;
    }

    try {
        const res = await fetch("/api/check_review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review: reviewText })
        });

        const data = await res.json();

        if (res.ok) {
            // Populate modal with data
            document.getElementById("modalReview").textContent = data.review;
            document.getElementById("modalPrediction").textContent = data.prediction;
            document.getElementById("modalConfidence").textContent = data.confidence_percent;

            // Show modal
            modal.style.display = "block";
        } else {
            alert(data.error || "Error analyzing review");
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Try again later.");
    }
});

// Close modal on click
closeBtn.onclick = () => {
    modal.style.display = "none";
};

// Close modal if user clicks outside
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};


    // ==============================
    // FORM VALIDATION
    // ==============================
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    emailInputs.forEach(input => {
        input.addEventListener('blur', function () {
            this.style.borderColor = this.value && !validateEmail(this.value) ? '#e74c3c' : '#ddd';
        });
    });

    passwordInputs.forEach(input => {
        input.addEventListener('blur', function () {
            this.style.borderColor = this.value && !validatePassword(this.value) ? '#e74c3c' : '#ddd';
        });
    });

    // ==============================
    // ACCORDION FAQ
    // ==============================
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('active');
        });
    });

    // ==============================
    // CTA BUTTON
    // ==============================
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => showTab('registration'));
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
        // ===============================
// PROFILE ICON ACTIVATION
// ===============================

// After successful signup
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (data.success) {
        // Show profile icon and name
        document.getElementById("profile-pic").style.display = "inline-block";
        document.getElementById("profile-name").textContent = name;

        switchTab('home'); // Optional: redirect to home
        alert(data.message);
    } else {
        alert(data.message);
    }
}

// After successful login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) {
        // Show profile icon and name
        document.getElementById("profile-pic").style.display = "inline-block";
        document.getElementById("profile-name").textContent = data.name;

        switchTab('home');
        alert(data.message);
    } else {
        alert(data.message);
    }
}

// Add event listeners
document.getElementById("signup-form").addEventListener("submit", handleSignup);
document.getElementById("login-form").addEventListener("submit", handleLogin);
const savedUser = localStorage.getItem("username");

if (savedUser) {
    document.getElementById("profile-pic").style.display = "inline-block";
    document.getElementById("profile-name").textContent = savedUser;
}
async function logout() {
    const res = await fetch("/logout", {
        method: "POST"
    });

    const data = await res.json();

    if (data.success) {
        alert("Logged out successfully");
        location.reload(); // refresh page
    }
}
async function logout() {
    await fetch("/logout", { method: "POST" });
    localStorage.removeItem("username");
    location.reload();
}
    });
});
