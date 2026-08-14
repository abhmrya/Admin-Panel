const form = document.getElementById("forgotPasswordForm");

const emailInput = document.getElementById("email");

const submitBtn = document.getElementById("submitBtn");

const message = document.getElementById("message");

const emailError = document.querySelector(
    '[data-field="email"]'
);


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();

    const email = emailInput.value.trim();


    if (!email) {

        showFieldError(
            "email",
            "Email address is required."
        );

        return;
    }


    if (!isValidEmail(email)) {

        showFieldError(
            "email",
            "Enter a valid email address."
        );

        return;
    }


    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";


    try {

        const response = await fetch(
            "/api/v1/auth/password/forgot/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            handleApiError(data);

            return;
        }


        showMessage(
            data.message ||
            "If an account exists with this email, a password reset link has been sent.",
            "success"
        );


        form.reset();


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "Send Reset Link";

    }

});


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function showFieldError(field, text) {

    const errorElement = document.querySelector(
        `[data-field="${field}"]`
    );

    if (!errorElement) {
        return;
    }

    errorElement.textContent = text;

    errorElement.classList.remove(
        "hidden"
    );

}


function handleApiError(data) {

    if (data.email) {

        const error = Array.isArray(data.email)
            ? data.email[0]
            : data.email;

        showFieldError(
            "email",
            error
        );

        return;
    }


    showMessage(
        data.detail ||
        data.message ||
        "Unable to send reset link.",
        "error"
    );

}


function showMessage(text, type) {

    message.textContent = text;

    message.classList.remove(
        "hidden",
        "bg-red-100",
        "text-red-700",
        "bg-green-100",
        "text-green-700"
    );


    if (type === "error") {

        message.classList.add(
            "bg-red-100",
            "text-red-700"
        );

    } else {

        message.classList.add(
            "bg-green-100",
            "text-green-700"
        );

    }

}


function clearMessages() {

    message.classList.add(
        "hidden"
    );

    message.textContent = "";

    emailError.classList.add(
        "hidden"
    );

    emailError.textContent = "";

}