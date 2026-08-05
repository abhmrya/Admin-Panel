/**
 * =====================================================
 * user-update.js
 * =====================================================
 */

const UserUpdate = {

    modal: document.getElementById("userModal"),

    form: document.getElementById("userForm"),

    open(user) {

        Alerts.hide();
        Alerts.clearFieldErrors();

        document.getElementById("modalTitle").textContent =
            "Edit User";

        document.getElementById("userId").value =
            user.id;

        document.getElementById("username").value =
            user.username || "";

        document.getElementById("email").value =
            user.email || "";

        document.getElementById("first_name").value =
            user.first_name || "";

        document.getElementById("last_name").value =
            user.last_name || "";

        document.getElementById("role").value =
            user.role;

        document.getElementById("is_active").value =
            String(user.is_active);

        this.modal.classList.remove("hidden");
        this.modal.classList.add("flex");

    },

    close() {

        this.modal.classList.remove("flex");
        this.modal.classList.add("hidden");

        this.form.reset();

        Alerts.hide();
        Alerts.clearFieldErrors();

    }

};

window.UserUpdate = UserUpdate;


/*
|--------------------------------------------------------------------------
| Close Modal
|--------------------------------------------------------------------------
*/

document
    .getElementById("closeModal")
    .addEventListener("click", () => {

        UserUpdate.close();

    });


document
    .getElementById("cancelBtn")
    .addEventListener("click", () => {

        UserUpdate.close();

    });


/*
|--------------------------------------------------------------------------
| Save User
|--------------------------------------------------------------------------
*/

document
    .getElementById("userForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        Alerts.hide();
        Alerts.clearFieldErrors();

        const id =
            document.getElementById("userId").value;

        const data = {

            username:
                document.getElementById("username").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            first_name:
                document.getElementById("first_name").value.trim(),

            last_name:
                document.getElementById("last_name").value.trim(),

            role:
                document.getElementById("role").value,

            is_active:
                document.getElementById("is_active").value === "true",

        };

        try {

            await UserUpdateService.update(
                id,
                data
            );

            Alerts.show(
                "User updated successfully.",
                "success"
            );

            UserUpdate.close();

            window.loadUsers();

        }

        catch (error) {

            console.log("Error:", error);
            console.log("Status:", error.status);
            console.log("Data:", error.data);

            if (error.data) {

                Alerts.handleValidationErrors(
                    error.data
                );

            }

            else {

                Alerts.show(
                    error.message
                );

            }

        }

    });