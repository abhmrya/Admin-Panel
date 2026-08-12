/**
 * ==========================================================
 * Admin Attendance Management
 * ==========================================================
 */

console.log("ADMIN ATTENDANCE JS LOADED");

let attendanceLogs = [];
let filteredAttendanceLogs = [];
let currentAttPage = 1;
const attRowsPerPage = 10;

let selectedReportEmployeeId = null;

/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof Guard !== "undefined" && !(await Guard.auth())) return;

    initAttendanceControls();
    initAttendanceModal();
    initMonthlyAttendanceModal();

    await loadAttendanceData();
});

/* ==========================================================
   LOAD ATTENDANCE
========================================================== */

async function loadAttendanceData() {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="11" class="py-10 text-center text-sm text-slate-500">
                Loading attendance records...
            </td>
        </tr>
    `;

    try {
        const endpoint = APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/";
        const data = await Api.get(endpoint);

        attendanceLogs = Array.isArray(data)
            ? data
            : (data.results || []);

        filteredAttendanceLogs = [...attendanceLogs];
        currentAttPage = 1;

        applyDateFilter(false);
    } catch (error) {
        console.error("Error loading attendance:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="py-10 text-center text-sm text-red-600">
                    Failed to load attendance records.
                </td>
            </tr>
        `;
    }
}

/* ==========================================================
   DATE FILTER
========================================================== */

function applyDateFilter(resetPage = true) {
    const filterDate = document.getElementById("filterDate");
    const selectedDate = filterDate?.value;

    filteredAttendanceLogs = selectedDate
        ? attendanceLogs.filter(record => record.date === selectedDate)
        : [...attendanceLogs];

    if (resetPage) currentAttPage = 1;

    renderAttendanceTable();
}

/* ==========================================================
   RENDER ATTENDANCE TABLE
========================================================== */

function renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (filteredAttendanceLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="py-10 text-center text-sm text-slate-500">
                    No attendance logs found.
                </td>
            </tr>
        `;

        updateAttendancePaginationUI(1);
        return;
    }

    const totalPages =
        Math.ceil(filteredAttendanceLogs.length / attRowsPerPage) || 1;

    if (currentAttPage > totalPages) currentAttPage = totalPages;
    if (currentAttPage < 1) currentAttPage = 1;

    const start = (currentAttPage - 1) * attRowsPerPage;
    const end = start + attRowsPerPage;
    const paginated = filteredAttendanceLogs.slice(start, end);

    paginated.forEach(record => {
        const row = document.createElement("tr");
        row.className = "transition hover:bg-slate-50";

        const employeeName = record.employee_name || "Unknown Employee";
        const employeeEmail = record.employee_email || "-";
        const id = record.id || "-";

        const employeeId =
            record.employee_id ||
            record.employee ||
            record.user_id ||
            "";

        const checkIn = formatDateTime(record.check_in);
        const checkOut = formatDateTime(record.check_out);

        const workingMinutes =
            Number(record.working_minutes || 0);

        const workingHours =
            record.working_hours ||
            formatMinutes(workingMinutes);

        const createdAt = formatDateTime(record.created_at);
        const updatedAt = formatDateTime(record.updated_at);

        const statusBadge = getStatusBadge(record.status);

        row.innerHTML = `
            <td class="px-5 py-4">
                <span
                    title="${escapeHtml(id)}"
                    class="font-mono text-[10px] text-slate-500"
                >
                    ${escapeHtml(shortenUUID(id))}
                </span>
            </td>

            <td class="px-5 py-4">
                <span class="font-semibold text-slate-700">
                    ${escapeHtml(employeeName)}
                </span>
            </td>

            <td class="px-5 py-4">
                <span class="text-xs text-slate-600">
                    ${escapeHtml(employeeEmail)}
                </span>
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                ${escapeHtml(record.date || "-")}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                ${checkIn}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                ${
                    record.check_out
                        ? checkOut
                        : `<span class="text-amber-600">Active</span>`
                }
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-center">
                <div class="font-semibold text-slate-700">
                    ${escapeHtml(workingHours)}
                </div>

                <div class="text-[10px] text-slate-400">
                    ${workingMinutes} min
                </div>
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-center">
                ${statusBadge}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                ${createdAt}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                ${updatedAt}
            </td>

            <td class="px-5 py-4 text-center">
                <div class="flex items-center justify-center gap-2 whitespace-nowrap">

                    <button
                        type="button"
                        class="viewMonthlyReportBtn inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md"
                        data-employee-id="${escapeHtml(employeeId)}"
                        data-employee-name="${escapeHtml(employeeName)}"
                        data-employee-email="${escapeHtml(employeeEmail)}"
                    >
                        📊 <span>Monthly</span>
                    </button>

                    <button
                        type="button"
                        class="editAttendanceBtn inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md"
                        data-id="${escapeHtml(id)}"
                    >
                        ✏️ <span>Edit</span>
                    </button>

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    attachEditButtons();
    attachMonthlyReportButtons();
    updateAttendancePaginationUI(totalPages);
}

