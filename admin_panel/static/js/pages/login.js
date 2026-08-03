/**
 * =====================================================
 * login.js
 * Handles:
 * - Email/Password Login
 * - Google Login
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Login JS loaded");

    const isGuest = await Guard.guest();

    console.log("Guest check:", isGuest);

    if (!isGuest) {
        return;
    }

    console.log("Initializing login");

    initLoginForm();
    waitForGoogleSDK();

});


/* =====================================================
 * Email Login
 * ===================================================== */

function initLoginForm() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", handleLogin);

}


async function handleLogin(event) {

    event.preventDefault();

    Alerts.hide();
    Alerts.clearFieldErrors();

    const submitBtn = document.getElementById("submitBtn");

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    setLoading(
        submitBtn,
        true,
        "Logging in..."
    );

    try {

        await AuthService.login(
            email,
            password
        );

        window.location.replace(
            window.APP_CONFIG.ROUTES.DASHBOARD
        );

    }

    catch (error) {

        console.error(error);

        if (error.data) {

            Alerts.handleValidationErrors(
                error.data
            );

        }

        else {

            Alerts.show(
                error.message || "Unable to login."
            );

        }

    }

    finally {

        setLoading(
            submitBtn,
            false,
            "Login"
        );

    }

}


/* =====================================================
 * Google Login
 * ===================================================== */

function waitForGoogleSDK() {

    console.log("Waiting for Google SDK...");

    const timer = setInterval(() => {

        console.log(
            "Google status:",
            typeof google
        );


        if (
            typeof google !== "undefined" &&
            google.accounts &&
            google.accounts.id
        ) {

            console.log("Google SDK loaded");

            clearInterval(timer);

            initGoogleLogin();

        }

    },100);

}

function initGoogleLogin() {

    console.log("initGoogleLogin called");

    console.log(
        "Client ID:",
        window.GOOGLE_CLIENT_ID
    );

    const container =
        document.getElementById("google-signin-button");

    if (!container) {

        console.error(
            "Google button container not found."
        );

        return;

    }

    if (!window.GOOGLE_CLIENT_ID) {

        console.error(
            "GOOGLE_CLIENT_ID is missing."
        );

        return;

    }

    google.accounts.id.initialize({

        client_id: window.GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin,

        auto_select: false,

        cancel_on_tap_outside: true,

        // Disables the FedCM-based silent/auto sign-in prompt.
        // We only use the rendered button below, not One Tap,
        // so this avoids the background "gsi/transform" FedCM call.
        use_fedcm_for_prompt: false,

    });

    container.innerHTML = "";

    google.accounts.id.renderButton(

        container,

        {

            type: "standard",

            theme: "outline",

            size: "large",

            shape: "rectangular",

            text: "continue_with",

            width: 350,

        }

    );

}


async function handleGoogleLogin(response) {

    try {

        Alerts.hide();

        await AuthService.googleLogin(
            response.credential
        );

        window.location.replace(
            window.APP_CONFIG.ROUTES.DASHBOARD
        );

    }

    catch (error) {

        console.error(error);

        Alerts.show(

            error.message ||

            "Google login failed."

        );

    }

}


/* =====================================================
 * Helpers
 * ===================================================== */

function setLoading(
    button,
    loading,
    text
) {

    if (!button) return;

    button.disabled = loading;

    button.textContent = text;

}