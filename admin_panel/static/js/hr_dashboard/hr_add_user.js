document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("hrAddUserForm");
    const submitBtn = document.getElementById("submitBtn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        Alerts.clearFieldErrors();
        Alerts.hide();

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (payload.role !== "EMPLOYEE" && payload.role !== "MANAGER") {
            Alerts.show("HR is only authorized to create Employee or Manager roles.");
            return;
        }

        if (payload.password !== payload.confirm_password) {
            Alerts.showFieldError("confirm_password", "Passwords do not match.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating...";

        try {
            await Api.post(APP_CONFIG.ENDPOINTS.ADD_USERS, payload);
            Alerts.show("Staff member created successfully by HR!", "success");
            form.reset();
        } catch (error) {
            if (error.data) {
                Alerts.handleValidationErrors(error.data);
            } else {
                Alerts.show(error.message || "Failed to create staff member.");
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Staff (HR)";
        }
    });
});