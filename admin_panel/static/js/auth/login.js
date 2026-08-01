/**
 * login.js
 * Handles the login form on the login page.
 * Depends on: core/config.js, core/storage.js, core/auth.js, core/api.js, services/auth.service.js
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearErrors();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        setLoading(true);

        try {
            const data = await AuthService.login(email, password);

            if (data) {
                window.location.href = window.APP_CONFIG.ROUTES.DASHBOARD;
            }
        } catch (error) {
            handleFormError(error);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? "Logging in..." : "Login";
    }
});

/* ---------------------------------- */
/* Shared error-rendering helpers      */
/* ---------------------------------- */
function clearErrors() {
    document.querySelectorAll(".field-error").forEach((el) => {
        el.textContent = "";
        el.classList.add("hidden");
    });
    hideAlert();
}

function showFieldError(fieldName, message) {
    const el = document.querySelector(`.field-error[data-field="${fieldName}"]`);
    if (el) {
        el.textContent = message;
        el.classList.remove("hidden");
    } else {
        showAlert(message);
    }
}

function showAlert(message, type = "error") {
    const alertBox = document.getElementById("alertBox");
    const alertInner = document.getElementById("alertInner");
    if (!alertBox || !alertInner) return;

    const styles = {
        error: "bg-red-50 border-red-200 text-red-700",
        success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    };

    alertInner.className =
        "rounded-md border px-4 py-3 text-sm flex items-start justify-between gap-3 " +
        (styles[type] || styles.error);
    alertInner.textContent = message;
    alertBox.classList.remove("hidden");
}

function hideAlert() {
    const alertBox = document.getElementById("alertBox");
    if (alertBox) alertBox.classList.add("hidden");
}

function handleFormError(error) {
    const data = error && error.data;

    if (!data || typeof data !== "object") {
        showAlert((error && error.message) || "Something went wrong. Please try again.");
        return;
    }

    let shownFieldError = false;

    Object.entries(data).forEach(([field, messages]) => {
        const message = Array.isArray(messages) ? messages[0] : messages;

        if (field === "non_field_errors" || field === "detail") {
            showAlert(message);
        } else {
            showFieldError(field, message);
            shownFieldError = true;
        }
    });

    if (!shownFieldError && !data.non_field_errors && !data.detail) {
        showAlert("Invalid credentials. Please check your email and password.");
    }
}