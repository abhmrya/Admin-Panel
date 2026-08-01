/**
 * -------------------------------------------------------
 * login.js
 * -------------------------------------------------------
 * Login Page Controller
 *
 * Depends:
 * config.js
 * storage.js
 * auth.js
 * api.js
 * guard.js
 * alerts.js
 * auth.service.js
 * -------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", async () => {

    await Guard.guest();

    initLoginForm();

});

function initLoginForm() {

    const form = document.getElementById("loginForm");

    if (!form)
        return;

    form.addEventListener(

        "submit",

        handleLogin

    );

}

async function handleLogin(event) {

    event.preventDefault();

    Alerts.hide();

    Alerts.clearFieldErrors();

    const submitBtn =
        document.getElementById("submitBtn");

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
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

        window.location.href =
            window.APP_CONFIG.ROUTES.DASHBOARD;

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

                error.message ||

                "Unable to login."

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

function setLoading(

    button,

    loading,

    text

) {

    if (!button)
        return;

    button.disabled = loading;

    button.textContent = text;

}