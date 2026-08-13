/**
 * ==========================================================
 * Leave Policy Management
 * ==========================================================
 * Add / Edit / Activate / Deactivate / Delete
 * ==========================================================
 */

console.log("LEAVE POLICY JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let leavePolicies = [];
let filteredLeavePolicies = [];

let editingLeavePolicyId = null;
let deletingLeavePolicyId = null;


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeLeavePolicyManagement();
});


async function initializeLeavePolicyManagement() {

    bindLeavePolicyEvents();

    await loadLeavePolicies();

}


/* ==========================================================
   EVENTS
========================================================== */

function bindLeavePolicyEvents() {

    const addButton =
        document.getElementById("addLeavePolicyBtn");

    const closeButton =
        document.getElementById("closeLeavePolicyModal");

    const cancelButton =
        document.getElementById("cancelLeavePolicyBtn");

    const backdrop =
        document.getElementById("leavePolicyModalBackdrop");

    const form =
        document.getElementById("leavePolicyForm");

    const search =
        document.getElementById("leavePolicySearch");

    const status =
        document.getElementById("leavePolicyStatus");

    const reset =
        document.getElementById("resetLeavePolicyFilters");


    if (addButton) {
        addButton.addEventListener("click", openAddLeavePolicyModal);
    }


    if (closeButton) {
        closeButton.addEventListener("click", closeLeavePolicyModal);
    }


    if (cancelButton) {
        cancelButton.addEventListener("click", closeLeavePolicyModal);
    }


    if (backdrop) {
        backdrop.addEventListener("click", closeLeavePolicyModal);
    }


    if (form) {
        form.addEventListener("submit", handleLeavePolicySubmit);
    }


    if (search) {
        search.addEventListener("input", () => {
            applyLeavePolicyFilters();
        });
    }


    if (status) {
        status.addEventListener("change", () => {
            applyLeavePolicyFilters();
        });
    }


    if (reset) {
        reset.addEventListener("click", resetLeavePolicyFilters);
    }


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeLeavePolicyModal();
            closeDeleteLeavePolicyModal();
        }

    });

}


/* ==========================================================
   LOAD POLICIES
========================================================== */

async function loadLeavePolicies() {

    showLeavePolicyLoading();

    try {

        const response =
            await LeaveService.getLeavePolicies();

        leavePolicies =
            normalizeLeavePolicyResponse(response);

        applyLeavePolicyFilters();

    } catch (error) {

        console.error(
            "Failed to load leave policies:",
            error
        );

        leavePolicies = [];
        filteredLeavePolicies = [];

        renderLeavePolicies();

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave policies."
            ),
            "error"
        );

    }

}


/* ==========================================================
   RESPONSE NORMALIZATION
========================================================== */

function normalizeLeavePolicyResponse(response) {

    if (Array.isArray(response))
        return response;

    if (response && Array.isArray(response.results))
        return response.results;

    if (response && Array.isArray(response.data))
        return response.data;

    if (
        response &&
        response.data &&
        Array.isArray(response.data.results)
    ) {
        return response.data.results;
    }

    return [];

}


/* ==========================================================
   FILTERS
========================================================== */

