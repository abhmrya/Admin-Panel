/**
 * ==========================================================
 * EMPLOYEE LEAVE MANAGEMENT
 * ==========================================================
 *
 * Features:
 * - My Leave Balance
 * - Apply Leave
 * - Leave Balance Preview
 * - My Leave Requests
 * - Search Requests
 * - Filter Requests
 * - View Request
 * - Cancel Pending / Approved Request
 * ==========================================================
 */

console.log("EMPLOYEE LEAVE JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let employeeLeaveBalances = [];
let employeeLeaveTypes = [];
let employeeLeaveRequests = [];
let selectedEmployeeLeaveRequest = null;


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing Employee Leave module...");

    bindEmployeeLeaveEvents();

    await Promise.all([
        loadEmployeeLeaveTypes(),
        loadEmployeeLeaveBalances(),
        loadEmployeeLeaveRequests()
    ]);

    console.log("Employee Leave module initialized.");
});


/* ==========================================================
   EVENTS
========================================================== */

function bindEmployeeLeaveEvents() {
    const applyButton = document.getElementById("applyLeaveBtn");
    const closeButton = document.getElementById("closeEmployeeLeaveModal");
    const cancelButton = document.getElementById("cancelEmployeeLeaveBtn");
    const form = document.getElementById("employeeLeaveForm");
    const backdrop = document.getElementById("employeeLeaveModalBackdrop");

    const viewClose = document.getElementById("closeEmployeeLeaveViewModal");
    const viewBackdrop = document.getElementById("employeeLeaveViewBackdrop");

    const search = document.getElementById("employeeLeaveSearch");
    const status = document.getElementById("employeeLeaveStatusFilter");
    const year = document.getElementById("employeeLeaveBalanceYear");

    const leaveType = document.getElementById("employeeLeaveType");
    const startDate = document.getElementById("employeeLeaveStartDate");
    const endDate = document.getElementById("employeeLeaveEndDate");


    if (applyButton) {
        applyButton.addEventListener("click", openEmployeeLeaveModal);
    }

    if (closeButton) {
        closeButton.addEventListener("click", closeEmployeeLeaveModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeEmployeeLeaveModal);
    }

    if (backdrop) {
        backdrop.addEventListener("click", event => {
            if (event.target === backdrop) {
                closeEmployeeLeaveModal();
            }
        });
    }

    if (viewClose) {
        viewClose.addEventListener("click", closeEmployeeLeaveViewModal);
    }

    if (viewBackdrop) {
        viewBackdrop.addEventListener("click", event => {
            if (event.target === viewBackdrop) {
                closeEmployeeLeaveViewModal();
            }
        });
    }

    if (form) {
        form.addEventListener("submit", handleEmployeeLeaveSubmit);
    }

    if (search) {
        search.addEventListener("input", renderEmployeeLeaveRequests);
    }

    if (status) {
        status.addEventListener("change", renderEmployeeLeaveRequests);
    }

    if (year) {
        year.addEventListener("change", renderEmployeeLeaveBalances);
    }

    if (leaveType) {
        leaveType.addEventListener("change", updateEmployeeLeaveBalancePreview);
    }

    if (startDate) {
        startDate.addEventListener("change", updateEmployeeLeaveBalancePreview);
    }

    if (endDate) {
        endDate.addEventListener("change", updateEmployeeLeaveBalancePreview);
    }

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") {
            return;
        }

        closeEmployeeLeaveModal();
        closeEmployeeLeaveViewModal();
    });
}


/* ==========================================================
   LOAD LEAVE TYPES
========================================================== */

async function loadEmployeeLeaveTypes() {
    try {
        const response = await LeaveService.getLeaveTypes();

        employeeLeaveTypes = normalizeResponse(response).filter(type => {
            return type.is_active !== false &&
                type.has_active_policy === true;
        });

        populateEmployeeLeaveTypes();

    } catch (error) {
        console.error("Failed to load leave types:", error);

        employeeLeaveTypes = [];

        showEmployeeLeaveAlert(
            getEmployeeLeaveError(error, "Failed to load leave types."),
            "error"
        );
    }
}


/* ==========================================================
   LOAD BALANCES
========================================================== */

