console.log("EMPLOYEE ATTENDANCE JS LOADED");

let currentMonthDate = new Date();

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof Guard !== "undefined" && !(await Guard.auth())) return;
    initAttendanceControls();
    await loadMonthlyAttendance();
});

function initAttendanceControls() {
    document.getElementById("prevMonthBtn")?.addEventListener("click", async () => {
        currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
        await loadMonthlyAttendance();
    });

    document.getElementById("nextMonthBtn")?.addEventListener("click", async () => {
        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
        await loadMonthlyAttendance();
    });
}

async function loadMonthlyAttendance() {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth() + 1;

    updateMonthTitle();

    try {
        const endpoint = `${APP_CONFIG.ENDPOINTS.ATTENDANCE}?year=${year}&month=${month}`;
        const data = await Api.get(endpoint);
        const records = Array.isArray(data) ? data : data.results ?? [];

        renderSummary(records);
        renderAttendanceRecords(records);
    } catch (error) {
        console.error("Failed to load attendance:", error);
        renderError();
        Alerts.show(error.message || "Failed to load attendance.", "error");
    }
}

function renderSummary(records) {
    let present = 0, absent = 0, halfDay = 0, minutes = 0;

    records.forEach(record => {
        const status = String(record.status || "").toUpperCase();

        if (status === "PRESENT") present++;
        if (status === "ABSENT") absent++;
        if (status === "HALF_DAY") halfDay++;

        minutes += Number(record.working_minutes) || 0;
    });

    document.getElementById("totalDays").textContent = records.length;
    document.getElementById("presentDays").textContent = present;
    document.getElementById("absentDays").textContent = absent;
    document.getElementById("halfDays").textContent = halfDay;
    document.getElementById("workingHours").textContent = formatWorkingHours(minutes);
}

function renderAttendanceRecords(records) {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    if (!records.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-sm text-slate-500">No attendance records found for this month.</td></tr>`;
        return;
    }

    tbody.innerHTML = records.map(record => `
        <tr class="transition hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-800">${record.date || "-"}</td>
            <td class="px-6 py-4 text-slate-600">${formatDateTime(record.check_in)}</td>
            <td class="px-6 py-4 text-slate-600">${formatDateTime(record.check_out)}</td>
            <td class="px-6 py-4 font-medium text-slate-700">${formatWorkingHours(record.working_minutes)}</td>
            <td class="px-6 py-4 text-center">${getStatusBadge(record.status)}</td>
        </tr>
    `).join("");
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatWorkingHours(minutes) {
    minutes = Number(minutes) || 0;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getStatusBadge(status) {
    const badges = {
        PRESENT: "bg-emerald-100 text-emerald-700",
        ABSENT: "bg-red-100 text-red-700",
        HALF_DAY: "bg-amber-100 text-amber-700",
        ON_LEAVE: "bg-blue-100 text-blue-700"
    };

    const label = String(status || "Unknown").replace("_", " ");
    const classes = badges[String(status || "").toUpperCase()] || "bg-slate-100 text-slate-600";

    return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}">${label}</span>`;
}

function updateMonthTitle() {
    document.getElementById("currentMonth").textContent = currentMonthDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
}

function renderError() {
    const tbody = document.getElementById("attendanceTableBody");

    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-sm text-red-600">Failed to load attendance records.</td></tr>`;
    }
}