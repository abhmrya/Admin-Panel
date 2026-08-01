/**
 * -------------------------------------------------------
 * register.js
 * -------------------------------------------------------
 * Register Page Controller
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

console.log("register.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");

    const form = document.getElementById("registerForm");
    console.log(form);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Submit intercepted");
    });
});

document.addEventListener("DOMContentLoaded", async () => {

    await Guard.guest();

    initRegisterForm();

});

function initRegisterForm() {

    const form = document.getElementById("registerForm");

    if (!form)
        return;

    form.addEventListener(

        "submit",

        handleRegister

    );

}

async function handleRegister(event) {

    event.preventDefault();

    Alerts.hide();

    Alerts.clearFieldErrors();

    const submitBtn =
        document.getElementById("submitBtn");

    const payload = {

        username:
            document.getElementById("username").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        first_name:
            document.getElementById("first_name").value.trim(),

        last_name:
            document.getElementById("last_name").value.trim(),

        password:
            document.getElementById("password").value,

        confirm_password:
            document.getElementById("confirm_password").value

    };

    setLoading(

        submitBtn,

        true,

        "Creating Account..."

    );

    try {

        await AuthService.register(payload);

        Alerts.show(

            "Registration successful. Redirecting to login...",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                window.APP_CONFIG.ROUTES.LOGIN;

        }, 1500);

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

                "Registration failed."

            );

        }

    }

    finally {

        setLoading(

            submitBtn,

            false,

            "Create Account"

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