async function loadEmployeeLeaveBalances() {
    const loading = document.getElementById("employeeLeaveBalanceLoading");
    const container = document.getElementById("employeeLeaveBalanceContainer");
    const empty = document.getElementById("employeeLeaveBalanceEmpty");

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (container) {
        container.innerHTML = "";
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    try {
        const response = await LeaveService.getLeaveBalances();

        employeeLeaveBalances = normalizeResponse(response);

        populateBalanceYears();
        renderEmployeeLeaveBalances();

    } catch (error) {
        console.error("Failed to load leave balances:", error);

        employeeLeaveBalances = [];

        renderEmployeeLeaveBalances();

        showEmployeeLeaveAlert(
            getEmployeeLeaveError(error, "Failed to load leave balance."),
            "error"
        );

    } finally {
        if (loading) {
            loading.classList.add("hidden");
        }
    }
}


/* ==========================================================
   LOAD REQUESTS
========================================================== */

async function loadEmployeeLeaveRequests() {
    const loading = document.getElementById("employeeLeaveRequestsLoading");
    const body = document.getElementById("employeeLeaveRequestsBody");
    const empty = document.getElementById("employeeLeaveRequestsEmpty");

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (body) {
        body.innerHTML = "";
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    try {
        const response = await LeaveService.getLeaveRequests();

        employeeLeaveRequests = normalizeResponse(response);

        renderEmployeeLeaveRequests();

    } catch (error) {
        console.error("Failed to load leave requests:", error);

        employeeLeaveRequests = [];

        renderEmployeeLeaveRequests();

        showEmployeeLeaveAlert(
            getEmployeeLeaveError(error, "Failed to load leave requests."),
            "error"
        );

    } finally {
        if (loading) {
            loading.classList.add("hidden");
        }
    }
}


/* ==========================================================
   NORMALIZE RESPONSE
========================================================== */

function normalizeResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (response && Array.isArray(response.results)) {
        return response.results;
    }

    if (response && Array.isArray(response.data)) {
        return response.data;
    }

    if (response?.data && Array.isArray(response.data.results)) {
        return response.data.results;
    }

    return [];
}


/* ==========================================================
   POPULATE LEAVE TYPES
========================================================== */

function populateEmployeeLeaveTypes() {
    const select = document.getElementById("employeeLeaveType");

    if (!select) {
        return;
    }

    select.innerHTML = `<option value="">Select Leave Type</option>`;

    employeeLeaveTypes.forEach(type => {
        const option = document.createElement("option");

        option.value = String(type.id);
        option.textContent = type.code
            ? `${type.name} (${type.code})`
            : type.name;

        select.appendChild(option);
    });
}


/* ==========================================================
   POPULATE BALANCE YEARS
========================================================== */

function populateBalanceYears() {
    const select = document.getElementById("employeeLeaveBalanceYear");

    if (!select) {
        return;
    }

    const currentValue = select.value;

    const years = [
        ...new Set(
            employeeLeaveBalances
                .map(balance => balance.year)
                .filter(Boolean)
        )
    ].sort((a, b) => Number(b) - Number(a));

    select.innerHTML = `<option value="">All Years</option>`;

    years.forEach(year => {
        const option = document.createElement("option");

        option.value = String(year);
        option.textContent = String(year);

        select.appendChild(option);
    });

    if (years.some(year => String(year) === String(currentValue))) {
        select.value = currentValue;
    }
}


/* ==========================================================
   RENDER BALANCES
========================================================== */

function renderEmployeeLeaveBalances() {
    const container = document.getElementById("employeeLeaveBalanceContainer");
    const empty = document.getElementById("employeeLeaveBalanceEmpty");
    const yearSelect = document.getElementById("employeeLeaveBalanceYear");

    if (!container) {
        return;
    }

    const selectedYear = yearSelect ? yearSelect.value : "";

    const balances = employeeLeaveBalances.filter(balance => {
        if (!selectedYear) {
            return true;
        }

        return String(balance.year) === String(selectedYear);
    });

    container.innerHTML = "";

    if (!balances.length) {
        if (empty) {
            empty.classList.remove("hidden");
        }

        return;
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    balances.forEach(balance => {
        container.appendChild(
            createEmployeeBalanceCard(balance)
        );
    });
}


/* ==========================================================
   BALANCE CARD
========================================================== */

function createEmployeeBalanceCard(balance) {
    const card = document.createElement("div");

    const allocated = Number(balance.allocated_days || 0);
    const used = Number(balance.used_days || 0);
    const pending = Number(balance.pending_days || 0);

    const remaining = Number(
        balance.remaining_days ?? Math.max(allocated - used - pending, 0)
    );

    const usagePercentage = allocated > 0
        ? Math.min((used / allocated) * 100, 100)
        : 0;

    card.className =
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5";

    card.innerHTML = `
        <div class="flex items-start justify-between gap-3 mb-5">
            <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                    ${escapeEmployeeLeaveHtml(balance.leave_type_name || "-")}
                </h3>

                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${escapeEmployeeLeaveHtml(balance.leave_type_code || "")}
                    ${balance.year ? ` · ${escapeEmployeeLeaveHtml(balance.year)}` : ""}
                </p>
            </div>

            <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                ${remaining} left
            </span>
        </div>

        <div class="grid grid-cols-3 gap-2">
            <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">
                    ${allocated}
                </div>
                <div class="text-xs text-gray-500">
                    Allocated
                </div>
            </div>

            <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-white">
                    ${used}
                </div>
                <div class="text-xs text-gray-500">
                    Used
                </div>
            </div>

            <div class="text-center">
                <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    ${pending}
                </div>
                <div class="text-xs text-gray-500">
                    Pending
                </div>
            </div>
        </div>

        <div class="mt-5">
            <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-500">
                    Usage
                </span>

                <span class="text-gray-500">
                    ${Math.round(usagePercentage)}%
                </span>
            </div>

            <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    class="h-full bg-blue-600 rounded-full"
                    style="width:${usagePercentage}%">
                </div>
            </div>
        </div>
    `;

    return card;
}


/* ==========================================================
   RENDER REQUESTS
========================================================== */

function renderEmployeeLeaveRequests() {
    const body = document.getElementById("employeeLeaveRequestsBody");
    const empty = document.getElementById("employeeLeaveRequestsEmpty");

    if (!body) {
        return;
    }

    const searchInput = document.getElementById("employeeLeaveSearch");
    const statusFilter = document.getElementById("employeeLeaveStatusFilter");

    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const status = statusFilter
        ? statusFilter.value
        : "";

    const filtered = employeeLeaveRequests.filter(request => {
        const leaveType = String(
            request.leave_type_name || ""
        ).toLowerCase();

        const reason = String(
            request.reason || ""
        ).toLowerCase();

        const matchesSearch =
            !search ||
            leaveType.includes(search) ||
            reason.includes(search);

        const matchesStatus =
            !status ||
            request.status === status;

        return matchesSearch && matchesStatus;
    });

    body.innerHTML = "";

    if (!filtered.length) {
        if (empty) {
            empty.classList.remove("hidden");
        }

        return;
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    filtered.forEach(request => {
        body.appendChild(
            createEmployeeLeaveRequestRow(request)
        );
    });
}


/* ==========================================================
   REQUEST ROW
========================================================== */

function createEmployeeLeaveRequestRow(request) {
    const row = document.createElement("tr");

    row.className =
        "hover:bg-gray-50 dark:hover:bg-gray-700/30 transition";

    const canCancel =
        request.status === "PENDING" ||
        request.status === "APPROVED";

    row.innerHTML = `
        <td class="px-5 py-4">
            <div class="font-medium text-gray-900 dark:text-white">
                ${escapeEmployeeLeaveHtml(
                    request.leave_type_name || "-"
                )}
            </div>
        </td>

        <td class="px-5 py-4 text-gray-600 dark:text-gray-300">
            <div>
                ${formatEmployeeLeaveDate(request.start_date)}
            </div>

            <div class="text-xs text-gray-400">
                to ${formatEmployeeLeaveDate(request.end_date)}
            </div>
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${escapeEmployeeLeaveHtml(
                String(request.total_days ?? 0)
            )}
        </td>

        <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
            ${formatEmployeeDayType(request.day_type)}
        </td>

        <td class="px-5 py-4">
            <span class="${getEmployeeLeaveStatusClass(request.status)}">
                ${formatEmployeeLeaveStatus(request.status)}
            </span>
        </td>

        <td class="px-5 py-4">
            <div class="flex justify-end gap-2">
                <button
                    type="button"
                    class="view-employee-leave-btn px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                    View
                </button>

                ${
                    canCancel
                        ? `
                            <button
                                type="button"
                                class="cancel-employee-leave-btn px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                                Cancel
                            </button>
                        `
                        : ""
                }
            </div>
        </td>
    `;

    const viewButton = row.querySelector(
        ".view-employee-leave-btn"
    );

    if (viewButton) {
        viewButton.addEventListener(
            "click",
            () => openEmployeeLeaveViewModal(request)
        );
    }

    const cancelButton = row.querySelector(
        ".cancel-employee-leave-btn"
    );

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            () => cancelEmployeeLeaveRequest(request)
        );
    }

    return row;
}


/* ==========================================================
   OPEN APPLY MODAL
========================================================== */

function openEmployeeLeaveModal() {
    const modal = document.getElementById("employeeLeaveModal");
    const form = document.getElementById("employeeLeaveForm");

    if (!modal) {
        return;
    }

    if (form) {
        form.reset();
    }

    clearEmployeeLeaveErrors();
    populateEmployeeLeaveTypes();
    hideEmployeeLeaveBalancePreview();

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    const start = document.getElementById(
        "employeeLeaveStartDate"
    );

    if (start) {
        setTimeout(() => start.focus(), 100);
    }
}


/* ==========================================================
   CLOSE APPLY MODAL
========================================================== */

function closeEmployeeLeaveModal() {
    const modal = document.getElementById("employeeLeaveModal");

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    document.body.classList.remove("overflow-hidden");
}


/* ==========================================================
   SUBMIT LEAVE
========================================================== */

async function handleEmployeeLeaveSubmit(event) {
    event.preventDefault();

    if (!validateEmployeeLeaveForm()) {
        return;
    }

    const leaveType = document.getElementById(
        "employeeLeaveType"
    ).value;

    const startDate = document.getElementById(
        "employeeLeaveStartDate"
    ).value;

    const endDate = document.getElementById(
        "employeeLeaveEndDate"
    ).value;

    const dayType = document.getElementById(
        "employeeLeaveDayType"
    ).value;

    const reason = document.getElementById(
        "employeeLeaveReason"
    ).value.trim();

    const payload = {
        leave_type: Number(leaveType),
        start_date: startDate,
        end_date: endDate,
        day_type: dayType,
        reason: reason
    };

    console.log("Employee Leave Payload:", payload);

    const button = document.getElementById(
        "submitEmployeeLeaveBtn"
    );

    setEmployeeLeaveButtonLoading(
        button,
        true,
        "Submitting..."
    );

    try {
        await LeaveService.createLeaveRequest(payload);

        showEmployeeLeaveAlert(
            "Leave request submitted successfully.",
            "success"
        );

        closeEmployeeLeaveModal();

        await Promise.all([
            loadEmployeeLeaveBalances(),
            loadEmployeeLeaveRequests()
        ]);

    } catch (error) {
        console.error("Leave request error:", error);

        showEmployeeLeaveAlert(
            getEmployeeLeaveError(
                error,
                "Failed to submit leave request."
            ),
            "error"
        );

    } finally {
        setEmployeeLeaveButtonLoading(
            button,
            false,
            "Submit Leave"
        );
    }
}


/* ==========================================================
   VALIDATION
========================================================== */

function validateEmployeeLeaveForm() {
    clearEmployeeLeaveErrors();

    const type = document.getElementById(
        "employeeLeaveType"
    ).value;

    const start = document.getElementById(
        "employeeLeaveStartDate"
    ).value;

    const end = document.getElementById(
        "employeeLeaveEndDate"
    ).value;

    const dayType = document.getElementById(
        "employeeLeaveDayType"
    ).value;

    const reason = document.getElementById(
        "employeeLeaveReason"
    ).value.trim();

    let valid = true;

    if (!type) {
        showEmployeeLeaveFieldError(
            "employeeLeaveTypeError",
            "Leave type is required."
        );

        valid = false;
    }

    if (!start) {
        showEmployeeLeaveFieldError(
            "employeeLeaveStartDateError",
            "Start date is required."
        );

        valid = false;
    }

    if (!end) {
        showEmployeeLeaveFieldError(
            "employeeLeaveEndDateError",
            "End date is required."
        );

        valid = false;
    }

    if (start && end && start > end) {
        showEmployeeLeaveFieldError(
            "employeeLeaveEndDateError",
            "End date must be greater than or equal to start date."
        );

        valid = false;
    }

    if (!dayType) {
        showEmployeeLeaveFieldError(
            "employeeLeaveDayTypeError",
            "Day type is required."
        );

        valid = false;
    }

    if (!reason) {
        showEmployeeLeaveFieldError(
            "employeeLeaveReasonError",
            "Reason is required."
        );

        valid = false;
    }

    return valid;
}


/* ==========================================================
   BALANCE PREVIEW
========================================================== */

function updateEmployeeLeaveBalancePreview() {
    const typeSelect = document.getElementById(
        "employeeLeaveType"
    );

    const startInput = document.getElementById(
        "employeeLeaveStartDate"
    );

    const endInput = document.getElementById(
        "employeeLeaveEndDate"
    );

    const dayTypeSelect = document.getElementById(
        "employeeLeaveDayType"
    );

    const preview = document.getElementById(
        "employeeLeaveBalancePreview"
    );

    const availableElement = document.getElementById(
        "employeeLeaveAvailableDays"
    );

    if (
        !typeSelect ||
        !preview ||
        !availableElement
    ) {
        return;
    }

    const leaveTypeId = typeSelect.value;
    const startDate = startInput?.value;
    const endDate = endInput?.value;
    const dayType = dayTypeSelect?.value || "FULL_DAY";

    if (!leaveTypeId) {
        hideEmployeeLeaveBalancePreview();
        return;
    }

    const selectedBalance = findEmployeeLeaveBalance(
        leaveTypeId,
        startDate
    );

    if (!selectedBalance) {
        hideEmployeeLeaveBalancePreview();
        return;
    }

    const remaining = Number(
        selectedBalance.remaining_days ?? 0
    );

    availableElement.textContent =
        `${remaining} day${remaining === 1 ? "" : "s"}`;

    preview.classList.remove("hidden");

    if (
        startDate &&
        endDate &&
        startDate <= endDate
    ) {
        const requestedDays =
            calculateEmployeeLeaveDays(
                startDate,
                endDate,
                dayType
            );

        const warning = preview.querySelector(
            ".employee-leave-balance-warning"
        );

        if (warning) {
            warning.remove();
        }

        if (requestedDays > remaining) {
            const warningElement =
                document.createElement("div");

            warningElement.className =
                "employee-leave-balance-warning text-xs text-red-600 dark:text-red-400 mt-2";

            warningElement.textContent =
                `Requested ${requestedDays} day${requestedDays === 1 ? "" : "s"}, but only ${remaining} day${remaining === 1 ? "" : "s"} available.`;

            preview.appendChild(warningElement);
        }
    }
}


/* ==========================================================
   FIND BALANCE
========================================================== */

function findEmployeeLeaveBalance(
    leaveTypeId,
    date = null
) {
    const year = date
        ? new Date(`${date}T00:00:00`).getFullYear()
        : new Date().getFullYear();

    return employeeLeaveBalances.find(balance => {
        const balanceTypeId =
            balance.leave_type ??
            balance.leave_type_id;

        const sameType =
            String(balanceTypeId) === String(leaveTypeId);

        const sameYear =
            !balance.year ||
            Number(balance.year) === Number(year);

        return sameType && sameYear;
    });
}


/* ==========================================================
   CALCULATE DAYS
========================================================== */

function calculateEmployeeLeaveDays(
    startDate,
    endDate,
    dayType = "FULL_DAY"
) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end < start
    ) {
        return 0;
    }

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const days =
        Math.floor(
            (end - start) /
            millisecondsPerDay
        ) + 1;

    if (dayType === "HALF_DAY") {
        return 0.5;
    }

    return days;
}


