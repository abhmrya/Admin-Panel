/**
 * ==========================================================
 * employees.js
 * ==========================================================
 * HR Employee Management
 * ==========================================================
 */

const EmployeesState = {

    users: [],

    count: 0,

    next: null,

    previous: null,

    currentUrl:
        "/employees-list/",

    page: 1

};


/**
 * ==========================================================
 * PAGE INITIALIZATION
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    initializeEmployeesPage
);


async function initializeEmployeesPage() {

    console.log(
        "HR Employee Management initialized."
    );


    await loadEmployees();

}


/**
 * ==========================================================
 * LOAD EMPLOYEES
 * ==========================================================
 */

async function loadEmployees(
    url = null
) {

    try {

        const endpoint =
            url ||
            EmployeesState.currentUrl;


        console.log(
            "Loading employees:",
            endpoint
        );


        const response =
            await HrEmployeeService.list(
                getQueryParams(endpoint)
            );


        if (!response) {

            throw new Error(
                "Unable to load employees."
            );

        }


        EmployeesState.users =
            response.results || [];


        EmployeesState.count =
            response.count || 0;


        EmployeesState.next =
            response.next || null;


        EmployeesState.previous =
            response.previous || null;


        EmployeesState.currentUrl =
            endpoint;


        renderEmployees(
            EmployeesState.users
        );


        renderPagination(
            response
        );


        updateEmployeeCount(
            response.count
        );

    }
    catch (error) {

        console.error(
            "Employees loading error:",
            error
        );


        showEmployeeError(
            error.message ||
            "Unable to load employees."
        );

    }

}


/**
 * ==========================================================
 * QUERY PARAMS
 * ==========================================================
 */

function getQueryParams(url) {

    try {

        const parsed =
            new URL(
                url,
                window.location.origin
            );


        const params = {};


        parsed.searchParams.forEach(
            (value, key) => {

                params[key] =
                    value;

            }
        );


        return params;

    }
    catch (error) {

        console.error(
            "Invalid URL:",
            url
        );


        return {};

    }

}


/**
 * ==========================================================
 * RENDER EMPLOYEES
 * ==========================================================
 */

function renderEmployees(
    employees
) {

    const tbody =
        document.getElementById(
            "employeesTableBody"
        );


    if (!tbody) {

        console.error(
            "#employeesTableBody not found."
        );

        return;

    }


    tbody.innerHTML = "";


    if (!employees.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="px-6 py-10 text-center
                           text-gray-500"
                >

                    No employees found.

                </td>

            </tr>

        `;

        return;

    }


    employees.forEach(
        employee => {

            tbody.insertAdjacentHTML(
                "beforeend",
                createEmployeeRow(
                    employee
                )
            );

        }
    );

}


/**
 * ==========================================================
 * CREATE EMPLOYEE ROW
 * ==========================================================
 */

function createEmployeeRow(
    employee
) {

    const fullName =
        `${employee.first_name || ""} ${employee.last_name || ""}`
            .trim();


    const statusClass =
        employee.is_active
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";


    const statusText =
        employee.is_active
            ? "Active"
            : "Inactive";


    return `

        <tr
            class="border-b border-gray-100
                   hover:bg-gray-50"
        >

            <!-- NAME -->

            <td class="px-6 py-4">

                <div class="font-medium text-gray-900">

                    ${escapeHtml(
                        fullName ||
                        employee.username ||
                        "-"
                    )}

                </div>

                <div class="text-sm text-gray-500">

                    ${escapeHtml(
                        employee.username ||
                        "-"
                    )}

                </div>

            </td>


            <!-- EMAIL -->

            <td class="px-6 py-4 text-gray-600">

                ${escapeHtml(
                    employee.email ||
                    "-"
                )}

            </td>


            <!-- ROLE -->

            <td class="px-6 py-4">

                <span
                    class="inline-flex
                           rounded-full
                           bg-blue-100
                           px-3 py-1
                           text-xs
                           font-medium
                           text-blue-700"
                >

                    ${escapeHtml(
                        employee.role ||
                        "-"
                    )}

                </span>

            </td>


            <!-- DEPARTMENT -->

            <td class="px-6 py-4 text-gray-600">

                ${escapeHtml(
                    employee.department_name ||
                    "-"
                )}

            </td>


            <!-- STATUS -->

            <td class="px-6 py-4">

                <span
                    class="inline-flex
                           rounded-full
                           px-3 py-1
                           text-xs
                           font-medium
                           ${statusClass}"
                >

                    ${statusText}

                </span>

            </td>


            <!-- CREATED -->

            <td class="px-6 py-4 text-gray-500">

                ${formatDate(
                    employee.created_at
                )}

            </td>


            <!-- ACTIONS -->

            <td class="px-6 py-4">

                <button
                    type="button"
                    onclick="handleEditEmployee('${employee.id}')"
                    class="text-blue-600
                           hover:text-blue-800
                           font-medium"
                >

                    Edit

                </button>

            </td>

        </tr>

    `;

}


/**
 * ==========================================================
 * EDIT EMPLOYEE
 * ==========================================================
 */

function handleEditEmployee(
    employeeId
) {

    const employee =
        EmployeesState.users.find(
            item =>
                item.id === employeeId
        );


    if (!employee) {

        console.error(
            "Employee not found:",
            employeeId
        );

        return;

    }


    if (
        typeof window.EmployeeUpdate?.open ===
        "function"
    ) {

        EmployeeUpdate.open(
            employee
        );

        return;

    }


    console.error(
        "EmployeeUpdate.open() is not available."
    );

}


/**
 * ==========================================================
 * PAGINATION
 * ==========================================================
 */

function renderPagination(
    response
) {

    const previousButton =
        document.getElementById(
            "previousPageBtn"
        );


    const nextButton =
        document.getElementById(
            "nextPageBtn"
        );


    if (previousButton) {

        previousButton.disabled =
            !response.previous;

    }


    if (nextButton) {

        nextButton.disabled =
            !response.next;

    }

}


/**
 * ==========================================================
 * PREVIOUS PAGE
 * ==========================================================
 */

async function previousPage() {

    if (
        !EmployeesState.previous
    ) {

        return;

    }


    await loadEmployees(
        EmployeesState.previous
    );

}


/**
 * ==========================================================
 * NEXT PAGE
 * ==========================================================
 */

async function nextPage() {

    if (
        !EmployeesState.next
    ) {

        return;

    }


    await loadEmployees(
        EmployeesState.next
    );

}


/**
 * ==========================================================
 * EMPLOYEE COUNT
 * ==========================================================
 */

function updateEmployeeCount(
    count
) {

    const element =
        document.getElementById(
            "employeeCount"
        );


    if (element) {

        element.textContent =
            count || 0;

    }

}


/**
 * ==========================================================
 * ERROR
 * ==========================================================
 */

function showEmployeeError(
    message
) {

    const tbody =
        document.getElementById(
            "employeesTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="px-6 py-10
                       text-center
                       text-red-500"
            >

                ${escapeHtml(
                    message
                )}

            </td>

        </tr>

    `;

}


/**
 * ==========================================================
 * DATE FORMAT
 * ==========================================================
 */

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "-";

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
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


/**
 * ==========================================================
 * GLOBAL FUNCTIONS
 * ==========================================================
 */

window.loadEmployees =
    loadEmployees;

window.previousPage =
    previousPage;

window.nextPage =
    nextPage;

window.handleEditEmployee =
    handleEditEmployee;