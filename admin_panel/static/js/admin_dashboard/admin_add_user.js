document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminAddUserForm");
    const submitBtn = document.getElementById("submitBtn");

    if (!form || !submitBtn) {
        console.error("Admin Add User form not found.");
        return;
    }

    const submitText = submitBtn.querySelector("span");


    // =========================================================
    // HELPERS
    // =========================================================

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;

        if (submitText) {
            submitText.textContent = isLoading
                ? "Creating..."
                : "Create User Account";
        }
    }


    function clearErrors() {
        Alerts.clearFieldErrors();
        Alerts.hide();
    }


    function getFormPayload() {
        const formData = new FormData(form);

        return Object.fromEntries(formData.entries());
    }


    // =========================================================
    // FORM SUBMIT
    // =========================================================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearErrors();


        // -----------------------------------------------------
        // GET FORM DATA
        // -----------------------------------------------------

        const payload = getFormPayload();


        // -----------------------------------------------------
        // FRONTEND PASSWORD CHECK
        // -----------------------------------------------------

        if (payload.password !== payload.confirm_password) {
            Alerts.showFieldError(
                "confirm_password",
                "Passwords do not match."
            );

            return;
        }


        // -----------------------------------------------------
        // OPTIONAL: TRIM NORMAL TEXT FIELDS
        // -----------------------------------------------------

        payload.first_name = payload.first_name?.trim();
        payload.last_name = payload.last_name?.trim();
        payload.username = payload.username?.trim();
        payload.email = payload.email?.trim();
        payload.phone_number = payload.phone_number?.trim();


        // -----------------------------------------------------
        // SEND REQUEST
        // -----------------------------------------------------

        setLoading(true);

        try {
            const response = await Api.post(
                APP_CONFIG.ENDPOINTS.ADD_USERS,
                payload
            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            Alerts.show(
                "User created successfully by Admin!",
                "success"
            );

            form.reset();


            console.log("User created successfully:", response);


        } catch (error) {

            console.error(
                "Admin Add User Error:",
                error
            );


            // -------------------------------------------------
            // DJANGO / DRF VALIDATION ERRORS
            // -------------------------------------------------

            if (error.data) {
                Alerts.handleValidationErrors(
                    error.data
                );

                return;
            }


            // -------------------------------------------------
            // GENERAL ERROR
            // -------------------------------------------------

            Alerts.show(
                error.message ||
                "Failed to create user."
            );


        } finally {

            setLoading(false);
        }
    });
});