/* ==========================================================
   HIDE BALANCE PREVIEW
========================================================== */

function hideEmployeeLeaveBalancePreview() {
    const preview = document.getElementById(
        "employeeLeaveBalancePreview"
    );

    if (!preview) {
        return;
    }

    preview.classList.add("hidden");

    const warning = preview.querySelector(
        ".employee-leave-balance-warning"
    );

    if (warning) {
        warning.remove();
    }
}


/* ==========================================================
   VIEW REQUEST
========================================================== */

function openEmployeeLeaveViewModal(request) {
    selectedEmployeeLeaveRequest = request;

    const modal = document.getElementById(
        "employeeLeaveViewModal"
    );

    const content = document.getElementById(
        "employeeLeaveViewContent"
    );

    if (!modal || !content) {
        return;
    }

    content.innerHTML = `
        <div class="space-y-5">

            <div class="flex items-center justify-between gap-4">
                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                        ${escapeEmployeeLeaveHtml(
                            request.leave_type_name || "-"
                        )}
                    </h3>

                    <p class="text-sm text-gray-500 mt-1">
                        ${formatEmployeeLeaveDate(request.start_date)}
                        -
                        ${formatEmployeeLeaveDate(request.end_date)}
                    </p>
                </div>

                <span class="${getEmployeeLeaveStatusClass(request.status)}">
                    ${formatEmployeeLeaveStatus(request.status)}
                </span>
            </div>


            <div class="grid grid-cols-2 gap-4">

                <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div class="text-xs text-gray-500">
                        Total Days
                    </div>

                    <div class="font-semibold text-gray-900 dark:text-white mt-1">
                        ${escapeEmployeeLeaveHtml(
                            String(request.total_days ?? 0)
                        )}
                    </div>
                </div>


                <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div class="text-xs text-gray-500">
                        Day Type
                    </div>

                    <div class="font-semibold text-gray-900 dark:text-white mt-1">
                        ${formatEmployeeDayType(
                            request.day_type
                        )}
                    </div>
                </div>

            </div>


            <div>
                <div class="text-xs text-gray-500 mb-1">
                    Reason
                </div>

                <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                    ${escapeEmployeeLeaveHtml(
                        request.reason || "-"
                    )}
                </div>
            </div>


            ${
                request.rejection_reason
                    ? `
                        <div>
                            <div class="text-xs text-red-500 mb-1">
                                Rejection Reason
                            </div>

                            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
                                ${escapeEmployeeLeaveHtml(
                                    request.rejection_reason
                                )}
                            </div>
                        </div>
                    `
                    : ""
            }


            ${
                request.reviewed_by
                    ? `
                        <div class="text-sm text-gray-500">
                            Reviewed by:
                            <span class="font-medium text-gray-700 dark:text-gray-300">
                                ${escapeEmployeeLeaveHtml(
                                    request.reviewed_by
                                )}
                            </span>
                        </div>
                    `
                    : ""
            }


            ${
                Array.isArray(request.approval_history) &&
                request.approval_history.length
                    ? createEmployeeApprovalHistory(
                        request.approval_history
                    )
                    : ""
            }

        </div>
    `;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}