/* ==========================================================
   STATUS BADGE
========================================================== */

function getStatusBadge(status) {
    const classes = {
        PRESENT: "bg-emerald-100 text-emerald-700",
        ABSENT: "bg-red-100 text-red-700",
        HALF_DAY: "bg-amber-100 text-amber-700",
        ON_LEAVE: "bg-indigo-100 text-indigo-700"
    };

    const labels = {
        PRESENT: "Present",
        ABSENT: "Absent",
        HALF_DAY: "Half Day",
        ON_LEAVE: "On Leave"
    };

    const className =
        classes[status] || "bg-slate-100 text-slate-700";

    const label =
        labels[status] || status || "Unknown";

    return `
        <span class="rounded-full px-2.5 py-1 text-xs font-semibold ${className}">
            ${escapeHtml(label)}
        </span>
    `;
}

/* ==========================================================
   PAGINATION CONTROLS
========================================================== */

function initAttendanceControls() {
    const prevBtn = document.getElementById("attPrevBtn");
    const nextBtn = document.getElementById("attNextBtn");
    const filterDate = document.getElementById("filterDate");
    const clearDateFilter = document.getElementById("clearDateFilter");
    const refreshBtn = document.getElementById("refreshAttendanceBtn");

    prevBtn?.addEventListener("click", () => {
        if (currentAttPage > 1) {
            currentAttPage--;
            renderAttendanceTable();
        }
    });

    nextBtn?.addEventListener("click", () => {
        const totalPages =
            Math.ceil(filteredAttendanceLogs.length / attRowsPerPage) || 1;

        if (currentAttPage < totalPages) {
            currentAttPage++;
            renderAttendanceTable();
        }
    });

    filterDate?.addEventListener("change", () => {
        applyDateFilter(true);
    });

    clearDateFilter?.addEventListener("click", () => {
        if (filterDate) filterDate.value = "";
        applyDateFilter(true);
    });

    refreshBtn?.addEventListener("click", async () => {
        await loadAttendanceData();
    });
}

/* ==========================================================
   PAGINATION UI
========================================================== */

function updateAttendancePaginationUI(totalPages) {
    const totalEntries = filteredAttendanceLogs.length;

    const startEntry =
        totalEntries === 0
            ? 0
            : ((currentAttPage - 1) * attRowsPerPage) + 1;

    const endEntry =
        Math.min(currentAttPage * attRowsPerPage, totalEntries);

    const infoEl =
        document.getElementById("attendancePaginationInfo");

    const displayEl =
        document.getElementById("attPageDisplay");

    const prevBtn =
        document.getElementById("attPrevBtn");

    const nextBtn =
        document.getElementById("attNextBtn");

    if (infoEl) {
        infoEl.textContent =
            `Showing ${startEntry} to ${endEntry} of ${totalEntries} entries`;
    }

    if (displayEl) {
        displayEl.textContent =
            `Page ${currentAttPage} of ${totalPages}`;
    }

    if (prevBtn) {
        prevBtn.disabled = currentAttPage === 1;
    }

    if (nextBtn) {
        nextBtn.disabled =
            currentAttPage >= totalPages;
    }
}

/* ==========================================================
   EDIT BUTTONS
========================================================== */

function attachEditButtons() {
    document.querySelectorAll(".editAttendanceBtn").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.id;

            const record = attendanceLogs.find(
                item => String(item.id) === String(id)
            );

            if (!record) {
                console.error(
                    "Attendance record not found:",
                    id
                );
                return;
            }

            openAttendanceEditModal(record);
        });
    });
}