function applyLeavePolicyFilters() {

    const searchInput =
        document.getElementById("leavePolicySearch");

    const statusFilter =
        document.getElementById("leavePolicyStatus");


    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const status =
        statusFilter
            ? statusFilter.value
            : "";


    filteredLeavePolicies =
        leavePolicies.filter(policy => {

            const name =
                String(
                    policy.leave_type_name ||
                    ""
                ).toLowerCase();


            const active =
                Boolean(policy.is_active);


            const matchesSearch =
                !search ||
                name.includes(search);


            const matchesStatus =
                !status ||
                (status === "active" && active) ||
                (status === "inactive" && !active);


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    renderLeavePolicies();

}


/* ==========================================================
   RESET FILTERS
========================================================== */

function resetLeavePolicyFilters() {

    const search =
        document.getElementById(
            "leavePolicySearch"
        );

    const status =
        document.getElementById(
            "leavePolicyStatus"
        );


    if (search)
        search.value = "";


    if (status)
        status.value = "";


    applyLeavePolicyFilters();

}


/* ==========================================================
   RENDER TABLE
========================================================== */

function renderLeavePolicies() {

    const tbody =
        document.getElementById(
            "leavePoliciesTableBody"
        );

    const emptyState =
        document.getElementById(
            "leavePolicyEmptyState"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    if (!filteredLeavePolicies.length) {

        if (emptyState)
            emptyState.classList.remove("hidden");

        return;

    }


    if (emptyState)
        emptyState.classList.add("hidden");


    filteredLeavePolicies.forEach(
        (policy, index) => {

            tbody.appendChild(
                createLeavePolicyRow(
                    policy,
                    index + 1
                )
            );

        }
    );

}


/* ==========================================================
   CREATE TABLE ROW
========================================================== */

function createLeavePolicyRow(policy, index) {

    const row =
        document.createElement("tr");


    row.className =
        "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition";


    const id =
        policy.id;

    const leaveTypeName =
        policy.leave_type_name || "-";

    const minNotice =
        policy.min_days_notice ?? 0;

    const maxDays =
        policy.max_consecutive_days ?? 0;

    const halfDay =
        Boolean(policy.allow_half_day);

    const backdated =
        Boolean(policy.allow_backdated);

    const reason =
        Boolean(policy.requires_reason);

    const approval =
        Boolean(policy.requires_approval);

    const active =
        Boolean(policy.is_active);


    row.innerHTML = `

        <td class="px-5 py-4 text-gray-500 dark:text-gray-400">
            ${index}
        </td>

        <td class="px-5 py-4">
            <div class="font-medium text-gray-900 dark:text-white">
                ${escapeHtml(leaveTypeName)}
            </div>
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${minNotice} day${minNotice == 1 ? "" : "s"}
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${maxDays > 0 ? maxDays : "Unlimited"}
        </td>

        <td class="px-5 py-4">
            ${getYesNoBadge(halfDay)}
        </td>

        <td class="px-5 py-4">
            ${getYesNoBadge(backdated)}
        </td>

        <td class="px-5 py-4">
            ${getYesNoBadge(reason)}
        </td>

        <td class="px-5 py-4">
            ${getYesNoBadge(approval)}
        </td>

        <td class="px-5 py-4">
            ${getPolicyStatusBadge(active)}
        </td>

        <td class="px-5 py-4">

            <div class="flex items-center justify-end gap-2">

                <button
                    type="button"
                    class="edit-leave-policy-btn px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 transition">

                    Edit

                </button>

                <button
                    type="button"
                    class="toggle-leave-policy-btn px-3 py-1.5 rounded-md text-xs font-medium ${
                        active
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300"
                            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
                    }">

                    ${active ? "Deactivate" : "Activate"}

                </button>

                <button
                    type="button"
                    class="delete-leave-policy-btn px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300">

                    Delete

                </button>

            </div>

        </td>

    `;


    const editButton =
        row.querySelector(
            ".edit-leave-policy-btn"
        );

    const toggleButton =
        row.querySelector(
            ".toggle-leave-policy-btn"
        );

    const deleteButton =
        row.querySelector(
            ".delete-leave-policy-btn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => editLeavePolicy(id)
        );

    }


    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            () => toggleLeavePolicy(id)
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => openDeleteLeavePolicyModal(
                id,
                leaveTypeName
            )
        );

    }


    return row;

}


/* ==========================================================
   YES / NO BADGE
========================================================== */