/* ==========================================================
   APPROVAL HISTORY
========================================================== */

function createEmployeeApprovalHistory(history) {
    return `
        <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Approval History
            </div>

            <div class="space-y-3">
                ${history.map(item => `
                    <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700">

                        <div class="flex justify-between gap-3">
                            <div class="font-medium text-gray-800 dark:text-gray-200">
                                ${escapeEmployeeLeaveHtml(
                                    item.approver_name || "-"
                                )}
                            </div>

                            <span class="text-xs font-medium">
                                ${escapeEmployeeLeaveHtml(
                                    item.action || "-"
                                )}
                            </span>
                        </div>

                        ${
                            item.comment
                                ? `
                                    <p class="text-sm text-gray-500 mt-1">
                                        ${escapeEmployeeLeaveHtml(
                                            item.comment
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>
                `).join("")}
            </div>
        </div>
    `;
}


/* ==========================================================
   CLOSE VIEW MODAL
========================================================== */

function closeEmployeeLeaveViewModal() {
    const modal = document.getElementById(
        "employeeLeaveViewModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    selectedEmployeeLeaveRequest = null;
}


/* ==========================================================
   CANCEL REQUEST
========================================================== */

async function cancelEmployeeLeaveRequest(request) {
    if (!request?.id) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to cancel this leave request?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await LeaveService.cancelLeave(request.id);

        showEmployeeLeaveAlert(
            "Leave request cancelled successfully.",
            "success"
        );

        await Promise.all([
            loadEmployeeLeaveBalances(),
            loadEmployeeLeaveRequests()
        ]);

    } catch (error) {
        console.error(
            "Cancel leave request error:",
            error
        );

        showEmployeeLeaveAlert(
            getEmployeeLeaveError(
                error,
                "Failed to cancel leave request."
            ),
            "error"
        );
    }
}


/* ==========================================================
   STATUS CLASS
========================================================== */

function getEmployeeLeaveStatusClass(status) {
    const base =
        "inline-flex px-2.5 py-1 rounded-full text-xs font-medium";

    switch (status) {
        case "PENDING":
            return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`;

        case "APPROVED":
            return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;

        case "REJECTED":
            return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;

        case "CANCELLED":
            return `${base} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;

        default:
            return `${base} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
    }
}


