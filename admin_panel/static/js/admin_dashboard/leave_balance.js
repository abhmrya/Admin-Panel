/**
 * ==========================================================
 * LEAVE BALANCE MANAGEMENT
 * ==========================================================
 * Features:
 * - Add / Edit / Delete Leave Balance
 * - Search / Filter / Pagination
 * - Employee source: GET /api/v1/users/
 * - Only EMPLOYEE role users are displayed
 * - User ID is UUID. Never use Number() on employee/user ID.
 * - Leave Balance requires:
 *      user
 *      leave_type
 *      year
 *      allocated_days
 *      used_days
 * ==========================================================
 */

console.log("LEAVE BALANCE JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let leaveBalances = [];
let filteredLeaveBalances = [];
let leaveBalanceEmployees = [];
let leaveBalanceTypes = [];

let currentLeaveBalancePage = 1;
const leaveBalanceRowsPerPage = 10;

let editingLeaveBalanceId = null;
let deletingLeaveBalanceId = null;


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing Leave Balance module...");

    bindLeaveBalanceEvents();

    setDefaultLeaveBalanceYear();

    await Promise.all([
        loadLeaveBalanceEmployees(),
        loadLeaveBalanceTypes(),
        loadLeaveBalances()
    ]);

    console.log("Leave Balance module initialized.");
});


/* ==========================================================
   EVENT BINDING
========================================================== */

function bindLeaveBalanceEvents() {
    const addButton = document.getElementById("addLeaveBalanceBtn");
    const closeButton = document.getElementById("closeLeaveBalanceModal");
    const cancelButton = document.getElementById("cancelLeaveBalanceBtn");
    const form = document.getElementById("leaveBalanceForm");
    const searchInput = document.getElementById("leaveBalanceSearch");
    const typeFilter = document.getElementById("leaveBalanceLeaveType");
    const resetButton = document.getElementById("resetLeaveBalanceFilters");
    const modalBackdrop = document.getElementById("leaveBalanceModalBackdrop");
    const cancelDelete = document.getElementById("cancelDeleteLeaveBalance");
    const confirmDelete = document.getElementById("confirmDeleteLeaveBalance");
    const allocatedInput = document.getElementById("leaveBalanceAllocated");
    const usedInput = document.getElementById("leaveBalanceUsed");

    if (addButton) {
        addButton.addEventListener("click", openAddLeaveBalanceModal);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeLeaveBalanceModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeLeaveBalanceModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", event => {
            if (event.target === modalBackdrop) {
                closeLeaveBalanceModal();
            }
        });
    }

    if (form) {
        form.addEventListener("submit", handleLeaveBalanceSubmit);
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentLeaveBalancePage = 1;
            applyLeaveBalanceFilters();
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", () => {
            currentLeaveBalancePage = 1;
            applyLeaveBalanceFilters();
        });
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetLeaveBalanceFilters);
    }

    if (cancelDelete) {
        cancelDelete.addEventListener(
            "click",
            closeDeleteLeaveBalanceModal
        );
    }

    if (confirmDelete) {
        confirmDelete.addEventListener(
            "click",
            handleDeleteLeaveBalance
        );
    }

    if (allocatedInput) {
        allocatedInput.addEventListener(
            "input",
            updateRemainingPreview
        );
    }

    if (usedInput) {
        usedInput.addEventListener(
            "input",
            updateRemainingPreview
        );
    }

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        closeLeaveBalanceModal();
        closeDeleteLeaveBalanceModal();
    });
}


/* ==========================================================
   DEFAULT YEAR
========================================================== */

function setDefaultLeaveBalanceYear() {
    const yearInput = document.getElementById("leaveBalanceYear");

    if (!yearInput) return;

    if (!yearInput.value) {
        yearInput.value = new Date().getFullYear();
    }
}


/* ==========================================================
   LOAD EMPLOYEES
========================================================== */

async function loadLeaveBalanceEmployees() {
    try {
        if (typeof UserService === "undefined") {
            throw new Error(
                "UserService is not defined. Make sure user.service.js is loaded before leave_balance.js."
            );
        }

        if (typeof UserService.getUsers !== "function") {
            throw new Error(
                "UserService.getUsers() is not available."
            );
        }

        const response = await UserService.getUsers();

        console.log("RAW USERS API RESPONSE:", response);

        const users = normalizeUsersResponse(response);

        console.log("NORMALIZED USERS:", users);

        leaveBalanceEmployees = users.filter(isEmployeeUser);

        console.log(
            "EMPLOYEE USERS:",
            leaveBalanceEmployees
        );

        console.log(
            "EMPLOYEE COUNT:",
            leaveBalanceEmployees.length
        );

        populateLeaveBalanceEmployees();

    } catch (error) {
        console.error(
            "FAILED TO LOAD EMPLOYEES:",
            error
        );

        leaveBalanceEmployees = [];

        populateLeaveBalanceEmployees();

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load employees."
            ),
            "error"
        );
    }
}


/* ==========================================================
   NORMALIZE USERS RESPONSE
========================================================== */

function normalizeUsersResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (response && Array.isArray(response.results)) {
        return response.results;
    }

    if (response && Array.isArray(response.data)) {
        return response.data;
    }

    if (
        response?.data &&
        Array.isArray(response.data.results)
    ) {
        return response.data.results;
    }

    if (response && Array.isArray(response.users)) {
        return response.users;
    }

    if (
        response?.data &&
        Array.isArray(response.data.users)
    ) {
        return response.data.users;
    }

    console.warn(
        "Unknown users API response format:",
        response
    );

    return [];
}


/* ==========================================================
   CHECK EMPLOYEE USER
========================================================== */

function isEmployeeUser(user) {
    if (!user) return false;

    const roleValue =
        user?.role ??
        user?.user?.role ??
        user?.profile?.role ??
        user?.user_data?.role ??
        "";

    let role = "";

    if (typeof roleValue === "string") {
        role = roleValue;
    } else if (typeof roleValue === "object") {
        role =
            roleValue.name ??
            roleValue.code ??
            roleValue.role ??
            roleValue.value ??
            "";
    }

    role = String(role)
        .trim()
        .toUpperCase();

    return role === "EMPLOYEE";
}


/* ==========================================================
   POPULATE EMPLOYEE SELECT
========================================================== */

function populateLeaveBalanceEmployees(selectedId = "") {
    const select = document.getElementById(
        "leaveBalanceEmployee"
    );

    if (!select) {
        console.error(
            "ERROR: #leaveBalanceEmployee does not exist in HTML."
        );
        return;
    }

    select.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        leaveBalanceEmployees.length
            ? "Select Employee"
            : "No employees available";

    select.appendChild(defaultOption);

    leaveBalanceEmployees.forEach(employee => {
        const id = getEmployeeId(employee);

        if (!id) {
            console.warn(
                "Employee skipped because ID is missing:",
                employee
            );
            return;
        }

        const option = document.createElement("option");

        option.value = String(id);

        option.textContent =
            getEmployeeDisplayName(employee);

        if (
            String(id) ===
            String(selectedId)
        ) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}


/* ==========================================================
   LOAD LEAVE TYPES
========================================================== */

async function loadLeaveBalanceTypes() {
    try {
        const response =
            await LeaveService.getLeaveTypes();

        console.log(
            "Leave Types API Response:",
            response
        );

        leaveBalanceTypes =
            normalizeLeaveBalanceResponse(response);

        populateLeaveBalanceTypeSelects();

    } catch (error) {
        console.error(
            "Failed to load leave types:",
            error
        );

        leaveBalanceTypes = [];

        populateLeaveBalanceTypeSelects();

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave types."
            ),
            "error"
        );
    }
}


/* ==========================================================
   POPULATE LEAVE TYPE SELECTS
========================================================== */

function populateLeaveBalanceTypeSelects(
    selectedId = ""
) {
    const filterSelect =
        document.getElementById(
            "leaveBalanceLeaveType"
        );

    const formSelect =
        document.getElementById(
            "leaveBalanceType"
        );

    if (filterSelect) {
        filterSelect.innerHTML =
            `<option value="">All Leave Types</option>`;

        leaveBalanceTypes.forEach(type => {
            if (!getLeaveTypeActiveStatus(type)) {
                return;
            }

            const id = getLeaveTypeId(type);

            if (!id) return;

            const option =
                document.createElement("option");

            option.value = String(id);

            option.textContent =
                `${getLeaveTypeName(type)} (${getLeaveTypeCode(type)})`;

            if (
                String(id) ===
                String(selectedId)
            ) {
                option.selected = true;
            }

            filterSelect.appendChild(option);
        });
    }

    if (formSelect) {
        formSelect.innerHTML =
            `<option value="">Select Leave Type</option>`;

        leaveBalanceTypes.forEach(type => {
            if (!getLeaveTypeActiveStatus(type)) {
                return;
            }

            const id = getLeaveTypeId(type);

            if (!id) return;

            const option =
                document.createElement("option");

            option.value = String(id);

            option.textContent =
                `${getLeaveTypeName(type)} (${getLeaveTypeCode(type)})`;

            if (
                String(id) ===
                String(selectedId)
            ) {
                option.selected = true;
            }

            formSelect.appendChild(option);
        });
    }
}


/* ==========================================================
   LOAD LEAVE BALANCES
========================================================== */

async function loadLeaveBalances() {
    showLeaveBalanceLoading();

    try {
        const response =
            await LeaveService.getLeaveBalances();

        leaveBalances =
            normalizeLeaveBalanceResponse(response);

        currentLeaveBalancePage = 1;

        applyLeaveBalanceFilters();

    } catch (error) {
        console.error(
            "Failed to load leave balances:",
            error
        );

        leaveBalances = [];
        filteredLeaveBalances = [];

        renderLeaveBalances();

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave balances."
            ),
            "error"
        );
    }
}


/* ==========================================================
   NORMALIZE RESPONSE
========================================================== */

function normalizeLeaveBalanceResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (
        response &&
        Array.isArray(response.results)
    ) {
        return response.results;
    }

    if (
        response &&
        Array.isArray(response.data)
    ) {
        return response.data;
    }

    if (
        response?.data &&
        Array.isArray(response.data.results)
    ) {
        return response.data.results;
    }

    return [];
}


