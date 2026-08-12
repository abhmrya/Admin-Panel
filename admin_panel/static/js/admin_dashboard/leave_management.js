/**
 * ==========================================================
 * Leave Management
 * ==========================================================
 * Leave Type Add / Edit / Activate / Deactivate / Delete
 * ==========================================================
 */

console.log("LEAVE MANAGEMENT JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let leaveTypes = [];
let filteredLeaveTypes = [];

let currentLeaveTypePage = 1;
const leaveTypeRowsPerPage = 10;

let editingLeaveTypeId = null;
let deletingLeaveTypeId = null;


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeLeaveManagement();

});


async function initializeLeaveManagement() {

    bindLeaveTypeEvents();

    await loadLeaveTypes();

}


/* ==========================================================
   EVENT BINDING
========================================================== */

function bindLeaveTypeEvents() {

    const addButton =
        document.getElementById("addLeaveTypeBtn");

    const closeButton =
        document.getElementById("closeLeaveTypeModal");

    const cancelButton =
        document.getElementById("cancelLeaveTypeBtn");

    const form =
        document.getElementById("leaveTypeForm");

    const searchInput =
        document.getElementById("leaveTypeSearch");

    const statusFilter =
        document.getElementById("leaveTypeStatus");

    const resetButton =
        document.getElementById("resetLeaveTypeFilters");

    const modalBackdrop =
        document.getElementById("leaveTypeModalBackdrop");

    const cancelDelete =
        document.getElementById("cancelDeleteLeaveType");

    const confirmDelete =
        document.getElementById("confirmDeleteLeaveType");


    if (addButton) {
        addButton.addEventListener("click", () => {
            openAddLeaveTypeModal();
        });
    }


    if (closeButton) {
        closeButton.addEventListener("click", closeLeaveTypeModal);
    }


    if (cancelButton) {
        cancelButton.addEventListener("click", closeLeaveTypeModal);
    }


    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", closeLeaveTypeModal);
    }


    if (form) {
        form.addEventListener("submit", handleLeaveTypeSubmit);
    }


    if (searchInput) {

        searchInput.addEventListener("input", () => {

            currentLeaveTypePage = 1;

            applyLeaveTypeFilters();

        });

    }


    if (statusFilter) {

        statusFilter.addEventListener("change", () => {

            currentLeaveTypePage = 1;

            applyLeaveTypeFilters();

        });

    }


    if (resetButton) {

        resetButton.addEventListener("click", resetLeaveTypeFilters);

    }


    if (cancelDelete) {

        cancelDelete.addEventListener(
            "click",
            closeDeleteLeaveTypeModal
        );

    }


    if (confirmDelete) {

        confirmDelete.addEventListener(
            "click",
            handleDeleteLeaveType
        );

    }


    document.addEventListener("keydown", event => {

        if (event.key !== "Escape")
            return;

        closeLeaveTypeModal();
        closeDeleteLeaveTypeModal();

    });

}


/* ==========================================================
   LOAD LEAVE TYPES
========================================================== */