/* ==========================================================
   STATUS LABEL
========================================================== */

function formatEmployeeLeaveStatus(status) {
    if (!status) {
        return "-";
    }

    return String(status)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}


/* ==========================================================
   DAY TYPE
========================================================== */

function formatEmployeeDayType(type) {
    if (type === "FULL_DAY") {
        return "Full Day";
    }

    if (type === "HALF_DAY") {
        return "Half Day";
    }

    return type || "-";
}


/* ==========================================================
   DATE
========================================================== */

function formatEmployeeLeaveDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ==========================================================
   FIELD ERROR
========================================================== */

function showEmployeeLeaveFieldError(id, message) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("hidden");
}


/* ==========================================================
   CLEAR ERRORS
========================================================== */

function clearEmployeeLeaveErrors() {
    [
        "employeeLeaveTypeError",
        "employeeLeaveStartDateError",
        "employeeLeaveEndDateError",
        "employeeLeaveDayTypeError",
        "employeeLeaveReasonError"
    ].forEach(id => {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        element.textContent = "";
        element.classList.add("hidden");
    });
}


/* ==========================================================
   BUTTON LOADING
========================================================== */

function setEmployeeLeaveButtonLoading(
    button,
    loading,
    text
) {
    if (!button) {
        return;
    }

    if (loading) {
        button.disabled = true;

        button.innerHTML = `
            <span class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ${escapeEmployeeLeaveHtml(text)}
            </span>
        `;

        return;
    }

    button.disabled = false;
    button.textContent = text;
}