/* ==========================================================
   FILTERS
========================================================== */

function applyLeaveBalanceFilters() {
    const searchInput =
        document.getElementById(
            "leaveBalanceSearch"
        );

    const typeFilter =
        document.getElementById(
            "leaveBalanceLeaveType"
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const typeId =
        typeFilter
            ? typeFilter.value
            : "";

    filteredLeaveBalances =
        leaveBalances.filter(balance => {

            const employee =
                getBalanceEmployeeName(balance)
                    .toLowerCase();

            const leaveType =
                getBalanceLeaveTypeName(balance)
                    .toLowerCase();

            const code =
                getBalanceLeaveTypeCode(balance)
                    .toLowerCase();

            const matchesSearch =
                !search ||
                employee.includes(search) ||
                leaveType.includes(search) ||
                code.includes(search);

            const balanceTypeId =
                getBalanceLeaveTypeId(balance);

            const matchesType =
                !typeId ||
                String(balanceTypeId) ===
                String(typeId);

            return (
                matchesSearch &&
                matchesType
            );
        });

    renderLeaveBalances();
}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetLeaveBalanceFilters() {
    const searchInput =
        document.getElementById(
            "leaveBalanceSearch"
        );

    const typeFilter =
        document.getElementById(
            "leaveBalanceLeaveType"
        );

    if (searchInput) {
        searchInput.value = "";
    }

    if (typeFilter) {
        typeFilter.value = "";
    }

    currentLeaveBalancePage = 1;

    applyLeaveBalanceFilters();
}


/* ==========================================================
   RENDER TABLE
========================================================== */

function renderLeaveBalances() {
    const tbody =
        document.getElementById(
            "leaveBalancesTableBody"
        );

    const emptyState =
        document.getElementById(
            "leaveBalanceEmptyState"
        );

    const paginationWrapper =
        document.getElementById(
            "leaveBalancePaginationWrapper"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!filteredLeaveBalances.length) {
        if (emptyState) {
            emptyState.classList.remove(
                "hidden"
            );
        }

        if (paginationWrapper) {
            paginationWrapper.classList.add(
                "hidden"
            );
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.add(
            "hidden"
        );
    }

    const totalPages =
        Math.ceil(
            filteredLeaveBalances.length /
            leaveBalanceRowsPerPage
        );

    if (
        currentLeaveBalancePage >
        totalPages
    ) {
        currentLeaveBalancePage =
            totalPages;
    }

    const startIndex =
        (currentLeaveBalancePage - 1) *
        leaveBalanceRowsPerPage;

    const endIndex =
        startIndex +
        leaveBalanceRowsPerPage;

    const pageItems =
        filteredLeaveBalances.slice(
            startIndex,
            endIndex
        );

    pageItems.forEach(
        (balance, index) => {
            tbody.appendChild(
                createLeaveBalanceRow(
                    balance,
                    startIndex + index + 1
                )
            );
        }
    );

    renderLeaveBalancePagination();
}


/* ==========================================================
   CREATE TABLE ROW
========================================================== */

function createLeaveBalanceRow(
    balance,
    index
) {
    const row =
        document.createElement("tr");

    row.className =
        "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition";

    const id =
        getLeaveBalanceId(balance);

    const employee =
        getBalanceEmployeeName(balance);

    const leaveType =
        getBalanceLeaveTypeName(balance);

    const code =
        getBalanceLeaveTypeCode(balance);

    const year =
        getBalanceYear(balance);

    const allocated =
        getBalanceAllocated(balance);

    const used =
        getBalanceUsed(balance);

    const remaining =
        getBalanceRemaining(balance);

    row.innerHTML = `
        <td class="px-5 py-4 text-gray-500 dark:text-gray-400">
            ${index}
        </td>

        <td class="px-5 py-4">
            <div class="font-medium text-gray-900 dark:text-white">
                ${escapeHtml(employee || "-")}
            </div>
        </td>

        <td class="px-5 py-4">
            <div class="font-medium text-gray-700 dark:text-gray-300">
                ${escapeHtml(leaveType || "-")}
            </div>

            <div class="text-xs text-gray-400 mt-0.5">
                ${escapeHtml(code || "")}
            </div>
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${escapeHtml(String(year))}
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${escapeHtml(String(allocated))}
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${escapeHtml(String(used))}
        </td>

        <td class="px-5 py-4">
            <span class="${getRemainingClass(remaining)}">
                ${escapeHtml(String(remaining))}
            </span>
        </td>

        <td class="px-5 py-4">
            <div class="flex items-center justify-end gap-2">

                <button
                    type="button"
                    class="edit-leave-balance-btn px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 transition"
                    data-id="${escapeHtml(id)}">

                    Edit

                </button>

                <button
                    type="button"
                    class="delete-leave-balance-btn px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 transition"
                    data-id="${escapeHtml(id)}">

                    Delete

                </button>

            </div>
        </td>
    `;

    const editButton =
        row.querySelector(
            ".edit-leave-balance-btn"
        );

    const deleteButton =
        row.querySelector(
            ".delete-leave-balance-btn"
        );

    if (editButton) {
        editButton.addEventListener(
            "click",
            () => editLeaveBalance(id)
        );
    }

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            () => {
                openDeleteLeaveBalanceModal(
                    id,
                    employee,
                    leaveType
                );
            }
        );
    }

    return row;
}