function getYesNoBadge(value) {

    if (value) {

        return `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                Yes
            </span>
        `;

    }


    return `
        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
            No
        </span>
    `;

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getPolicyStatusBadge(active) {

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
   LOAD LEAVE TYPE DROPDOWN
========================================================== */

async function loadLeavePolicyLeaveTypes() {

    const select =
        document.getElementById(
            "leavePolicyLeaveType"
        );


    if (!select)
        return;


    try {

        const response =
            await LeaveService.getLeaveTypes();


        const types =
            normalizeLeaveTypeResponseForPolicy(
                response
            );


        select.innerHTML = `
            <option value="">
                Select Leave Type
            </option>
        `;


        types
            .filter(type => {

                if (
                    typeof type.is_active ===
                    "boolean"
                ) {
                    return type.is_active;
                }

                return true;

            })
            .forEach(type => {

                const option =
                    document.createElement("option");

                option.value =
                    type.id;

                option.textContent =
                    type.name ||
                    type.leave_type_name ||
                    "-";

                select.appendChild(option);

            });


    } catch (error) {

        console.error(
            "Failed to load leave types for policy:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave types."
            ),
            "error"
        );

    }

}


function normalizeLeaveTypeResponseForPolicy(response) {

    if (Array.isArray(response))
        return response;

    if (response && Array.isArray(response.results))
        return response.results;

    if (response && Array.isArray(response.data))
        return response.data;

    if (
        response &&
        response.data &&
        Array.isArray(response.data.results)
    ) {
        return response.data.results;
    }

    return [];

}


/* ==========================================================
   ADD POLICY
========================================================== */

async function openAddLeavePolicyModal() {

    editingLeavePolicyId = null;

    resetLeavePolicyForm();

    await loadLeavePolicyLeaveTypes();


    const title =
        document.getElementById(
            "leavePolicyModalTitle"
        );

    const button =
        document.getElementById(
            "saveLeavePolicyBtn"
        );


    if (title)
        title.textContent =
            "Add Leave Policy";


    if (button)
        button.textContent =
            "Save Leave Policy";


    openLeavePolicyModal();

}


/* ==========================================================
   EDIT POLICY
========================================================== */

async function editLeavePolicy(id) {

    try {

        const response =
            await LeaveService.getLeavePolicy(id);


        const policy =
            response && response.data
                ? response.data
                : response;


        editingLeavePolicyId = id;


        await loadLeavePolicyLeaveTypes();

        fillLeavePolicyForm(policy);


        const title =
            document.getElementById(
                "leavePolicyModalTitle"
            );

        const button =
            document.getElementById(
                "saveLeavePolicyBtn"
            );


        if (title)
            title.textContent =
                "Edit Leave Policy";


        if (button)
            button.textContent =
                "Update Leave Policy";


        openLeavePolicyModal();


    } catch (error) {

        console.error(
            "Failed to load leave policy:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to load leave policy."
            ),
            "error"
        );

    }

}


/* ==========================================================
   FILL FORM
========================================================== */

function fillLeavePolicyForm(policy) {

    const leaveType =
        document.getElementById(
            "leavePolicyLeaveType"
        );

    const minNotice =
        document.getElementById(
            "leavePolicyMinNotice"
        );

    const maxDays =
        document.getElementById(
            "leavePolicyMaxDays"
        );

    const halfDay =
        document.getElementById(
            "leavePolicyHalfDay"
        );

    const backdated =
        document.getElementById(
            "leavePolicyBackdated"
        );

    const reason =
        document.getElementById(
            "leavePolicyReason"
        );

    const approval =
        document.getElementById(
            "leavePolicyApproval"
        );

    const active =
        document.getElementById(
            "leavePolicyActive"
        );


    if (leaveType)
        leaveType.value =
            policy.leave_type ?? "";


    if (minNotice)
        minNotice.value =
            policy.min_days_notice ?? 0;


    if (maxDays)
        maxDays.value =
            policy.max_consecutive_days ?? 0;


    if (halfDay)
        halfDay.checked =
            Boolean(policy.allow_half_day);


    if (backdated)
        backdated.checked =
            Boolean(policy.allow_backdated);


    if (reason)
        reason.checked =
            Boolean(policy.requires_reason);


    if (approval)
        approval.checked =
            Boolean(policy.requires_approval);


    if (active)
        active.checked =
            Boolean(policy.is_active);

}


/* ==========================================================
   RESET FORM
========================================================== */

function resetLeavePolicyForm() {

    const form =
        document.getElementById(
            "leavePolicyForm"
        );


    if (form)
        form.reset();


    const id =
        document.getElementById(
            "leavePolicyId"
        );


    if (id)
        id.value = "";


    const minNotice =
        document.getElementById(
            "leavePolicyMinNotice"
        );


    const maxDays =
        document.getElementById(
            "leavePolicyMaxDays"
        );


    const active =
        document.getElementById(
            "leavePolicyActive"
        );


    if (minNotice)
        minNotice.value = 0;


    if (maxDays)
        maxDays.value = 0;


    if (active)
        active.checked = true;

}


