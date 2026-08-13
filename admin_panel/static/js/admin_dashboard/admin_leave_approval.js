/**
 * ==========================================================
 * Admin Leave Approval
 * ==========================================================
 */

console.log("ADMIN LEAVE APPROVAL JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let adminLeaveRequests = [];
let filteredAdminLeaveRequests = [];

let selectedLeaveRequest = null;


/* ==========================================================
   DOM
========================================================== */

const body =
    document.getElementById(
        "adminLeaveRequestsBody"
    );

const loading =
    document.getElementById(
        "adminLeaveLoading"
    );

const empty =
    document.getElementById(
        "adminLeaveEmpty"
    );

const searchInput =
    document.getElementById(
        "adminLeaveSearch"
    );

const statusFilter =
    document.getElementById(
        "adminLeaveStatusFilter"
    );

const dateFilter =
    document.getElementById(
        "adminLeaveDateFilter"
    );


/* ==========================================================
   ALERT
========================================================== */

function showAlert(message, type = "success") {

    const alert =
        document.getElementById(
            "adminLeaveAlert"
        );

    const inner =
        document.getElementById(
            "adminLeaveAlertInner"
        );

    inner.textContent = message;

    inner.className =
        "px-4 py-3 rounded-lg text-sm font-medium";

    if (type === "success") {

        inner.classList.add(
            "bg-green-100",
            "text-green-700",
            "dark:bg-green-900/30",
            "dark:text-green-400"
        );

    } else {

        inner.classList.add(
            "bg-red-100",
            "text-red-700",
            "dark:bg-red-900/30",
            "dark:text-red-400"
        );

    }

    alert.classList.remove("hidden");

    setTimeout(() => {

        alert.classList.add("hidden");

    }, 4000);

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function getStatusBadge(status) {

    const config = {

        PENDING: {
            className:
                "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            label: "Pending"
        },

        APPROVED: {
            className:
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            label: "Approved"
        },

        REJECTED: {
            className:
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            label: "Rejected"
        },

        CANCELLED: {
            className:
                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
            label: "Cancelled"
        }

    };

    const item =
        config[status] || {
            className:
                "bg-gray-100 text-gray-700",
            label: status
        };

    return `
        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${item.className}">
            ${escapeHtml(item.label)}
        </span>
    `;

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const value =
        new Date(`${date}T00:00:00`);

    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ==========================================================
   FORMAT DAYS
========================================================== */

function formatDays(days) {

    if (
        days === null ||
        days === undefined
    ) {
        return "-";
    }

    return Number(days)
        .toString();

}


/* ==========================================================
   LOAD REQUESTS
========================================================== */

async function loadLeaveRequests() {

    loading.classList.remove("hidden");
    empty.classList.add("hidden");

    body.innerHTML = "";

    try {

        const data =
            await LeaveService.getLeaveRequests();

        adminLeaveRequests =
            Array.isArray(data)
                ? data
                : data.results || [];

        updateSummary();

        applyFilters();

    } catch (error) {

        console.error(
            "Admin leave requests error:",
            error
        );

        showAlert(
            getApiErrorMessage(error),
            "error"
        );

    } finally {

        loading.classList.add("hidden");

    }

}


/* ==========================================================
   ERROR MESSAGE
========================================================== */

function getApiErrorMessage(error) {

    if (
        error &&
        error.data &&
        typeof error.data === "object"
    ) {

        const data = error.data;

        if (data.detail) {
            return data.detail;
        }

        if (data.message) {
            return data.message;
        }

        const firstKey =
            Object.keys(data)[0];

        if (firstKey) {

            const value =
                data[firstKey];

            if (Array.isArray(value)) {
                return value[0];
            }

            if (typeof value === "string") {
                return value;
            }

        }

    }

    return error?.message ||
        "Something went wrong.";

}


/* ==========================================================
   SUMMARY
========================================================== */

function updateSummary() {

    const total =
        adminLeaveRequests.length;

    const pending =
        adminLeaveRequests.filter(
            item => item.status === "PENDING"
        ).length;

    const approved =
        adminLeaveRequests.filter(
            item => item.status === "APPROVED"
        ).length;

    const rejected =
        adminLeaveRequests.filter(
            item => item.status === "REJECTED"
        ).length;


    document.getElementById(
        "totalLeaveRequests"
    ).textContent = total;

    document.getElementById(
        "pendingLeaveRequests"
    ).textContent = pending;

    document.getElementById(
        "approvedLeaveRequests"
    ).textContent = approved;

    document.getElementById(
        "rejectedLeaveRequests"
    ).textContent = rejected;

}


/* ==========================================================
   FILTER
========================================================== */

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const status =
        statusFilter.value;

    const date =
        dateFilter.value;


    filteredAdminLeaveRequests =
        adminLeaveRequests.filter(
            request => {

                const employee =
                    request.user_name || "";

                const email =
                    request.user_email || "";

                const leaveType =
                    request.leave_type_name || "";

                const matchesSearch =
                    !search ||
                    employee.toLowerCase().includes(search) ||
                    email.toLowerCase().includes(search) ||
                    leaveType.toLowerCase().includes(search);

                const matchesStatus =
                    !status ||
                    request.status === status;

                const matchesDate =
                    !date ||
                    (
                        request.start_date <= date &&
                        request.end_date >= date
                    );

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );

            }
        );

    renderRequests();

}


/* ==========================================================
   RENDER
========================================================== */

function renderRequests() {

    body.innerHTML = "";

    if (!filteredAdminLeaveRequests.length) {

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");


    filteredAdminLeaveRequests.forEach(
        request => {

            const row =
                document.createElement("tr");

            row.className =
                "hover:bg-gray-50 dark:hover:bg-gray-700/30";


            const canAction =
                request.status === "PENDING";


            row.innerHTML = `

                <td class="px-5 py-4">

                    <div class="font-medium text-gray-900 dark:text-white">
                        ${escapeHtml(
                            request.user_name || "-"
                        )}
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ${escapeHtml(
                            request.user_email || "-"
                        )}
                    </div>

                </td>


                <td class="px-5 py-4">

                    <div class="font-medium text-gray-900 dark:text-white">
                        ${escapeHtml(
                            request.leave_type_name || "-"
                        )}
                    </div>

                </td>


                <td class="px-5 py-4 whitespace-nowrap">

                    <div class="text-gray-900 dark:text-white">
                        ${formatDate(request.start_date)}
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        to ${formatDate(request.end_date)}
                    </div>

                </td>


                <td class="px-5 py-4">

                    <div class="font-medium text-gray-900 dark:text-white">
                        ${formatDays(request.total_days)}
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        ${request.day_type === "HALF_DAY"
                            ? "Half Day"
                            : "Full Day"}
                    </div>

                </td>


                <td class="px-5 py-4">

                    ${getStatusBadge(request.status)}

                </td>


                <td class="px-5 py-4">

                    <div class="flex justify-end gap-2">

                        <button
                            type="button"
                            data-action="view"
                            data-id="${request.id}"
                            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium">

                            View

                        </button>


                        ${
                            canAction
                            ? `

                                <button
                                    type="button"
                                    data-action="approve"
                                    data-id="${request.id}"
                                    class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium">

                                    Approve

                                </button>


                                <button
                                    type="button"
                                    data-action="reject"
                                    data-id="${request.id}"
                                    class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium">

                                    Reject

                                </button>

                            `
                            : ""
                        }

                    </div>

                </td>

            `;


            body.appendChild(row);

        }
    );

}


/* ==========================================================
   GET REQUEST
========================================================== */

function findLeaveRequest(id) {

    return adminLeaveRequests.find(
        request =>
            String(request.id) === String(id)
    );

}


/* ==========================================================
   VIEW MODAL
========================================================== */

function openViewModal(request) {

    const modal =
        document.getElementById(
            "adminLeaveViewModal"
        );

    const content =
        document.getElementById(
            "adminLeaveViewContent"
        );


    const approvalHistory =
        request.approval_history || [];


    content.innerHTML = `

        <div class="space-y-5">

            <div>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Employee
                </p>

                <p class="font-medium text-gray-900 dark:text-white mt-1">
                    ${escapeHtml(
                        request.user_name || "-"
                    )}
                </p>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    ${escapeHtml(
                        request.user_email || "-"
                    )}
                </p>

            </div>


            <div class="grid grid-cols-2 gap-4">

                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Leave Type
                    </p>

                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                        ${escapeHtml(
                            request.leave_type_name || "-"
                        )}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Status
                    </p>

                    <div class="mt-1">
                        ${getStatusBadge(request.status)}
                    </div>

                </div>

            </div>


            <div class="grid grid-cols-2 gap-4">

                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Start Date
                    </p>

                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                        ${formatDate(request.start_date)}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        End Date
                    </p>

                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                        ${formatDate(request.end_date)}
                    </p>

                </div>

            </div>


            <div class="grid grid-cols-2 gap-4">

                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Total Days
                    </p>

                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                        ${formatDays(request.total_days)}
                    </p>

                </div>


                <div>

                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Day Type
                    </p>

                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                        ${
                            request.day_type === "HALF_DAY"
                            ? "Half Day"
                            : "Full Day"
                        }
                    </p>

                </div>

            </div>


            <div>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Reason
                </p>

                <p class="text-sm text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                    ${escapeHtml(
                        request.reason || "-"
                    )}
                </p>

            </div>


            ${
                request.rejection_reason
                ? `

                    <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">

                        <p class="text-xs text-red-600 dark:text-red-400">
                            Rejection Reason
                        </p>

                        <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                            ${escapeHtml(
                                request.rejection_reason
                            )}
                        </p>

                    </div>

                `
                : ""
            }


            ${
                approvalHistory.length
                ? `

                    <div>

                        <p class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Approval History
                        </p>

                        <div class="space-y-3">

                            ${approvalHistory.map(
                                approval => `

                                    <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">

                                        <div class="flex justify-between gap-3">

                                            <span class="font-medium text-gray-900 dark:text-white">
                                                ${escapeHtml(
                                                    approval.approver_name || "-"
                                                )}
                                            </span>

                                            ${getStatusBadge(
                                                approval.action
                                            )}

                                        </div>

                                        ${
                                            approval.comment
                                            ? `

                                                <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                                    ${escapeHtml(
                                                        approval.comment
                                                    )}
                                                </p>

                                            `
                                            : ""
                                        }

                                    </div>

                                `
                            ).join("")}

                        </div>

                    </div>

                `
                : ""
            }


        </div>

    `;


    modal.classList.remove("hidden");

}


/* ==========================================================
   CLOSE VIEW
========================================================== */

function closeViewModal() {

    document
        .getElementById(
            "adminLeaveViewModal"
        )
        .classList.add("hidden");

}


/* ==========================================================
   APPROVE MODAL
========================================================== */

function openApproveModal(request) {

    selectedLeaveRequest =
        request;

    document.getElementById(
        "approveLeaveInfo"
    ).innerHTML = `

        <div class="font-medium text-gray-900 dark:text-white">
            ${escapeHtml(
                request.user_name || "-"
            )}
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${escapeHtml(
                request.leave_type_name || "-"
            )}
            ·
            ${formatDate(request.start_date)}
            -
            ${formatDate(request.end_date)}
            ·
            ${formatDays(request.total_days)} days
        </div>

    `;


    document.getElementById(
        "approveLeaveComment"
    ).value = "";


    document.getElementById(
        "approveLeaveModal"
    ).classList.remove("hidden");

}


/* ==========================================================
   CLOSE APPROVE
========================================================== */

function closeApproveModal() {

    selectedLeaveRequest = null;

    document
        .getElementById(
            "approveLeaveModal"
        )
        .classList.add("hidden");

}


/* ==========================================================
   APPROVE
========================================================== */

async function approveSelectedLeave() {

    if (!selectedLeaveRequest) {
        return;
    }

    const id =
        selectedLeaveRequest.id;

    const comment =
        document.getElementById(
            "approveLeaveComment"
        ).value.trim();


    const button =
        document.getElementById(
            "confirmApproveLeaveBtn"
        );

    button.disabled = true;
    button.textContent = "Approving...";


    try {

        await LeaveService.approveLeave(
            id,
            {
                comment
            }
        );

        closeApproveModal();

        showAlert(
            "Leave request approved successfully."
        );

        await loadLeaveRequests();

    } catch (error) {

        console.error(
            "Approve leave error:",
            error
        );

        showAlert(
            getApiErrorMessage(error),
            "error"
        );

    } finally {

        button.disabled = false;
        button.textContent = "Approve";

    }

}


/* ==========================================================
   REJECT MODAL
========================================================== */

function openRejectModal(request) {

    selectedLeaveRequest =
        request;


    document.getElementById(
        "rejectLeaveInfo"
    ).innerHTML = `

        <div class="font-medium text-gray-900 dark:text-white">
            ${escapeHtml(
                request.user_name || "-"
            )}
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${escapeHtml(
                request.leave_type_name || "-"
            )}
            ·
            ${formatDate(request.start_date)}
            -
            ${formatDate(request.end_date)}
            ·
            ${formatDays(request.total_days)} days
        </div>

    `;


    document.getElementById(
        "rejectLeaveReason"
    ).value = "";


    document.getElementById(
        "rejectLeaveReasonError"
    ).classList.add("hidden");


    document.getElementById(
        "rejectLeaveModal"
    ).classList.remove("hidden");

}


/* ==========================================================
   CLOSE REJECT
========================================================== */

function closeRejectModal() {

    selectedLeaveRequest = null;

    document
        .getElementById(
            "rejectLeaveModal"
        )
        .classList.add("hidden");

}


/* ==========================================================
   REJECT
========================================================== */

async function rejectSelectedLeave() {

    if (!selectedLeaveRequest) {
        return;
    }


    const reason =
        document.getElementById(
            "rejectLeaveReason"
        ).value.trim();


    const errorElement =
        document.getElementById(
            "rejectLeaveReasonError"
        );


    if (!reason) {

        errorElement.textContent =
            "Rejection reason is required.";

        errorElement.classList.remove(
            "hidden"
        );

        return;

    }


    const button =
        document.getElementById(
            "confirmRejectLeaveBtn"
        );

    button.disabled = true;
    button.textContent = "Rejecting...";


    try {

        await LeaveService.rejectLeave(
            selectedLeaveRequest.id,
            {
                rejection_reason: reason
            }
        );

        closeRejectModal();

        showAlert(
            "Leave request rejected successfully."
        );

        await loadLeaveRequests();

    } catch (error) {

        console.error(
            "Reject leave error:",
            error
        );

        showAlert(
            getApiErrorMessage(error),
            "error"
        );

    } finally {

        button.disabled = false;
        button.textContent = "Reject";

    }

}


/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

    dateFilter.addEventListener(
        "change",
        applyFilters
    );


    document
        .getElementById(
            "refreshLeaveApprovalBtn"
        )
        .addEventListener(
            "click",
            loadLeaveRequests
        );


    body.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) {
                return;
            }


            const id =
                button.dataset.id;

            const action =
                button.dataset.action;

            const request =
                findLeaveRequest(id);

            if (!request) {
                return;
            }


            if (action === "view") {

                openViewModal(request);

            }

            else if (action === "approve") {

                openApproveModal(request);

            }

            else if (action === "reject") {

                openRejectModal(request);

            }

        }
    );


    document
        .getElementById(
            "closeAdminLeaveViewModal"
        )
        .addEventListener(
            "click",
            closeViewModal
        );


    document
        .getElementById(
            "adminLeaveViewBackdrop"
        )
        .addEventListener(
            "click",
            closeViewModal
        );


    document
        .getElementById(
            "cancelApproveLeaveBtn"
        )
        .addEventListener(
            "click",
            closeApproveModal
        );


    document
        .getElementById(
            "approveLeaveBackdrop"
        )
        .addEventListener(
            "click",
            closeApproveModal
        );


    document
        .getElementById(
            "confirmApproveLeaveBtn"
        )
        .addEventListener(
            "click",
            approveSelectedLeave
        );


    document
        .getElementById(
            "cancelRejectLeaveBtn"
        )
        .addEventListener(
            "click",
            closeRejectModal
        );


    document
        .getElementById(
            "rejectLeaveBackdrop"
        )
        .addEventListener(
            "click",
            closeRejectModal
        );


    document
        .getElementById(
            "confirmRejectLeaveBtn"
        )
        .addEventListener(
            "click",
            rejectSelectedLeave
        );

}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Initializing Admin Leave Approval module..."
        );

        initializeEvents();

        loadLeaveRequests();

        console.log(
            "Admin Leave Approval module initialized."
        );

    }
);