/* ==========================================================
   REMAINING CLASS
========================================================== */

function getRemainingClass(remaining) {
    if (Number(remaining) <= 0) {
        return "inline-flex px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium";
    }

    return "inline-flex px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium";
}


/* ==========================================================
   PAGINATION
========================================================== */

function renderLeaveBalancePagination() {
    const wrapper =
        document.getElementById(
            "leaveBalancePaginationWrapper"
        );

    const info =
        document.getElementById(
            "leaveBalancePaginationInfo"
        );

    const pagination =
        document.getElementById(
            "leaveBalancePagination"
        );

    if (
        !wrapper ||
        !info ||
        !pagination
    ) {
        return;
    }

    const total =
        filteredLeaveBalances.length;

    if (!total) {
        wrapper.classList.add("hidden");
        return;
    }

    wrapper.classList.remove("hidden");

    const totalPages =
        Math.ceil(
            total /
            leaveBalanceRowsPerPage
        );

    const start =
        (currentLeaveBalancePage - 1) *
        leaveBalanceRowsPerPage + 1;

    const end =
        Math.min(
            currentLeaveBalancePage *
            leaveBalanceRowsPerPage,
            total
        );

    info.textContent =
        `Showing ${start}-${end} of ${total}`;

    pagination.innerHTML = "";

    const previousButton =
        createLeaveBalancePaginationButton(
            "‹",
            currentLeaveBalancePage === 1
        );

    previousButton.addEventListener(
        "click",
        () => {
            if (
                currentLeaveBalancePage <= 1
            ) {
                return;
            }

            currentLeaveBalancePage--;

            renderLeaveBalances();
        }
    );

    pagination.appendChild(
        previousButton
    );

    const pages =
        getLeaveBalancePaginationPages(
            totalPages
        );

    pages.forEach(page => {

        if (page === "...") {
            const dots =
                document.createElement(
                    "span"
                );

            dots.className =
                "px-2 py-1.5 text-gray-400";

            dots.textContent = "...";

            pagination.appendChild(dots);

            return;
        }

        const button =
            createLeaveBalancePaginationButton(
                String(page),
                page ===
                currentLeaveBalancePage
            );

        button.addEventListener(
            "click",
            () => {
                currentLeaveBalancePage =
                    page;

                renderLeaveBalances();
            }
        );

        pagination.appendChild(button);
    });

    const nextButton =
        createLeaveBalancePaginationButton(
            "›",
            currentLeaveBalancePage ===
            totalPages
        );

    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentLeaveBalancePage >=
                totalPages
            ) {
                return;
            }

            currentLeaveBalancePage++;

            renderLeaveBalances();
        }
    );

    pagination.appendChild(nextButton);
}


function createLeaveBalancePaginationButton(
    text,
    disabled
) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.disabled = disabled;

    button.className =
        `min-w-[34px] h-[34px] px-2 rounded-md text-sm font-medium transition ${
            disabled
                ? "opacity-50 cursor-not-allowed text-gray-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`;

    return button;
}


function getLeaveBalancePaginationPages(
    totalPages
) {
    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        );
    }

    const pages = [1];

    if (currentLeaveBalancePage > 4) {
        pages.push("...");
    }

    const start =
        Math.max(
            2,
            currentLeaveBalancePage - 1
        );

    const end =
        Math.min(
            totalPages - 1,
            currentLeaveBalancePage + 1
        );

    for (
        let page = start;
        page <= end;
        page++
    ) {
        pages.push(page);
    }

    if (
        currentLeaveBalancePage <
        totalPages - 3
    ) {
        pages.push("...");
    }

    pages.push(totalPages);

    return pages;
}


/* ==========================================================
   ADD MODAL
========================================================== */

async function openAddLeaveBalanceModal() {
    console.log(
        "Opening Add Leave Balance modal..."
    );

    editingLeaveBalanceId = null;

    resetLeaveBalanceForm();

    await loadLeaveBalanceEmployees();

    populateLeaveBalanceEmployees();

    setDefaultLeaveBalanceYear();

    const title =
        document.getElementById(
            "leaveBalanceModalTitle"
        );

    const saveButton =
        document.getElementById(
            "saveLeaveBalanceBtn"
        );

    if (title) {
        title.textContent =
            "Add Leave Balance";
    }

    if (saveButton) {
        saveButton.textContent =
            "Save Leave Balance";
    }

    openLeaveBalanceModal();
}


/* ==========================================================
   EDIT
========================================================== */

