/**
 * hr.js
 * Populates the HR dashboard stat cards.
 * Only "Total Employees" is backed by the real Dashboard Stats API right now.
 * The other cards (Departments, On Leave, New Hires) stay at "--" until
 * their backend endpoints exist — wire them up here once ready.
 * Depends on: core/config.js, core/api.js, services/dashboard.service.js
 */

document.addEventListener("DOMContentLoaded", () => {
        
    if (!await Guard.auth()) return;

    loadHrStats();
});

async function loadHrStats() {
    try {
        const stats = await DashboardService.getStats();
        if (!stats) return;

        setStat("statEmployeesCount", stats.employees_count);

        // TODO: replace with real data once these endpoints exist:
        // setStat("statDepartmentsCount", stats.departments_count);
        // setStat("statOnLeaveCount", stats.on_leave_count);
        // setStat("statNewHiresCount", stats.new_hires_count);
    } catch (error) {
        console.error("Failed to load HR stats:", error);
    }
}

function setStat(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value ?? "0";
}