/* ==========================================================
   EDIT MODAL INITIALIZATION
========================================================== */

function initAttendanceModal() {
    const modal =
        document.getElementById("attendanceEditModal");

    const overlay =
        document.getElementById("attendanceEditOverlay");

    const closeBtn =
        document.getElementById("closeAttendanceModal");

    const cancelBtn =
        document.getElementById("cancelAttendanceEdit");

    const form =
        document.getElementById("attendanceEditForm");

    closeBtn?.addEventListener(
        "click",
        closeAttendanceEditModal
    );

    cancelBtn?.addEventListener(
        "click",
        closeAttendanceEditModal
    );

    overlay?.addEventListener(
        "click",
        closeAttendanceEditModal
    );

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal &&
            !modal.classList.contains("hidden")
        ) {
            closeAttendanceEditModal();
        }
    });

    form?.addEventListener(
        "submit",
        handleAttendanceUpdate
    );
}

/* ==========================================================
   OPEN EDIT MODAL
========================================================== */

function openAttendanceEditModal(record) {
    const modal =
        document.getElementById("attendanceEditModal");

    if (!modal) return;

    document.getElementById("editAttendanceId").value =
        record.id || "";

    document.getElementById("editEmployeeName").value =
        record.employee_name || "";

    document.getElementById("editEmployeeEmail").value =
        record.employee_email || "";

    document.getElementById("editAttendanceDate").value =
        record.date || "";

    document.getElementById("editCheckIn").value =
        toDateTimeLocal(record.check_in);

    document.getElementById("editCheckOut").value =
        toDateTimeLocal(record.check_out);

    document.getElementById("editAttendanceStatus").value =
        record.status || "PRESENT";

    document.getElementById("editWorkingTime").textContent =
        record.working_hours ||
        formatMinutes(Number(record.working_minutes || 0));

    document.getElementById("editCreatedAt").value =
        formatDateTime(record.created_at);

    document.getElementById("editUpdatedAt").value =
        formatDateTime(record.updated_at);

    clearEditError();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

/* ==========================================================
   CLOSE EDIT MODAL
========================================================== */

function closeAttendanceEditModal() {
    const modal =
        document.getElementById("attendanceEditModal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    clearEditError();
}

/* ==========================================================
   UPDATE ATTENDANCE
========================================================== */

async function handleAttendanceUpdate(event) {
    event.preventDefault();

    const id =
        document.getElementById("editAttendanceId").value;

    const checkIn =
        document.getElementById("editCheckIn").value;

    const checkOut =
        document.getElementById("editCheckOut").value;

    const status =
        document.getElementById("editAttendanceStatus").value;

    const saveButton =
        document.getElementById("saveAttendanceEdit");

    clearEditError();

    if (
        checkIn &&
        checkOut &&
        new Date(checkOut) < new Date(checkIn)
    ) {
        showEditError(
            "Check-out time cannot be earlier than check-in time."
        );
        return;
    }

    const payload = {
        check_in: checkIn
            ? new Date(checkIn).toISOString()
            : null,

        check_out: checkOut
            ? new Date(checkOut).toISOString()
            : null,

        status
    };

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        const endpoint =
            (APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/") +
            `${id}/`;

        const response =
            await Api.patch(endpoint, payload);

        console.log(
            "Attendance updated:",
            response
        );

        closeAttendanceEditModal();
        await loadAttendanceData();
    } catch (error) {
        console.error(
            "Attendance update failed:",
            error
        );

        showEditError(
            extractApiError(error)
        );
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
    }
}

/* ==========================================================
   MONTHLY REPORT INITIALIZATION
========================================================== */

function initMonthlyAttendanceModal() {
    const modal =
        document.getElementById("monthlyAttendanceModal");

    const overlay =
        document.getElementById("monthlyAttendanceOverlay");

    const closeBtn =
        document.getElementById("closeMonthlyAttendanceModal");

    const loadBtn =
        document.getElementById("refreshMonthlyReport");

    closeBtn?.addEventListener(
        "click",
        closeMonthlyAttendanceModal
    );

    overlay?.addEventListener(
        "click",
        closeMonthlyAttendanceModal
    );

    loadBtn?.addEventListener(
        "click",
        async () => {
            await loadMonthlyAttendanceReport();
        }
    );

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal &&
            !modal.classList.contains("hidden")
        ) {
            closeMonthlyAttendanceModal();
        }
    });

    initializeMonthYearSelectors();
}