async function editLeaveBalance(id) {
    try {
        const response =
            await LeaveService.getLeaveBalance(id);

        const balance =
            response?.data
                ? response.data
                : response;

        editingLeaveBalanceId = id;

        if (!leaveBalanceEmployees.length) {
            await loadLeaveBalanceEmployees();
        }

        fillLeaveBalanceForm(balance);

        const title =
            document.getElementById(
                "leaveBalanceModalTitle"
            );

        const saveButton =
            document.getElementById(
                "saveLeaveBalanceBtn"
            );

        if (title) {
            title.textContent =
                "Edit Leave Balance";
        }

        if (saveButton) {
            saveButton.textContent =
                "Update Leave Balance";
        }

        openLeaveBalanceModal();

    } catch (error) {
        console.error(
            "Failed to get leave balance:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave balance."
            ),
            "error"
        );
    }
}


/* ==========================================================
   FILL FORM
========================================================== */

function fillLeaveBalanceForm(balance) {
    const idInput =
        document.getElementById(
            "leaveBalanceId"
        );

    const employeeInput =
        document.getElementById(
            "leaveBalanceEmployee"
        );

    const typeInput =
        document.getElementById(
            "leaveBalanceType"
        );

    const yearInput =
        document.getElementById(
            "leaveBalanceYear"
        );

    const allocatedInput =
        document.getElementById(
            "leaveBalanceAllocated"
        );

    const usedInput =
        document.getElementById(
            "leaveBalanceUsed"
        );

    const employeeId =
        getBalanceEmployeeId(balance);

    const typeId =
        getBalanceLeaveTypeId(balance);

    const year =
        getBalanceYear(balance);

    if (idInput) {
        idInput.value =
            getLeaveBalanceId(balance);
    }

    populateLeaveBalanceEmployees(
        employeeId
    );

    if (employeeInput) {
        employeeInput.value =
            employeeId
                ? String(employeeId)
                : "";
    }

    populateLeaveBalanceTypeSelects(
        typeId
    );

    if (typeInput) {
        typeInput.value =
            typeId
                ? String(typeId)
                : "";
    }

    if (yearInput) {
        yearInput.value =
            year ||
            new Date().getFullYear();
    }

    if (allocatedInput) {
        allocatedInput.value =
            getBalanceAllocated(balance);
    }

    if (usedInput) {
        usedInput.value =
            getBalanceUsed(balance);
    }

    updateRemainingPreview();

    clearLeaveBalanceErrors();
}


/* ==========================================================
   RESET FORM
========================================================== */

function resetLeaveBalanceForm() {
    const form =
        document.getElementById(
            "leaveBalanceForm"
        );

    if (form) {
        form.reset();
    }

    const idInput =
        document.getElementById(
            "leaveBalanceId"
        );

    const yearInput =
        document.getElementById(
            "leaveBalanceYear"
        );

    const usedInput =
        document.getElementById(
            "leaveBalanceUsed"
        );

    if (idInput) {
        idInput.value = "";
    }

    if (yearInput) {
        yearInput.value =
            new Date().getFullYear();
    }

    if (usedInput) {
        usedInput.value = "0";
    }

    populateLeaveBalanceEmployees();

    populateLeaveBalanceTypeSelects();

    updateRemainingPreview();

    clearLeaveBalanceErrors();
}


/* ==========================================================
   FORM SUBMIT
========================================================== */

async function handleLeaveBalanceSubmit(event) {
    event.preventDefault();

    if (!validateLeaveBalanceForm()) {
        return;
    }

    const employeeId =
        document.getElementById(
            "leaveBalanceEmployee"
        ).value;

    const leaveTypeId =
        document.getElementById(
            "leaveBalanceType"
        ).value;

    const year =
        document.getElementById(
            "leaveBalanceYear"
        ).value;

    const allocated =
        document.getElementById(
            "leaveBalanceAllocated"
        ).value;

    const used =
        document.getElementById(
            "leaveBalanceUsed"
        ).value;

    const body =
        buildLeaveBalancePayload({
            employeeId,
            leaveTypeId,
            year,
            allocated,
            used
        });

    console.log(
        "FINAL LEAVE BALANCE PAYLOAD:",
        body
    );

    const saveButton =
        document.getElementById(
            "saveLeaveBalanceBtn"
        );

    const isEditing =
        Boolean(editingLeaveBalanceId);

    setLeaveBalanceButtonLoading(
        saveButton,
        true,
        isEditing
            ? "Updating..."
            : "Saving..."
    );

    try {

        if (isEditing) {

            await LeaveService.updateLeaveBalance(
                editingLeaveBalanceId,
                body
            );

            showAlert(
                "Leave balance updated successfully.",
                "success"
            );

        } else {

            await LeaveService.createLeaveBalance(
                body
            );

            showAlert(
                "Leave balance created successfully.",
                "success"
            );
        }

        closeLeaveBalanceModal();

        await loadLeaveBalances();

    } catch (error) {

        console.error(
            "Leave balance save error:",
            error
        );

        console.error(
            "API ERROR RESPONSE:",
            error?.response?.data || error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to save leave balance."
            ),
            "error"
        );

    } finally {

        setLeaveBalanceButtonLoading(
            saveButton,
            false,
            isEditing
                ? "Update Leave Balance"
                : "Save Leave Balance"
        );
    }
}


/* ==========================================================
   PAYLOAD
========================================================== */

