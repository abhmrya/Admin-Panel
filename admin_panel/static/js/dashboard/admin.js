/**
 * admin.js
 * Populates the Admin dashboard stat cards from the Dashboard Stats API.
 * Depends on: core/config.js, core/api.js, services/dashboard.service.js
 */

document.addEventListener("DOMContentLoaded", () => {
    if (!await Guard.auth()) return;
    loadAdminStats();
});

async function loadAdminStats() {
    try {
        const stats = await DashboardService.getStats();
        if (!stats) return;

        setStat("statUsersCount", stats.users_count);
        setStat("statAdminsCount", stats.admins_count);
        setStat("statHrCount", stats.hr_count);
        setStat("statManagersCount", stats.managers_count);
        setStat("statEmployeesCount", stats.employees_count);
    } catch (error) {
        console.error("Failed to load admin stats:", error);
    }
}

function setStat(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = value ?? "0";
}