/* ==========================================================
   ATTACH MONTHLY REPORT BUTTONS
========================================================== */

function attachMonthlyReportButtons() {
    document
        .querySelectorAll(".viewMonthlyReportBtn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const employeeId =
                    button.dataset.employeeId;

                const employeeName =
                    button.dataset.employeeName ||
                    "Employee";

                const employeeEmail =
                    button.dataset.employeeEmail ||
                    "-";

                if (!employeeId) {
                    showGlobalMessage(
                        "Employee ID is missing from attendance record."
                    );
                    return;
                }

                openMonthlyAttendanceModal(
                    employeeId,
                    employeeName,
                    employeeEmail
                );
            });
        });
}

/* ==========================================================
   INITIALIZE MONTH/YEAR
========================================================== */

function initializeMonthYearSelectors() {
    const monthSelect =
        document.getElementById("monthlyReportMonth");

    const yearSelect =
        document.getElementById("monthlyReportYear");

    if (!monthSelect || !yearSelect) return;

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    monthSelect.innerHTML =
        months
            .map(
                (month, index) =>
                    `<option value="${index + 1}">${month}</option>`
            )
            .join("");

    const currentYear = new Date().getFullYear();

    let yearOptions = "";

    for (
        let year = currentYear - 2;
        year <= currentYear + 1;
        year++
    ) {
        yearOptions +=
            `<option value="${year}">${year}</option>`;
    }

    yearSelect.innerHTML = yearOptions;

    monthSelect.value =
        new Date().getMonth() + 1;

    yearSelect.value =
        currentYear;
}

/* ==========================================================
   OPEN MONTHLY REPORT
========================================================== */

function openMonthlyAttendanceModal(
    employeeId,
    employeeName,
    employeeEmail
) {
    const modal =
        document.getElementById(
            "monthlyAttendanceModal"
        );

    if (!modal) return;

    selectedReportEmployeeId =
        employeeId;

    document.getElementById(
        "monthlyReportEmployeeName"
    ).textContent =
        employeeName;

    document.getElementById(
        "monthlyReportEmployeeEmail"
    ).textContent =
        employeeEmail;

    clearMonthlyReportError();
    resetMonthlyReport();

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    loadMonthlyAttendanceReport();
}

/* ==========================================================
   CLOSE MONTHLY REPORT
========================================================== */

function closeMonthlyAttendanceModal() {
    const modal =
        document.getElementById(
            "monthlyAttendanceModal"
        );

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    selectedReportEmployeeId = null;

    clearMonthlyReportError();
}

/* ==========================================================
   LOAD MONTHLY REPORT
========================================================== */

async function loadMonthlyAttendanceReport() {
    if (!selectedReportEmployeeId) return;

    const month =
        document.getElementById(
            "monthlyReportMonth"
        )?.value;

    const year =
        document.getElementById(
            "monthlyReportYear"
        )?.value;

    if (!month || !year) return;

    const loading =
        document.getElementById(
            "monthlyReportLoading"
        );

    const content =
        document.getElementById(
            "monthlyReportContent"
        );

    clearMonthlyReportError();

    loading?.classList.remove("hidden");
    content?.classList.add("opacity-50");

    try {
        /*
         * Backend monthly report endpoint:
         *
         * GET /attendance/reports/monthly/
         *
         * Query:
         * employee_id
         * year
         * month
         */

        const baseEndpoint =
            APP_CONFIG.ENDPOINTS.ATTENDANCE_MONTHLY_REPORT ||
            "/attendance/reports/monthly/";

        const params =
            new URLSearchParams({
                employee_id: String(selectedReportEmployeeId),
                year: String(year),
                month: String(month)
            });

        const endpoint =
            `${baseEndpoint}?${params.toString()}`;

        console.log(
            "Monthly attendance request:",
            endpoint
        );

        const response =
            await Api.get(endpoint);

        console.log(
            "Monthly attendance response:",
            response
        );

        renderMonthlyAttendanceReport(response);
    } catch (error) {
        console.error(
            "Failed to load monthly attendance report:",
            error
        );

        showMonthlyReportError(
            extractApiError(error)
        );
    } finally {
        loading?.classList.add("hidden");
        content?.classList.remove("opacity-50");
    }
}