function buildLeaveBalancePayload(data) {
    return {
        user: String(data.employeeId),
        leave_type: Number(data.leaveTypeId),
        year: Number(data.year),
        allocated_days: Number(data.allocated),
        used_days: Number(data.used)
    };
}


/* ==========================================================
   VALIDATION
========================================================== */

function validateLeaveBalanceForm() {
    clearLeaveBalanceErrors();

    const employee =
        document.getElementById(
            "leaveBalanceEmployee"
        ).value;

    const type =
        document.getElementById(
            "leaveBalanceType"
        ).value;

    const year =
        document.getElementById(
            "leaveBalanceYear"
        ).value;

    const allocated =
        document.getElementById(
            "leaveBalanceAllocated"
        ).value;

    const used =
        document.getElementById(
            "leaveBalanceUsed"
        ).value;

    let valid = true;

    if (!employee) {
        showLeaveBalanceFieldError(
            "leaveBalanceEmployeeError",
            "Employee is required."
        );

        valid = false;
    }

    if (!type) {
        showLeaveBalanceFieldError(
            "leaveBalanceTypeError",
            "Leave type is required."
        );

        valid = false;
    }

    if (
        year === "" ||
        year === null ||
        Number.isNaN(Number(year))
    ) {
        showLeaveBalanceFieldError(
            "leaveBalanceYearError",
            "Year is required."
        );

        valid = false;

    } else if (
        Number(year) < 2000 ||
        Number(year) > 2100
    ) {
        showLeaveBalanceFieldError(
            "leaveBalanceYearError",
            "Please enter a valid year."
        );

        valid = false;
    }

    if (
        allocated === "" ||
        allocated === null ||
        Number.isNaN(Number(allocated))
    ) {
        showLeaveBalanceFieldError(
            "leaveBalanceAllocatedError",
            "Allocated days are required."
        );

        valid = false;

    } else if (Number(allocated) < 0) {

        showLeaveBalanceFieldError(
            "leaveBalanceAllocatedError",
            "Allocated days cannot be negative."
        );

        valid = false;
    }

    if (
        used === "" ||
        used === null ||
        Number.isNaN(Number(used))
    ) {
        showLeaveBalanceFieldError(
            "leaveBalanceUsedError",
            "Used days are required."
        );

        valid = false;

    } else if (Number(used) < 0) {

        showLeaveBalanceFieldError(
            "leaveBalanceUsedError",
            "Used days cannot be negative."
        );

        valid = false;

    } else if (
        Number(used) >
        Number(allocated)
    ) {

        showLeaveBalanceFieldError(
            "leaveBalanceUsedError",
            "Used days cannot be greater than allocated days."
        );

        valid = false;
    }

    return valid;
}


/* ==========================================================
   FIELD ERROR
========================================================== */

function showLeaveBalanceFieldError(
    elementId,
    message
) {
    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "hidden"
    );
}


/* ==========================================================
   CLEAR ERRORS
========================================================== */

function clearLeaveBalanceErrors() {
    const errors = [
        "leaveBalanceEmployeeError",
        "leaveBalanceTypeError",
        "leaveBalanceYearError",
        "leaveBalanceAllocatedError",
        "leaveBalanceUsedError"
    ];

    errors.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.textContent = "";

        element.classList.add(
            "hidden"
        );
    });
}


/* ==========================================================
   REMAINING PREVIEW
========================================================== */

function updateRemainingPreview() {
    const allocatedInput =
        document.getElementById(
            "leaveBalanceAllocated"
        );

    const usedInput =
        document.getElementById(
            "leaveBalanceUsed"
        );

    const preview =
        document.getElementById(
            "leaveBalanceRemainingPreview"
        );

    if (
        !allocatedInput ||
        !usedInput ||
        !preview
    ) {
        return;
    }

    const allocated =
        Number(
            allocatedInput.value || 0
        );

    const used =
        Number(
            usedInput.value || 0
        );

    const remaining =
        allocated - used;

    preview.textContent =
        String(remaining);

    preview.className =
        remaining < 0
            ? "text-lg font-semibold text-red-600 dark:text-red-400"
            : "text-lg font-semibold text-green-600 dark:text-green-400";
}


/* ==========================================================
   DELETE MODAL
========================================================== */

function openDeleteLeaveBalanceModal(
    id,
    employee,
    leaveType
) {
    deletingLeaveBalanceId = id;

    const modal =
        document.getElementById(
            "deleteLeaveBalanceModal"
        );

    const nameElement =
        document.getElementById(
            "deleteLeaveBalanceName"
        );

    if (nameElement) {
        nameElement.textContent =
            `${employee} - ${leaveType}`;
    }

    if (modal) {
        modal.classList.remove(
            "hidden"
        );
    }
}


function closeDeleteLeaveBalanceModal() {
    deletingLeaveBalanceId = null;

    const modal =
        document.getElementById(
            "deleteLeaveBalanceModal"
        );

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }
}


/* ==========================================================
   DELETE
========================================================== */

