/**
 * ==========================================================
 * Admin Leave Dashboard
 * ==========================================================
 */

console.log("ADMIN LEAVE DASHBOARD JS LOADED");


/* ==========================================================
   STATE
========================================================== */

let leaveDashboardData = null;


/* ==========================================================
   DOM
========================================================== */

const leaveDashboardYear = document.getElementById(
    "leaveDashboardYear"
);

const leavePendingCount = document.getElementById(
    "leavePendingCount"
);

const leaveApprovedCount = document.getElementById(
    "leaveApprovedCount"
);

const leaveRejectedCount = document.getElementById(
    "leaveRejectedCount"
);

const leaveCancelledCount = document.getElementById(
    "leaveCancelledCount"
);

const totalAllocatedDays = document.getElementById(
    "totalAllocatedDays"
);

const totalUsedDays = document.getElementById(
    "totalUsedDays"
);

const totalPendingDays = document.getElementById(
    "totalPendingDays"
);

const totalRemainingDays = document.getElementById(
    "totalRemainingDays"
);

const leaveTypeStatisticsTable = document.getElementById(
    "leaveTypeStatisticsTable"
);


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadLeaveDashboard();
    }
);


/* ==========================================================
   LOAD DASHBOARD
========================================================== */

async function loadLeaveDashboard() {

    try {

        setLoadingState();

        const response = await LeaveService.getDashboard();

        console.log(
            "Leave Dashboard Response:",
            response
        );

        leaveDashboardData = response;

        renderDashboard(response);

    } catch (error) {

        console.error(
            "Failed to load leave dashboard:",
            error
        );

        showDashboardError(error);
    }
}


/* ==========================================================
   RENDER DASHBOARD
========================================================== */

function renderDashboard(data) {

    const adminData = data?.admin;

    if (!adminData) {

        console.error(
            "Admin leave dashboard data not found:",
            data
        );

        showDashboardError();

        return;
    }

    renderYear(
        adminData.year
    );

    renderRequestCounts(
        adminData.request_counts
    );

    renderBalanceSummary(
        adminData.balance_summary
    );

    renderLeaveTypeStatistics(
        adminData.leave_type_statistics
    );
}


/* ==========================================================
   YEAR
========================================================== */

function renderYear(year) {

    if (!leaveDashboardYear) {
        return;
    }

    leaveDashboardYear.textContent =
        `Year ${year}`;
}


/* ==========================================================
   REQUEST COUNTS
========================================================== */

function renderRequestCounts(counts) {

    counts = counts || {};

    if (leavePendingCount) {
        leavePendingCount.textContent =
            counts.pending ?? 0;
    }

    if (leaveApprovedCount) {
        leaveApprovedCount.textContent =
            counts.approved ?? 0;
    }

    if (leaveRejectedCount) {
        leaveRejectedCount.textContent =
            counts.rejected ?? 0;
    }

    if (leaveCancelledCount) {
        leaveCancelledCount.textContent =
            counts.cancelled ?? 0;
    }
}


/* ==========================================================
   BALANCE SUMMARY
========================================================== */

function renderBalanceSummary(summary) {

    summary = summary || {};

    if (totalAllocatedDays) {
        totalAllocatedDays.textContent =
            formatDays(summary.total_allocated);
    }

    if (totalUsedDays) {
        totalUsedDays.textContent =
            formatDays(summary.total_used);
    }

    if (totalPendingDays) {
        totalPendingDays.textContent =
            formatDays(summary.total_pending);
    }

    if (totalRemainingDays) {
        totalRemainingDays.textContent =
            formatDays(summary.total_remaining);
    }
}


/* ==========================================================
   LEAVE TYPE STATISTICS
========================================================== */

function renderLeaveTypeStatistics(statistics) {

    if (!leaveTypeStatisticsTable) {
        return;
    }

    leaveTypeStatisticsTable.innerHTML = "";

    if (
        !statistics ||
        statistics.length === 0
    ) {

        leaveTypeStatisticsTable.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="px-6 py-10 text-center text-sm text-slate-400">
                    No leave statistics available.
                </td>
            </tr>
        `;

        return;
    }


    statistics.forEach(item => {

        const row = document.createElement("tr");

        row.className =
            "transition hover:bg-slate-50";

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-semibold text-slate-800">
                    ${escapeHtml(
                        item.leave_type_name || "-"
                    )}
                </div>
            </td>

            <td class="px-6 py-4">
                <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    ${escapeHtml(
                        item.leave_type_code || "-"
                    )}
                </span>
            </td>

            <td class="px-6 py-4 font-semibold text-slate-700">
                ${item.total_requests ?? 0}
            </td>

            <td class="px-6 py-4 font-semibold text-slate-700">
                ${formatDays(item.total_days)}
            </td>
        `;

        leaveTypeStatisticsTable.appendChild(
            row
        );
    });
}


/* ==========================================================
   LOADING STATE
========================================================== */

function setLoadingState() {

    const loadingElements = [
        leavePendingCount,
        leaveApprovedCount,
        leaveRejectedCount,
        leaveCancelledCount,
        totalAllocatedDays,
        totalUsedDays,
        totalPendingDays,
        totalRemainingDays,
    ];

    loadingElements.forEach(element => {

        if (element) {
            element.textContent = "...";
        }
    });

    if (leaveTypeStatisticsTable) {

        leaveTypeStatisticsTable.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="px-6 py-10 text-center text-sm text-slate-400">
                    Loading leave statistics...
                </td>
            </tr>
        `;
    }
}


/* ==========================================================
   ERROR STATE
========================================================== */

function showDashboardError(error = null) {

    const message =
        extractErrorMessage(error);

    if (leaveDashboardYear) {
        leaveDashboardYear.textContent =
            "Unavailable";
    }

    const elements = [
        leavePendingCount,
        leaveApprovedCount,
        leaveRejectedCount,
        leaveCancelledCount,
        totalAllocatedDays,
        totalUsedDays,
        totalPendingDays,
        totalRemainingDays,
    ];

    elements.forEach(element => {

        if (element) {
            element.textContent = "--";
        }
    });

    if (leaveTypeStatisticsTable) {

        leaveTypeStatisticsTable.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="px-6 py-10 text-center">

                    <div class="text-sm font-semibold text-red-500">
                        Failed to load leave dashboard.
                    </div>

                    <div class="mt-1 text-xs text-slate-400">
                        ${escapeHtml(message)}
                    </div>

                </td>
            </tr>
        `;
    }
}


/* ==========================================================
   ERROR MESSAGE
========================================================== */

function extractErrorMessage(error) {

    if (!error) {
        return "Please try again.";
    }

    if (typeof error === "string") {
        return error;
    }

    if (error.message) {
        return error.message;
    }

    if (error.response?.data) {

        const data = error.response.data;

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }
    }

    return "Unable to load dashboard.";
}


/* ==========================================================
   FORMAT DAYS
========================================================== */

function formatDays(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "0";
    }

    return Number.isInteger(number)
        ? String(number)
        : number.toFixed(2);
}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}