/* ==========================================================
   RENDER MONTHLY REPORT
========================================================== */

function renderMonthlyAttendanceReport(report) {
    if (!report) {
        showMonthlyReportError(
            "No monthly attendance report was returned."
        );
        return;
    }

    console.log(
        "Rendering monthly report:",
        report
    );

    /*
     * Backend response:
     *
     * {
     *     employee: {...},
     *     period: {...},
     *     summary: {
     *         present: ...,
     *         absent: ...,
     *         half_day: ...,
     *         on_leave: ...,
     *         total_working_minutes: ...,
     *         total_working_hours: ...
     *     },
     *     records: [...]
     * }
     */

    const summary =
        report.summary || {};

    const period =
        report.period || {};

    const records =
        Array.isArray(report.records)
            ? report.records
            : [];

    /* ======================================================
       SUMMARY
    ====================================================== */

    const presentDays =
        Number(summary.present || 0);

    const absentDays =
        Number(summary.absent || 0);

    const halfDays =
        Number(summary.half_day || 0);

    const leaveDays =
        Number(summary.on_leave || 0);

    const totalWorkingMinutes =
        Number(summary.total_working_minutes || 0);

    const totalWorkingHours =
        summary.total_working_hours ||
        formatMinutes(totalWorkingMinutes);

    /*
     * Prefer backend working_days if available.
     * Otherwise use records length.
     */

    const totalDays =
        Number(
            summary.working_days ??
            summary.total_days ??
            records.length
        );

    /*
     * Attendance rate.
     *
     * Prefer backend value if available.
     */

    let attendanceRate =
        Number(summary.attendance_rate);

    if (Number.isNaN(attendanceRate)) {
        attendanceRate =
            totalDays > 0
                ? (presentDays / totalDays) * 100
                : 0;
    }

    attendanceRate =
        Math.max(
            0,
            Math.min(
                100,
                attendanceRate
            )
        );

    /* ======================================================
       UPDATE EMPLOYEE INFORMATION
    ====================================================== */

    if (report.employee) {
        const employeeName =
            report.employee.name ||
            report.employee.full_name;

        const employeeEmail =
            report.employee.email;

        if (employeeName) {
            setText(
                "monthlyReportEmployeeName",
                employeeName
            );
        }

        if (employeeEmail) {
            setText(
                "monthlyReportEmployeeEmail",
                employeeEmail
            );
        }
    }

    /* ======================================================
       UPDATE PERIOD
    ====================================================== */

    if (period.year && period.month) {
        const monthName =
            getMonthName(
                Number(period.month)
            );

        const periodText =
            `${monthName} ${period.year}`;

        setText(
            "monthlyReportPeriod",
            periodText
        );
    }

    /* ======================================================
       SUMMARY CARDS
    ====================================================== */

    setText(
        "monthlyTotalDays",
        totalDays
    );

    setText(
        "monthlyPresentDays",
        presentDays
    );

    setText(
        "monthlyAbsentDays",
        absentDays
    );

    setText(
        "monthlyHalfDays",
        halfDays
    );

    setText(
        "monthlyLeaveDays",
        leaveDays
    );

    setText(
        "monthlyWorkingHours",
        totalWorkingHours
    );

    setText(
        "monthlyAttendanceRate",
        `${attendanceRate.toFixed(1)}%`
    );

    /* ======================================================
       ATTENDANCE PROGRESS
    ====================================================== */

    const progress =
        document.getElementById(
            "monthlyAttendanceProgress"
        );

    if (progress) {
        progress.style.width =
            `${attendanceRate}%`;
    }

    /* ======================================================
       DAILY RECORDS
    ====================================================== */

    renderMonthlyDailyRecords(records);
}

/* ==========================================================
   RENDER DAILY MONTHLY RECORDS
========================================================== */