async function handleDeleteLeaveBalance() {
    if (!deletingLeaveBalanceId) {
        return;
    }

    const deleteButton =
        document.getElementById(
            "confirmDeleteLeaveBalance"
        );

    setLeaveBalanceButtonLoading(
        deleteButton,
        true,
        "Deleting..."
    );

    try {

        await LeaveService.deleteLeaveBalance(
            deletingLeaveBalanceId
        );

        closeDeleteLeaveBalanceModal();

        showAlert(
            "Leave balance deleted successfully.",
            "success"
        );

        await loadLeaveBalances();

    } catch (error) {

        console.error(
            "Delete leave balance error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to delete leave balance."
            ),
            "error"
        );

    } finally {

        setLeaveBalanceButtonLoading(
            deleteButton,
            false,
            "Delete"
        );
    }
}


/* ==========================================================
   MODAL
========================================================== */

function openLeaveBalanceModal() {
    const modal =
        document.getElementById(
            "leaveBalanceModal"
        );

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "overflow-hidden"
    );

    setTimeout(() => {

        const employeeInput =
            document.getElementById(
                "leaveBalanceEmployee"
            );

        if (employeeInput) {
            employeeInput.focus();
        }

    }, 100);
}


function closeLeaveBalanceModal() {
    const modal =
        document.getElementById(
            "leaveBalanceModal"
        );

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "overflow-hidden"
    );

    editingLeaveBalanceId = null;

    resetLeaveBalanceForm();
}


/* ==========================================================
   LOADING
========================================================== */

function showLeaveBalanceLoading() {
    const tbody =
        document.getElementById(
            "leaveBalancesTableBody"
        );

    const emptyState =
        document.getElementById(
            "leaveBalanceEmptyState"
        );

    const pagination =
        document.getElementById(
            "leaveBalancePaginationWrapper"
        );

    if (emptyState) {
        emptyState.classList.add(
            "hidden"
        );
    }

    if (pagination) {
        pagination.classList.add(
            "hidden"
        );
    }

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="px-5 py-10 text-center">
                <div class="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                    <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading leave balances...
                </div>
            </td>
        </tr>
    `;
}


/* ==========================================================
   BUTTON LOADING
========================================================== */

function setLeaveBalanceButtonLoading(
    button,
    loading,
    text
) {
    if (!button) return;

    if (loading) {

        button.disabled = true;

        button.innerHTML = `
            <span class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ${escapeHtml(text)}
            </span>
        `;

    } else {

        button.disabled = false;

        button.textContent = text;
    }
}


/* ==========================================================
   ALERT
========================================================== */

function showAlert(
    message,
    type = "error"
) {
    const wrapper =
        document.getElementById(
            "alertBox"
        );

    const box =
        document.getElementById(
            "alertInner"
        );

    if (!wrapper || !box) {

        console[
            type === "error"
                ? "error"
                : "log"
        ](message);

        return;
    }

    wrapper.classList.remove(
        "hidden"
    );

    box.className =
        "px-4 py-3 rounded-lg text-sm font-medium";

    if (type === "success") {

        box.classList.add(
            "bg-green-100",
            "text-green-700",
            "dark:bg-green-900/30",
            "dark:text-green-400"
        );

    } else if (type === "warning") {

        box.classList.add(
            "bg-yellow-100",
            "text-yellow-700",
            "dark:bg-yellow-900/30",
            "dark:text-yellow-400"
        );

    } else {

        box.classList.add(
            "bg-red-100",
            "text-red-700",
            "dark:bg-red-900/30",
            "dark:text-red-400"
        );
    }

    box.textContent = message;

    clearTimeout(
        showAlert.timeout
    );

    showAlert.timeout =
        setTimeout(() => {
            wrapper.classList.add(
                "hidden"
            );
        }, 4000);
}


/* ==========================================================
   API ERROR MESSAGE
========================================================== */

function getApiErrorMessage(
    error,
    fallback = "Something went wrong."
) {
    if (!error) return fallback;

    const response =
        error.response || error;

    const data =
        response.data || response;

    if (typeof data === "string") {
        return data;
    }

    if (data?.detail) {
        return data.detail;
    }

    if (data?.message) {
        return data.message;
    }

    if (
        data &&
        typeof data === "object"
    ) {

        const messages = [];

        Object.entries(data).forEach(
            ([field, value]) => {

                if (Array.isArray(value)) {

                    messages.push(
                        `${field}: ${value.join(", ")}`
                    );

                } else if (
                    typeof value === "string"
                ) {

                    messages.push(
                        `${field}: ${value}`
                    );
                }
            }
        );

        if (messages.length) {
            return messages.join(" | ");
        }
    }

    if (error.message) {
        return error.message;
    }

    return fallback;
}


/* ==========================================================
   DATA HELPERS
========================================================== */

function getLeaveBalanceId(balance) {
    return balance?.id ??
        balance?.leave_balance_id ??
        "";
}


function getBalanceYear(balance) {
    return balance?.year ??
        balance?.leave_year ??
        "";
}


/* ==========================================================
   EMPLOYEE HELPERS
========================================================== */

function getEmployeeId(employee) {
    return employee?.id ??
        employee?.user_id ??
        employee?.employee_id ??
        employee?.uuid ??
        "";
}


function getEmployeeDisplayName(employee) {
    const fullName =
        employee?.full_name ||
        employee?.name;

    if (fullName) {
        return fullName;
    }

    const firstName =
        employee?.first_name ||
        employee?.user?.first_name ||
        "";

    const lastName =
        employee?.last_name ||
        employee?.user?.last_name ||
        "";

    const name =
        `${firstName} ${lastName}`.trim();

    if (name) {
        return name;
    }

    return employee?.username ||
        employee?.user?.username ||
        employee?.email ||
        employee?.user?.email ||
        `Employee #${getEmployeeId(employee)}`;
}


