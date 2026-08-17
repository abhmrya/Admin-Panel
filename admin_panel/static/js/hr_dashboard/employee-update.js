/**
 * ==========================================================
 * employee-update.js
 * ==========================================================
 * HR Employee Update Modal
 * ==========================================================
 */

const EmployeeUpdate = {

    modal:
        document.getElementById(
            "userModal"
        ),

    form:
        document.getElementById(
            "userForm"
        ),


    /**
     * ======================================================
     * LOAD DEPARTMENTS
     * ======================================================
     */

    async loadDepartments(
        selectedId = null
    ) {

        const select =
            document.getElementById(
                "department"
            );


        if (!select) {

            return;

        }


        try {

            select.innerHTML = `

                <option value="">
                    Loading departments...
                </option>

            `;


            const data =
                await DepartmentService.list();


            const departments =
                data?.results ||
                data ||
                [];


            select.innerHTML = `

                <option value="">
                    Select Department
                </option>

            `;


            departments.forEach(
                department => {

                    select.insertAdjacentHTML(
                        "beforeend",
                        `

                        <option
                            value="${department.id}"
                        >

                            ${escapeHtml(
                                department.name
                            )}

                        </option>

                        `
                    );

                }
            );


            /*
             * API gives:
             *
             * department: "UUID"
             *
             * So directly use selectedId.
             */

            if (selectedId) {

                select.value =
                    selectedId;

            }

        }
        catch (error) {

            console.error(
                "Department error:",
                error
            );


            select.innerHTML = `

                <option value="">
                    Unable to load departments
                </option>

            `;

        }

    },


    /**
     * ======================================================
     * OPEN MODAL
     * ======================================================
     */

    async open(
        employee
    ) {

        if (!employee) {

            console.error(
                "Employee data is required."
            );

            return;

        }


        Alerts.hide();
        Alerts.clearFieldErrors();


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Employee";


        document.getElementById(
            "userId"
        ).value =
            employee.id || "";


        document.getElementById(
            "username"
        ).value =
            employee.username || "";


        document.getElementById(
            "email"
        ).value =
            employee.email || "";


        document.getElementById(
            "first_name"
        ).value =
            employee.first_name || "";


        document.getElementById(
            "last_name"
        ).value =
            employee.last_name || "";


        /*
         * HR employee API returns role.
         */

        document.getElementById(
            "role"
        ).value =
            employee.role || "EMPLOYEE";


        document.getElementById(
            "is_active"
        ).value =
            String(
                employee.is_active
            );


        /*
         * IMPORTANT:
         *
         * API:
         *
         * department: "UUID"
         *
         * NOT:
         *
         * department: {
         *     id: "UUID"
         * }
         */

        await this.loadDepartments(
            employee.department
        );


        this.modal.classList.remove(
            "hidden"
        );


        this.modal.classList.add(
            "flex"
        );

    },


    /**
     * ======================================================
     * CLOSE MODAL
     * ======================================================
     */

    close() {

        this.modal.classList.remove(
            "flex"
        );


        this.modal.classList.add(
            "hidden"
        );


        this.form.reset();


        const userId =
            document.getElementById(
                "userId"
            );


        if (userId) {

            userId.value = "";

        }


        Alerts.hide();
        Alerts.clearFieldErrors();

    }

};


/**
 * ==========================================================
 * GLOBAL
 * ==========================================================
 */

window.EmployeeUpdate =
    EmployeeUpdate;


/**
 * ==========================================================
 * CLOSE BUTTON
 * ==========================================================
 */

const closeModal =
    document.getElementById(
        "closeModal"
    );


if (closeModal) {

    closeModal.addEventListener(
        "click",
        () =>
            EmployeeUpdate.close()
    );

}


/**
 * ==========================================================
 * CANCEL BUTTON
 * ==========================================================
 */

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );


if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        () =>
            EmployeeUpdate.close()
    );

}


/**
 * ==========================================================
 * FORM SUBMIT
 * ==========================================================
 */

if (
    EmployeeUpdate.form
) {

    EmployeeUpdate.form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            Alerts.hide();
            Alerts.clearFieldErrors();


            const id =
                document.getElementById(
                    "userId"
                ).value;


            if (!id) {

                Alerts.show(
                    "Employee ID is missing.",
                    "error"
                );

                return;

            }


            /**
             * ==================================================
             * PAYLOAD
             * ==================================================
             */

            const payload = {

                username:
                    document
                        .getElementById(
                            "username"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim(),

                first_name:
                    document
                        .getElementById(
                            "first_name"
                        )
                        .value
                        .trim(),

                last_name:
                    document
                        .getElementById(
                            "last_name"
                        )
                        .value
                        .trim(),

                role:
                    document
                        .getElementById(
                            "role"
                        )
                        .value,

                department:
                    document
                        .getElementById(
                            "department"
                        )
                        .value ||
                    null,

                is_active:
                    document
                        .getElementById(
                            "is_active"
                        )
                        .value ===
                    "true"

            };


            console.log(
                "HR employee update:",
                id,
                payload
            );


            try {

                await HrEmployeeService.update(
                    id,
                    payload
                );


                Alerts.show(
                    "Employee updated successfully.",
                    "success"
                );


                EmployeeUpdate.close();


                /*
                 * Reload employee list.
                 */

                if (
                    typeof window.loadEmployees ===
                    "function"
                ) {

                    await window.loadEmployees();

                }

            }
            catch (error) {

                console.error(
                    "Employee update error:",
                    error
                );


                if (
                    error?.data
                ) {

                    Alerts.handleValidationErrors(
                        error.data
                    );

                }
                else {

                    Alerts.show(
                        error?.message ||
                        "Unable to update employee.",
                        "error"
                    );

                }

            }

        }
    );

}


/**
 * ==========================================================
 * HTML ESCAPE
 * ==========================================================
 */

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}