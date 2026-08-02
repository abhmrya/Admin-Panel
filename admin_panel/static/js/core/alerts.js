/**
 * ==========================================================
 * alerts.js
 * ==========================================================
 * Global Alert & Form Validation Helper
 * ==========================================================
 */

const Alerts = {

    show(message, type = "error") {

        const wrapper =
            document.getElementById("alertBox");

        const box =
            document.getElementById("alertInner");

        if (!wrapper || !box)
            return;

        const styles = {

            error:
                "border-red-200 bg-red-50 text-red-700",

            success:
                "border-green-200 bg-green-50 text-green-700",

            warning:
                "border-yellow-200 bg-yellow-50 text-yellow-700",

            info:
                "border-blue-200 bg-blue-50 text-blue-700",

        };

        box.className =
            "rounded-lg border px-4 py-3 text-sm " +
            styles[type];

        box.textContent = message;

        wrapper.classList.remove("hidden");

    },



    hide() {

        const wrapper =
            document.getElementById("alertBox");

        if (wrapper)
            wrapper.classList.add("hidden");

    },



    showFieldError(field, message) {

        const element = document.querySelector(

            `.field-error[data-field="${field}"]`

        );

        if (!element) {

            this.show(message);

            return;

        }

        element.textContent = message;

        element.classList.remove("hidden");

    },



    clearFieldErrors() {

        document

            .querySelectorAll(".field-error")

            .forEach(el => {

                el.textContent = "";

                el.classList.add("hidden");

            });

    },



    handleValidationErrors(errors) {

        if (!errors)
            return;

        let fieldFound = false;

        Object.entries(errors)

            .forEach(([field, value]) => {

                const message =

                    Array.isArray(value)

                        ? value[0]

                        : value;

                if (

                    field === "detail" ||

                    field === "message" ||

                    field === "non_field_errors"

                ) {

                    this.show(message);

                }

                else {

                    fieldFound = true;

                    this.showFieldError(

                        field,

                        message

                    );

                }

            });

        if (!fieldFound && !errors.detail) {

            this.show(

                "Something went wrong."

            );

        }

    },

};

window.Alerts = Object.freeze(Alerts);