/* ==========================================================
   SUBMIT
========================================================== */

async function handleLeavePolicySubmit(event) {

    event.preventDefault();


    if (!validateLeavePolicyForm())
        return;


    const payload = {

        leave_type:
            Number(
                document.getElementById(
                    "leavePolicyLeaveType"
                ).value
            ),

        min_days_notice:
            Number(
                document.getElementById(
                    "leavePolicyMinNotice"
                ).value
            ),

        max_consecutive_days:
            Number(
                document.getElementById(
                    "leavePolicyMaxDays"
                ).value
            ),

        allow_half_day:
            document.getElementById(
                "leavePolicyHalfDay"
            ).checked,

        allow_backdated:
            document.getElementById(
                "leavePolicyBackdated"
            ).checked,

        requires_reason:
            document.getElementById(
                "leavePolicyReason"
            ).checked,

        requires_approval:
            document.getElementById(
                "leavePolicyApproval"
            ).checked,

        is_active:
            document.getElementById(
                "leavePolicyActive"
            ).checked

    };


    const button =
        document.getElementById(
            "saveLeavePolicyBtn"
        );


    setButtonLoading(
        button,
        true,
        editingLeavePolicyId
            ? "Updating..."
            : "Saving..."
    );


    try {

        if (editingLeavePolicyId) {

            await LeaveService.updateLeavePolicy(
                editingLeavePolicyId,
                payload
            );

            showAlert(
                "Leave policy updated successfully.",
                "success"
            );

        } else {

            await LeaveService.createLeavePolicy(
                payload
            );

            showAlert(
                "Leave policy created successfully.",
                "success"
            );

        }


        closeLeavePolicyModal();

        await loadLeavePolicies();


    } catch (error) {

        console.error(
            "Leave policy save error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to save leave policy."
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            editingLeavePolicyId
                ? "Update Leave Policy"
                : "Save Leave Policy"
        );

    }

}


/* ==========================================================
   VALIDATION
========================================================== */

function validateLeavePolicyForm() {

    const leaveType =
        document.getElementById(
            "leavePolicyLeaveType"
        );


    const minNotice =
        document.getElementById(
            "leavePolicyMinNotice"
        );


    const maxDays =
        document.getElementById(
            "leavePolicyMaxDays"
        );


    if (!leaveType || !leaveType.value) {

        showAlert(
            "Please select a leave type.",
            "error"
        );

        return false;

    }


    if (
        minNotice &&
        Number(minNotice.value) < 0
    ) {

        showAlert(
            "Minimum notice cannot be negative.",
            "error"
        );

        return false;

    }


    if (
        maxDays &&
        Number(maxDays.value) < 0
    ) {

        showAlert(
            "Maximum consecutive days cannot be negative.",
            "error"
        );

        return false;

    }


    return true;

}


/* ==========================================================
   TOGGLE
========================================================== */

async function toggleLeavePolicy(id) {

    const policy =
        leavePolicies.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!policy)
        return;


    const active =
        Boolean(policy.is_active);


    const action =
        active
            ? "deactivate"
            : "activate";


    const confirmed =
        window.confirm(
            `Are you sure you want to ${action} this leave policy?`
        );


    if (!confirmed)
        return;


    try {

        await LeaveService.partialUpdateLeavePolicy(
            id,
            {
                is_active: !active
            }
        );


        showAlert(
            active
                ? "Leave policy deactivated successfully."
                : "Leave policy activated successfully.",
            "success"
        );


        await loadLeavePolicies();


    } catch (error) {

        console.error(
            "Toggle leave policy error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                `Failed to ${action} leave policy.`
            ),
            "error"
        );

    }

}


/* ==========================================================
   DELETE MODAL
========================================================== */

function openDeleteLeavePolicyModal(id, name) {

    deletingLeavePolicyId = id;


    let modal =
        document.getElementById(
            "deleteLeavePolicyModal"
        );


    if (!modal) {

        createDeleteLeavePolicyModal();

        modal =
            document.getElementById(
                "deleteLeavePolicyModal"
            );

    }


    const nameElement =
        document.getElementById(
            "deleteLeavePolicyName"
        );


    if (nameElement)
        nameElement.textContent =
            name || "this leave policy";


    if (modal)
        modal.classList.remove("hidden");

}