function renderMonthlyDailyRecords(records) {
    const tbody =
        document.getElementById(
            "monthlyAttendanceTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="px-5 py-10 text-center text-sm text-slate-500"
                >
                    No attendance records found for this month.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(record => {
        const workingMinutes =
            Number(
                record.working_minutes || 0
            );

        const workingHours =
            record.working_hours ||
            formatMinutes(workingMinutes);

        const row =
            document.createElement("tr");

        row.className =
            "transition hover:bg-slate-50";

        row.innerHTML = `
            <td class="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                ${escapeHtml(
                    record.date || "-"
                )}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                ${formatDateTime(
                    record.check_in
                )}
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                ${
                    record.check_out
                        ? formatDateTime(
                            record.check_out
                        )
                        : `<span class="text-amber-600">Active</span>`
                }
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-center">
                <div class="font-semibold text-slate-700">
                    ${escapeHtml(
                        workingHours
                    )}
                </div>

                <div class="text-[10px] text-slate-400">
                    ${workingMinutes} min
                </div>
            </td>

            <td class="whitespace-nowrap px-5 py-4 text-center">
                ${getStatusBadge(
                    record.status
                )}
            </td>
        `;

        tbody.appendChild(row);
    });
}

/* ==========================================================
   RESET MONTHLY REPORT
========================================================== */

function resetMonthlyReport() {
    setText(
        "monthlyTotalDays",
        "0"
    );

    setText(
        "monthlyPresentDays",
        "0"
    );

    setText(
        "monthlyAbsentDays",
        "0"
    );

    setText(
        "monthlyHalfDays",
        "0"
    );

    setText(
        "monthlyLeaveDays",
        "0"
    );

    setText(
        "monthlyWorkingHours",
        "0h 0m"
    );

    setText(
        "monthlyAttendanceRate",
        "0%"
    );

    setText(
        "monthlyReportPeriod",
        ""
    );

    const progress =
        document.getElementById(
            "monthlyAttendanceProgress"
        );

    if (progress) {
        progress.style.width = "0%";
    }

    const tbody =
        document.getElementById(
            "monthlyAttendanceTableBody"
        );

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="px-5 py-10 text-center text-sm text-slate-500"
                >
                    Loading attendance report...
                </td>
            </tr>
        `;
    }
}

/* ==========================================================
   MONTHLY ERROR
========================================================== */

function showMonthlyReportError(message) {
    const errorBox =
        document.getElementById(
            "monthlyReportError"
        );

    if (!errorBox) return;

    errorBox.textContent =
        message ||
        "Failed to load monthly attendance report.";

    errorBox.classList.remove("hidden");
}

function clearMonthlyReportError() {
    const errorBox =
        document.getElementById(
            "monthlyReportError"
        );

    if (!errorBox) return;

    errorBox.textContent = "";
    errorBox.classList.add("hidden");
}

/* ==========================================================
   EDIT ERROR
========================================================== */

function showEditError(message) {
    const errorBox =
        document.getElementById(
            "attendanceEditError"
        );

    if (!errorBox) return;

    errorBox.textContent =
        message;

    errorBox.classList.remove("hidden");
}

function clearEditError() {
    const errorBox =
        document.getElementById(
            "attendanceEditError"
        );

    if (!errorBox) return;

    errorBox.textContent = "";
    errorBox.classList.add("hidden");
}

/* ==========================================================
   ERROR HANDLING
========================================================== */

function extractApiError(error) {
    if (error?.data?.detail) {
        return error.data.detail;
    }

    if (error?.response?.data?.detail) {
        return error.response.data.detail;
    }

    if (
        error?.data &&
        typeof error.data === "object"
    ) {
        const values =
            Object.values(error.data);

        if (values.length) {
            return values.flat().join(" ");
        }
    }

    if (
        error?.response?.data &&
        typeof error.response.data === "object"
    ) {
        const values =
            Object.values(error.response.data);

        if (values.length) {
            return values.flat().join(" ");
        }
    }

    return (
        error?.message ||
        "Request failed."
    );
}

/* ==========================================================
   GLOBAL MESSAGE
========================================================== */

function showGlobalMessage(message) {
    console.warn(message);
    alert(message);
}

/* ==========================================================
   FORMAT HELPERS
========================================================== */

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatMinutes(minutes) {
    minutes = Number(minutes) || 0;

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

function shortenUUID(value) {
    if (!value) return "-";

    const stringValue =
        String(value);

    if (stringValue.length <= 12) {
        return stringValue;
    }

    return (
        stringValue.slice(0, 8) +
        "..."
    );
}

function getMonthName(month) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return months[month - 1] || "";
}

/* ==========================================================
   TEXT HELPER
========================================================== */

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
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