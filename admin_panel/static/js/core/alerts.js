/**
 * --------------------------------------------------------
 * alerts.js
 * --------------------------------------------------------
 * Global Alert & Form Error Handler
 *
 * Depends:
 * None
 *
 * --------------------------------------------------------
 */

const Alerts = {

    show(message, type = "error") {

        const alertBox =
            document.getElementById("alertBox");

        const alertInner =
            document.getElementById("alertInner");

        if (!alertBox || !alertInner)
            return;

        const styles = {

            success:
                "bg-green-50 border-green-200 text-green-700",

            error:
                "bg-red-50 border-red-200 text-red-700",

            warning:
                "bg-yellow-50 border-yellow-200 text-yellow-700",

            info:
                "bg-blue-50 border-blue-200 text-blue-700"

        };

        alertInner.className =
            "rounded-lg border px-4 py-3 text-sm flex items-center justify-between gap-3 " +
            (styles[type] || styles.error);

        alertInner.innerHTML = `
            <span>${message}</span>

            <button
                type="button"
                id="closeAlert"
                class="font-bold"
            >
                ✕
            </button>
        `;

        alertBox.classList.remove("hidden");

        document
            .getElementById("closeAlert")
            .onclick = () => this.hide();

    },

    hide() {

        const box =
            document.getElementById("alertBox");

        if (box)
            box.classList.add("hidden");

    },

    clearFieldErrors() {

        document
            .querySelectorAll(".field-error")
            .forEach((field) => {

                field.textContent = "";

                field.classList.add("hidden");

            });

    },

    showFieldError(fieldName, message) {

        const field =
            document.querySelector(
                `.field-error[data-field="${fieldName}"]`
            );

        if (!field) {

            this.show(message);

            return;

        }

        field.textContent = message;

        field.classList.remove("hidden");

    },

    handleValidationErrors(errors) {

        let hasFieldError = false;

        Object.entries(errors).forEach(

            ([field, messages]) => {

                const message =

                    Array.isArray(messages)
                        ? messages[0]
                        : messages;

                if (

                    field === "detail" ||

                    field === "non_field_errors"

                ) {

                    this.show(message);

                }

                else {

                    this.showFieldError(

                        field,

                        message

                    );

                    hasFieldError = true;

                }

            }

        );

        if (

            !hasFieldError &&

            !errors.detail &&

            !errors.non_field_errors

        ) {

            this.show(
                "Something went wrong."
            );

        }

    }

};

window.Alerts = Alerts;