function closeDeleteLeavePolicyModal() {

    deletingLeavePolicyId = null;


    const modal =
        document.getElementById(
            "deleteLeavePolicyModal"
        );


    if (modal)
        modal.classList.add("hidden");

}


/* ==========================================================
   CREATE DELETE MODAL DYNAMICALLY
========================================================== */

function createDeleteLeavePolicyModal() {

    if (
        document.getElementById(
            "deleteLeavePolicyModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement("div");


    modal.id =
        "deleteLeavePolicyModal";


    modal.className =
        "hidden fixed inset-0 z-[60] overflow-y-auto";


    modal.innerHTML = `

        <div class="fixed inset-0 bg-black/50"></div>

        <div class="relative min-h-screen flex items-center justify-center p-4">

            <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">

                <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">

                    <span class="text-red-600 dark:text-red-400 text-xl">
                        !
                    </span>

                </div>

                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Leave Policy?
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">

                    Are you sure you want to delete the policy for

                    <span
                        id="deleteLeavePolicyName"
                        class="font-semibold text-gray-700 dark:text-gray-200">
                    </span>?

                    This action cannot be undone.

                </p>

                <div class="flex justify-end gap-3 mt-6">

                    <button
                        type="button"
                        id="cancelDeleteLeavePolicy"
                        class="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium">

                        Cancel

                    </button>

                    <button
                        type="button"
                        id="confirmDeleteLeavePolicy"
                        class="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">

                        Delete

                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("cancelDeleteLeavePolicy")
        .addEventListener(
            "click",
            closeDeleteLeavePolicyModal
        );


    document
        .getElementById("confirmDeleteLeavePolicy")
        .addEventListener(
            "click",
            handleDeleteLeavePolicy
        );

}


/* ==========================================================
   DELETE
========================================================== */

async function handleDeleteLeavePolicy() {

    if (!deletingLeavePolicyId)
        return;


    const button =
        document.getElementById(
            "confirmDeleteLeavePolicy"
        );


    setButtonLoading(
        button,
        true,
        "Deleting..."
    );


    try {

        await LeaveService.deleteLeavePolicy(
            deletingLeavePolicyId
        );


        closeDeleteLeavePolicyModal();


        showAlert(
            "Leave policy deleted successfully.",
            "success"
        );


        await loadLeavePolicies();


    } catch (error) {

        console.error(
            "Delete leave policy error:",
            error
        );

        showAlert(
            getApiErrorMessage(
                error,
                "Failed to delete leave policy."
            ),
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false,
            "Delete"
        );

    }

}


/* ==========================================================
   MODAL
========================================================== */

function openLeavePolicyModal() {

    const modal =
        document.getElementById(
            "leavePolicyModal"
        );


    if (!modal)
        return;


    modal.classList.remove("hidden");

    document.body.classList.add(
        "overflow-hidden"
    );


    setTimeout(() => {

        const select =
            document.getElementById(
                "leavePolicyLeaveType"
            );

        if (select)
            select.focus();

    }, 100);

}


function closeLeavePolicyModal() {

    const modal =
        document.getElementById(
            "leavePolicyModal"
        );


    if (!modal)
        return;


    modal.classList.add("hidden");

    document.body.classList.remove(
        "overflow-hidden"
    );


    editingLeavePolicyId = null;

    resetLeavePolicyForm();

}


/* ==========================================================
   LOADING
========================================================== */

function showLeavePolicyLoading() {

    const tbody =
        document.getElementById(
            "leavePoliciesTableBody"
        );


    const empty =
        document.getElementById(
            "leavePolicyEmptyState"
        );


    if (empty)
        empty.classList.add("hidden");


    if (!tbody)
        return;


    tbody.innerHTML = `

        <tr>

            <td colspan="10" class="px-5 py-10 text-center">

                <div class="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">

                    <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                    Loading leave policies...

                </div>

            </td>

        </tr>

    `;

}


/* ==========================================================
   BUTTON LOADING
========================================================== */

function setButtonLoading(button, loading, text) {

    if (!button)
        return;


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