async function loadLeaveTypes() {

    showLeaveTypeLoading();

    try {

        const response =
            await LeaveService.getLeaveTypes();

        leaveTypes =
            normalizeLeaveTypeResponse(response);

        currentLeaveTypePage = 1;

        applyLeaveTypeFilters();

    } catch (error) {

        console.error(
            "Failed to load leave types:",
            error
        );

        leaveTypes = [];
        filteredLeaveTypes = [];

        renderLeaveTypes();

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
   RESPONSE NORMALIZATION
========================================================== */

function normalizeLeaveTypeResponse(response) {

    if (Array.isArray(response))
        return response;

    if (response && Array.isArray(response.results))
        return response.results;

    if (response && Array.isArray(response.data))
        return response.data;

    if (response && response.data && Array.isArray(response.data.results))
        return response.data.results;

    return [];

}


/* ==========================================================
   FILTERS
========================================================== */

function applyLeaveTypeFilters() {

    const searchInput =
        document.getElementById("leaveTypeSearch");

    const statusFilter =
        document.getElementById("leaveTypeStatus");


    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const status =
        statusFilter
            ? statusFilter.value
            : "";


    filteredLeaveTypes =
        leaveTypes.filter(type => {

            const name =
                String(
                    type.name ||
                    type.leave_type_name ||
                    type.title ||
                    ""
                ).toLowerCase();

            const code =
                String(
                    type.code ||
                    type.leave_code ||
                    ""
                ).toLowerCase();

            const description =
                String(
                    type.description ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                code.includes(search) ||
                description.includes(search);


            const active =
                getLeaveTypeActiveStatus(type);


            const matchesStatus =
                !status ||
                (status === "active" && active) ||
                (status === "inactive" && !active);


            return matchesSearch && matchesStatus;

        });


    renderLeaveTypes();

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetLeaveTypeFilters() {

    const searchInput =
        document.getElementById("leaveTypeSearch");

    const statusFilter =
        document.getElementById("leaveTypeStatus");


    if (searchInput)
        searchInput.value = "";


    if (statusFilter)
        statusFilter.value = "";


    currentLeaveTypePage = 1;

    applyLeaveTypeFilters();

}


/* ==========================================================
   RENDER TABLE
========================================================== */

function renderLeaveTypes() {

    const tbody =
        document.getElementById("leaveTypesTableBody");

    const emptyState =
        document.getElementById("leaveTypeEmptyState");

    const paginationWrapper =
        document.getElementById(
            "leaveTypePaginationWrapper"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    if (!filteredLeaveTypes.length) {

        if (emptyState)
            emptyState.classList.remove("hidden");

        if (paginationWrapper)
            paginationWrapper.classList.add("hidden");

        return;

    }


    if (emptyState)
        emptyState.classList.add("hidden");


    const totalPages =
        Math.ceil(
            filteredLeaveTypes.length /
            leaveTypeRowsPerPage
        );


    if (currentLeaveTypePage > totalPages) {

        currentLeaveTypePage =
            totalPages;

    }


    const startIndex =
        (currentLeaveTypePage - 1) *
        leaveTypeRowsPerPage;


    const endIndex =
        startIndex +
        leaveTypeRowsPerPage;


    const pageItems =
        filteredLeaveTypes.slice(
            startIndex,
            endIndex
        );


    pageItems.forEach((leaveType, index) => {

        const actualIndex =
            startIndex + index + 1;

        const row =
            createLeaveTypeRow(
                leaveType,
                actualIndex
            );

        tbody.appendChild(row);

    });


    renderLeaveTypePagination();

}


/* ==========================================================
   CREATE TABLE ROW
========================================================== */

function createLeaveTypeRow(leaveType, index) {

    const row =
        document.createElement("tr");

    row.className =
        "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition";


    const id =
        getLeaveTypeId(leaveType);

    const name =
        getLeaveTypeName(leaveType);

    const code =
        getLeaveTypeCode(leaveType);

    const days =
        getLeaveTypeDays(leaveType);

    const description =
        getLeaveTypeDescription(leaveType);

    const active =
        getLeaveTypeActiveStatus(leaveType);


    row.innerHTML = `

        <td class="px-5 py-4 text-gray-500 dark:text-gray-400">
            ${index}
        </td>

        <td class="px-5 py-4">
            <div class="font-medium text-gray-900 dark:text-white">
                ${escapeHtml(name || "-")}
            </div>
        </td>

        <td class="px-5 py-4">
            <span class="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                ${escapeHtml(code || "-")}
            </span>
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${escapeHtml(String(days))}
        </td>

        <td class="px-5 py-4 max-w-xs">

            <div
                class="truncate text-gray-500 dark:text-gray-400"
                title="${escapeHtml(description)}">

                ${escapeHtml(description || "-")}

            </div>

        </td>

        <td class="px-5 py-4">

            ${getStatusBadge(active)}

        </td>

        <td class="px-5 py-4">

            <div class="flex items-center justify-end gap-2">

                <button
                    type="button"
                    class="edit-leave-type-btn px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition"
                    data-id="${id}">
                    Edit
                </button>

                <button
                    type="button"
                    class="toggle-leave-type-btn px-3 py-1.5 rounded-md text-xs font-medium ${
                        active
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                    } transition"
                    data-id="${id}"
                    data-active="${active}">
                    ${active ? "Deactivate" : "Activate"}
                </button>

                <button
                    type="button"
                    class="delete-leave-type-btn px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition"
                    data-id="${id}"
                    data-name="${escapeHtml(name)}">
                    Delete
                </button>

            </div>

        </td>

    `;


    const editButton =
        row.querySelector(
            ".edit-leave-type-btn"
        );


    const toggleButton =
        row.querySelector(
            ".toggle-leave-type-btn"
        );


    const deleteButton =
        row.querySelector(
            ".delete-leave-type-btn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => editLeaveType(id)
        );

    }


    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            () => toggleLeaveType(id)
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => openDeleteLeaveTypeModal(
                id,
                name
            )
        );

    }


    return row;

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getStatusBadge(active) {

    if (active) {

        return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">

                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>

                Active

            </span>
        `;

    }


    return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">

            <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>

            Inactive

        </span>
    `;

}


/* ==========================================================
   PAGINATION
========================================================== */

function renderLeaveTypePagination() {

    const wrapper =
        document.getElementById(
            "leaveTypePaginationWrapper"
        );

    const info =
        document.getElementById(
            "leaveTypePaginationInfo"
        );

    const pagination =
        document.getElementById(
            "leaveTypePagination"
        );


    if (!wrapper || !info || !pagination)
        return;


    const total =
        filteredLeaveTypes.length;


    if (!total) {

        wrapper.classList.add("hidden");

        return;

    }


    wrapper.classList.remove("hidden");


    const totalPages =
        Math.ceil(
            total /
            leaveTypeRowsPerPage
        );


    const start =
        (currentLeaveTypePage - 1) *
        leaveTypeRowsPerPage + 1;


    const end =
        Math.min(
            currentLeaveTypePage *
            leaveTypeRowsPerPage,
            total
        );


    info.textContent =
        `Showing ${start}-${end} of ${total}`;


    pagination.innerHTML = "";


    const previousButton =
        createPaginationButton(
            "‹",
            currentLeaveTypePage === 1
        );


    previousButton.addEventListener(
        "click",
        () => {

            if (currentLeaveTypePage <= 1)
                return;

            currentLeaveTypePage--;

            renderLeaveTypes();

        }
    );


    pagination.appendChild(previousButton);


    const pages =
        getPaginationPages(totalPages);


    pages.forEach(page => {

        if (page === "...") {

            const dots =
                document.createElement("span");

            dots.className =
                "px-2 py-1.5 text-gray-400";

            dots.textContent = "...";

            pagination.appendChild(dots);

            return;

        }


        const button =
            createPaginationButton(
                String(page),
                page === currentLeaveTypePage
            );


        button.addEventListener(
            "click",
            () => {

                currentLeaveTypePage = page;

                renderLeaveTypes();

            }
        );


        pagination.appendChild(button);

    });


    const nextButton =
        createPaginationButton(
            "›",
            currentLeaveTypePage === totalPages
        );


    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentLeaveTypePage >=
                totalPages
            )
                return;

            currentLeaveTypePage++;

            renderLeaveTypes();

        }
    );


    pagination.appendChild(nextButton);

}


/* ==========================================================
   PAGINATION HELPERS
========================================================== */

function createPaginationButton(
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


function getPaginationPages(totalPages) {

    if (totalPages <= 7) {

        return Array.from(
            { length: totalPages },
            (_, index) => index + 1
        );

    }


    const pages = [];


    pages.push(1);


    if (currentLeaveTypePage > 4)
        pages.push("...");


    const start =
        Math.max(
            2,
            currentLeaveTypePage - 1
        );


    const end =
        Math.min(
            totalPages - 1,
            currentLeaveTypePage + 1
        );


    for (let page = start; page <= end; page++)
        pages.push(page);


    if (currentLeaveTypePage < totalPages - 3)
        pages.push("...");


    pages.push(totalPages);


    return pages;

}


/* ==========================================================
   ADD MODAL
========================================================== */

function openAddLeaveTypeModal() {

    editingLeaveTypeId = null;

    resetLeaveTypeForm();

    const title =
        document.getElementById(
            "leaveTypeModalTitle"
        );

    const saveButton =
        document.getElementById(
            "saveLeaveTypeBtn"
        );


    if (title)
        title.textContent = "Add Leave Type";


    if (saveButton)
        saveButton.textContent =
            "Save Leave Type";


    const activeCheckbox =
        document.getElementById(
            "leaveTypeIsActive"
        );


    if (activeCheckbox)
        activeCheckbox.checked = true;


    openLeaveTypeModal();

}


/* ==========================================================
   EDIT LEAVE TYPE
========================================================== */

async function editLeaveType(id) {

    try {

        const response =
            await LeaveService.getLeaveType(id);

        const leaveType =
            response &&
            response.data
                ? response.data
                : response;


        editingLeaveTypeId = id;

        fillLeaveTypeForm(leaveType);


        const title =
            document.getElementById(
                "leaveTypeModalTitle"
            );

        const saveButton =
            document.getElementById(
                "saveLeaveTypeBtn"
            );


        if (title)
            title.textContent =
                "Edit Leave Type";


        if (saveButton)
            saveButton.textContent =
                "Update Leave Type";


        openLeaveTypeModal();


    } catch (error) {

        console.error(
            "Failed to get leave type:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave type."
            ),
            "error"
        );

    }

}


/* ==========================================================
   FILL FORM
========================================================== */

function fillLeaveTypeForm(leaveType) {

    const idInput =
        document.getElementById(
            "leaveTypeId"
        );

    const nameInput =
        document.getElementById(
            "leaveTypeName"
        );

    const codeInput =
        document.getElementById(
            "leaveTypeCode"
        );

    const daysInput =
        document.getElementById(
            "leaveTypeDays"
        );

    const descriptionInput =
        document.getElementById(
            "leaveTypeDescription"
        );

    const activeInput =
        document.getElementById(
            "leaveTypeIsActive"
        );


    if (idInput)
        idInput.value =
            getLeaveTypeId(leaveType);


    if (nameInput)
        nameInput.value =
            getLeaveTypeName(leaveType);


    if (codeInput)
        codeInput.value =
            getLeaveTypeCode(leaveType);


    if (daysInput)
        daysInput.value =
            getLeaveTypeDays(leaveType);


    if (descriptionInput)
        descriptionInput.value =
            getLeaveTypeDescription(
                leaveType
            );


    if (activeInput)
        activeInput.checked =
            getLeaveTypeActiveStatus(
                leaveType
            );


    clearLeaveTypeErrors();

}


/* ==========================================================
   RESET FORM
========================================================== */

function resetLeaveTypeForm() {

    const form =
        document.getElementById(
            "leaveTypeForm"
        );


    if (form)
        form.reset();


    const idInput =
        document.getElementById(
            "leaveTypeId"
        );


    if (idInput)
        idInput.value = "";


    clearLeaveTypeErrors();

}


/* ==========================================================
   FORM SUBMIT
========================================================== */

async function handleLeaveTypeSubmit(event) {

    event.preventDefault();


    if (!validateLeaveTypeForm())
        return;


    const name =
        document.getElementById(
            "leaveTypeName"
        ).value.trim();


    const code =
        document.getElementById(
            "leaveTypeCode"
        ).value.trim().toUpperCase();


    const days =
        document.getElementById(
            "leaveTypeDays"
        ).value;


    const description =
        document.getElementById(
            "leaveTypeDescription"
        ).value.trim();


    const isActive =
        document.getElementById(
            "leaveTypeIsActive"
        ).checked;


    const body =
        buildLeaveTypePayload({
            name,
            code,
            days,
            description,
            isActive
        });


    const saveButton =
        document.getElementById(
            "saveLeaveTypeBtn"
        );


    setButtonLoading(
        saveButton,
        true,
        editingLeaveTypeId
            ? "Updating..."
            : "Saving..."
    );


    try {

        if (editingLeaveTypeId) {

            await LeaveService.updateLeaveType(
                editingLeaveTypeId,
                body
            );


            showAlert(
                "Leave type updated successfully.",
                "success"
            );

        } else {

            await LeaveService.createLeaveType(
                body
            );


            showAlert(
                "Leave type created successfully.",
                "success"
            );

        }


        closeLeaveTypeModal();

        await loadLeaveTypes();


    } catch (error) {

        console.error(
            "Leave type save error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to save leave type."
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            saveButton,
            false,
            editingLeaveTypeId
                ? "Update Leave Type"
                : "Save Leave Type"
        );

    }

}


/* ==========================================================
   PAYLOAD
========================================================== */

function buildLeaveTypePayload(data) {

    return {

        name: data.name,
        code: data.code,
        days: Number(data.days),
        description: data.description,
        is_active: data.isActive

    };

}


/* ==========================================================
   VALIDATION
========================================================== */

function validateLeaveTypeForm() {

    clearLeaveTypeErrors();


    const name =
        document.getElementById(
            "leaveTypeName"
        ).value.trim();


    const code =
        document.getElementById(
            "leaveTypeCode"
        ).value.trim();


    const days =
        document.getElementById(
            "leaveTypeDays"
        ).value;


    let valid = true;


    if (!name) {

        showFieldError(
            "leaveTypeNameError",
            "Leave type name is required."
        );

        valid = false;

    } else if (name.length < 2) {

        showFieldError(
            "leaveTypeNameError",
            "Leave type name must contain at least 2 characters."
        );

        valid = false;

    }


    if (!code) {

        showFieldError(
            "leaveTypeCodeError",
            "Leave code is required."
        );

        valid = false;

    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {

        showFieldError(
            "leaveTypeCodeError",
            "Leave code can contain only letters, numbers, _ and -."
        );

        valid = false;

    }


    if (
        days === "" ||
        days === null ||
        Number.isNaN(Number(days))
    ) {

        showFieldError(
            "leaveTypeDaysError",
            "Default days are required."
        );

        valid = false;

    } else if (Number(days) < 0) {

        showFieldError(
            "leaveTypeDaysError",
            "Days cannot be negative."
        );

        valid = false;

    }


    return valid;

}


/* ==========================================================
   FIELD ERROR
========================================================== */

function showFieldError(
    elementId,
    message
) {

    const element =
        document.getElementById(elementId);


    if (!element)
        return;


    element.textContent = message;

    element.classList.remove("hidden");

}


/* ==========================================================
   CLEAR ERRORS
========================================================== */

function clearLeaveTypeErrors() {

    const errors = [

        "leaveTypeNameError",
        "leaveTypeCodeError",
        "leaveTypeDaysError"

    ];


    errors.forEach(id => {

        const element =
            document.getElementById(id);


        if (!element)
            return;


        element.textContent = "";

        element.classList.add("hidden");

    });

}


/* ==========================================================
   ACTIVATE / DEACTIVATE
========================================================== */

async function toggleLeaveType(id) {

    const leaveType =
        leaveTypes.find(
            item =>
                String(getLeaveTypeId(item)) ===
                String(id)
        );


    if (!leaveType)
        return;


    const active =
        getLeaveTypeActiveStatus(
            leaveType
        );


    const action =
        active
            ? "deactivate"
            : "activate";


    const confirmed =
        window.confirm(
            `Are you sure you want to ${action} this leave type?`
        );


    if (!confirmed)
        return;


    try {

        await LeaveService.partialUpdateLeaveType(
            id,
            {
                is_active: !active
            }
        );


        showAlert(
            active
                ? "Leave type deactivated successfully."
                : "Leave type activated successfully.",
            "success"
        );


        await loadLeaveTypes();


    } catch (error) {

        console.error(
            "Toggle leave type error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                `Failed to ${action} leave type.`
            ),
            "error"
        );

    }

}


/* ==========================================================
   DELETE MODAL
========================================================== */

function openDeleteLeaveTypeModal(
    id,
    name
) {

    deletingLeaveTypeId = id;


    const modal =
        document.getElementById(
            "deleteLeaveTypeModal"
        );


    const nameElement =
        document.getElementById(
            "deleteLeaveTypeName"
        );


    if (nameElement)
        nameElement.textContent =
            name || "this leave type";


    if (modal)
        modal.classList.remove("hidden");

}


function closeDeleteLeaveTypeModal() {

    deletingLeaveTypeId = null;


    const modal =
        document.getElementById(
            "deleteLeaveTypeModal"
        );


    if (modal)
        modal.classList.add("hidden");

}


/* ==========================================================
   DELETE
========================================================== */

async function handleDeleteLeaveType() {

    if (!deletingLeaveTypeId)
        return;


    const deleteButton =
        document.getElementById(
            "confirmDeleteLeaveType"
        );


    setButtonLoading(
        deleteButton,
        true,
        "Deleting..."
    );


    try {

        await LeaveService.deleteLeaveType(
            deletingLeaveTypeId
        );


        closeDeleteLeaveTypeModal();


        showAlert(
            "Leave type deleted successfully.",
            "success"
        );


        await loadLeaveTypes();


    } catch (error) {

        console.error(
            "Delete leave type error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to delete leave type."
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            deleteButton,
            false,
            "Delete"
        );

    }

}


/* ==========================================================
   MODAL
========================================================== */

function openLeaveTypeModal() {

    const modal =
        document.getElementById(
            "leaveTypeModal"
        );


    if (!modal)
        return;


    modal.classList.remove("hidden");

    document.body.classList.add("overflow-hidden");


    setTimeout(() => {

        const nameInput =
            document.getElementById(
                "leaveTypeName"
            );


        if (nameInput)
            nameInput.focus();

    }, 100);

}


function closeLeaveTypeModal() {

    const modal =
        document.getElementById(
            "leaveTypeModal"
        );


    if (!modal)
        return;


    modal.classList.add("hidden");

    document.body.classList.remove(
        "overflow-hidden"
    );


    editingLeaveTypeId = null;

    resetLeaveTypeForm();

}


/* ==========================================================
   LOADING
========================================================== */

function showLeaveTypeLoading() {

    const tbody =
        document.getElementById(
            "leaveTypesTableBody"
        );


    const emptyState =
        document.getElementById(
            "leaveTypeEmptyState"
        );


    const pagination =
        document.getElementById(
            "leaveTypePaginationWrapper"
        );


    if (emptyState)
        emptyState.classList.add("hidden");


    if (pagination)
        pagination.classList.add("hidden");


    if (!tbody)
        return;


    tbody.innerHTML = `

        <tr>

            <td colspan="7" class="px-5 py-10 text-center">

                <div class="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">

                    <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                    Loading leave types...

                </div>

            </td>

        </tr>

    `;

}


/* ==========================================================
   BUTTON LOADING
========================================================== */

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button)
        return;


    if (loading) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;


        button.innerHTML = `

            <span class="inline-flex items-center gap-2">

                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                ${escapeHtml(text)}

            </span>

        `;

    } else {

        button.disabled = false;

        button.textContent =
            text;

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

        console[type === "error"
            ? "error"
            : "log"](message);

        return;

    }


    wrapper.classList.remove("hidden");


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

            wrapper.classList.add("hidden");

        }, 4000);

}


/* ==========================================================
   API ERROR MESSAGE
========================================================== */

function getApiErrorMessage(
    error,
    fallback = "Something went wrong."
) {

    if (!error)
        return fallback;


    const response =
        error.response ||
        error;


    const data =
        response.data ||
        response;


    if (typeof data === "string")
        return data;


    if (data && data.detail)
        return data.detail;


    if (data && data.message)
        return data.message;


    if (data && typeof data === "object") {

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


        if (messages.length)
            return messages.join(" | ");

    }


    if (error.message)
        return error.message;


    return fallback;

}


/* ==========================================================
   DATA HELPERS
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


function getLeaveTypeDays(type) {

    return type?.days ??
        type?.default_days ??
        type?.annual_days ??
        type?.number_of_days ??
        0;

}


function getLeaveTypeDescription(type) {

    return type?.description ??
        "";

}


function getLeaveTypeActiveStatus(type) {

    if (typeof type?.is_active === "boolean")
        return type.is_active;


    if (typeof type?.active === "boolean")
        return type.active;


    if (typeof type?.status === "string") {

        return type.status.toLowerCase() ===
            "active";

    }


    return true;

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