/* ==========================================================
   ALERT
========================================================== */

function showEmployeeLeaveAlert(
    message,
    type = "error"
) {
    const wrapper = document.getElementById(
        "employeeLeaveAlert"
    );

    const box = document.getElementById(
        "employeeLeaveAlertInner"
    );

    if (!wrapper || !box) {
        console[
            type === "error"
                ? "error"
                : "log"
        ](message);

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
        showEmployeeLeaveAlert.timeout
    );

    showEmployeeLeaveAlert.timeout =
        setTimeout(() => {
            wrapper.classList.add("hidden");
        }, 5000);
}


/* ==========================================================
   API ERROR
========================================================== */

function getEmployeeLeaveError(
    error,
    fallback = "Something went wrong."
) {
    if (!error) {
        return fallback;
    }

    const response = error.response || error;
    const data = response.data || response;

    if (typeof data === "string") {
        return data;
    }

    if (data?.detail) {
        return data.detail;
    }

    if (data?.message) {
        return data.message;
    }

    if (data && typeof data === "object") {
        const messages = [];

        Object.entries(data).forEach(([field, value]) => {
            if (Array.isArray(value)) {
                messages.push(
                    `${field}: ${value.join(", ")}`
                );

                return;
            }

            if (typeof value === "string") {
                messages.push(
                    `${field}: ${value}`
                );
            }
        });

        if (messages.length) {
            return messages.join(" | ");
        }
    }

    return error.message || fallback;
}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeEmployeeLeaveHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}