/* ==========================================================
   BALANCE EMPLOYEE
========================================================== */

function getBalanceEmployee(balance) {
    return balance?.employee ||
        balance?.user ||
        balance?.employee_data ||
        balance?.user_data ||
        null;
}


function getBalanceEmployeeId(balance) {
    const employee =
        getBalanceEmployee(balance);

    if (
        employee &&
        typeof employee === "object"
    ) {
        return getEmployeeId(employee);
    }

    return balance?.employee_id ??
        balance?.user_id ??
        balance?.user ??
        employee ??
        "";
}


function getBalanceEmployeeName(balance) {
    const employee =
        getBalanceEmployee(balance);

    if (
        employee &&
        typeof employee === "object"
    ) {
        return getEmployeeDisplayName(
            employee
        );
    }

    const employeeId =
        getBalanceEmployeeId(balance);

    const foundEmployee =
        leaveBalanceEmployees.find(
            item =>
                String(
                    getEmployeeId(item)
                ) ===
                String(employeeId)
        );

    if (foundEmployee) {
        return getEmployeeDisplayName(
            foundEmployee
        );
    }

    return balance?.employee_name ||
        balance?.user_name ||
        `Employee #${employeeId || "-"}`;
}


/* ==========================================================
   BALANCE LEAVE TYPE
========================================================== */

function getBalanceLeaveType(balance) {
    return balance?.leave_type ||
        balance?.leave_type_data ||
        balance?.type ||
        null;
}


function getBalanceLeaveTypeId(balance) {
    const type =
        getBalanceLeaveType(balance);

    if (
        type &&
        typeof type === "object"
    ) {
        return getLeaveTypeId(type);
    }

    return balance?.leave_type_id ??
        balance?.type_id ??
        type ??
        "";
}


function getBalanceLeaveTypeName(balance) {
    const type =
        getBalanceLeaveType(balance);

    if (
        type &&
        typeof type === "object"
    ) {
        return getLeaveTypeName(type);
    }

    const typeId =
        getBalanceLeaveTypeId(balance);

    const foundType =
        leaveBalanceTypes.find(
            item =>
                String(
                    getLeaveTypeId(item)
                ) ===
                String(typeId)
        );

    if (foundType) {
        return getLeaveTypeName(
            foundType
        );
    }

    return balance?.leave_type_name ||
        balance?.type_name ||
        `Leave Type #${typeId || "-"}`;
}


function getBalanceLeaveTypeCode(balance) {
    const type =
        getBalanceLeaveType(balance);

    if (
        type &&
        typeof type === "object"
    ) {
        return getLeaveTypeCode(type);
    }

    const typeId =
        getBalanceLeaveTypeId(balance);

    const foundType =
        leaveBalanceTypes.find(
            item =>
                String(
                    getLeaveTypeId(item)
                ) ===
                String(typeId)
        );

    if (foundType) {
        return getLeaveTypeCode(
            foundType
        );
    }

    return balance?.leave_type_code ||
        balance?.type_code ||
        "";
}


/* ==========================================================
   LEAVE TYPE HELPERS
========================================================== */

function getLeaveTypeId(type) {
    return type?.id ??
        type?.leave_type_id ??
        "";
}


function getLeaveTypeName(type) {
    return type?.name ??
        type?.leave_type_name ??
        type?.title ??
        "";
}


function getLeaveTypeCode(type) {
    return type?.code ??
        type?.leave_code ??
        "";
}


function getLeaveTypeActiveStatus(type) {
    if (
        typeof type?.is_active ===
        "boolean"
    ) {
        return type.is_active;
    }

    if (
        typeof type?.active ===
        "boolean"
    ) {
        return type.active;
    }

    if (
        typeof type?.status ===
        "string"
    ) {
        return (
            type.status.toLowerCase() ===
            "active"
        );
    }

    return true;
}


/* ==========================================================
   DAYS HELPERS
========================================================== */

function getBalanceAllocated(balance) {
    return balance?.allocated_days ??
        balance?.allocated ??
        balance?.total_days ??
        balance?.entitled_days ??
        0;
}


function getBalanceUsed(balance) {
    return balance?.used_days ??
        balance?.used ??
        balance?.consumed_days ??
        0;
}


function getBalanceRemaining(balance) {
    if (
        balance?.remaining_days !==
            undefined &&
        balance?.remaining_days !==
            null
    ) {
        return balance.remaining_days;
    }

    if (
        balance?.remaining !==
            undefined &&
        balance?.remaining !==
            null
    ) {
        return balance.remaining;
    }

    return Number(
        getBalanceAllocated(balance)
    ) -
        Number(
            getBalanceUsed(balance)
        );
}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}