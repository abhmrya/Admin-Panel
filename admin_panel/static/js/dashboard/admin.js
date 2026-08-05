/**
 * ==========================================================
 * Admin Dashboard
 * ==========================================================
 */

console.log("ADMIN JS LOADED");

let auditLogs = [];
let currentPage = 1;
let rowsPerPage = 5;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM READY");

    if (!(await Guard.auth())) {
        return;
    }

    initAuditModal();
    initPaginationControls();
    await loadAdminStats();
    await loadRecentActivity();
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
    } catch (err) {
        console.error(err);
    }
}

function setStat(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value ?? 0;
}

async function loadRecentActivity() {
    const tbody = document.getElementById("recentActivityTable");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-10 text-gray-500">
                Loading...
            </td>
        </tr>
    `;

    try {
        const data = await AuditService.getLogs();
        auditLogs = data.results ?? [];

        if (auditLogs.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-10 text-gray-500">
                    No audit logs found.
                </td>
            </tr>
            `;
            updatePaginationUI();
            return;
        }

        renderAuditTable();
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-red-600 py-10">
                Failed to load logs.
            </td>
        </tr>
        `;
    }
}

function getActionBadge(action) {
    const colors = {
        CREATE: "bg-green-100 text-green-700",
        UPDATE: "bg-blue-100 text-blue-700",
        DELETE: "bg-red-100 text-red-700",
        LOGIN: "bg-emerald-100 text-emerald-700",
        LOGOUT: "bg-gray-100 text-gray-700",
    };
    return colors[action] || "bg-indigo-100 text-indigo-700";
}

function renderAuditTable() {
    const tbody = document.getElementById("recentActivityTable");
    tbody.innerHTML = "";

    if (auditLogs.length === 0) {
        updatePaginationUI();
        return;
    }

    // Pagination calculations
    const totalPages = Math.ceil(auditLogs.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedLogs = auditLogs.slice(start, end);

    paginatedLogs.forEach((log, index) => {
        const actualIndex = start + index;
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 transition";

        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-800">${log.actor_email || "System"}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}">
                    ${log.action}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${log.resource}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${log.ip_address || "-"}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${new Date(log.created_at).toLocaleString()}</td>
            <td class="px-6 py-4 text-center">
                <button class="viewAuditBtn px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition" data-index="${actualIndex}">
                    View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach click events for View buttons
    document.querySelectorAll(".viewAuditBtn").forEach(button => {
        button.addEventListener("click", function () {
            const log = auditLogs[this.dataset.index];
            openAuditModal(log);
        });
    });

    updatePaginationUI();
}

function initPaginationControls() {
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    const rowsSelect = document.getElementById("rowsPerPage");

    prevBtn?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderAuditTable();
        }
    });

    nextBtn?.addEventListener("click", () => {
        const totalPages = Math.ceil(auditLogs.length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderAuditTable();
        }
    });

    rowsSelect?.addEventListener("change", (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderAuditTable();
    });
}

function updatePaginationUI() {
    const totalEntries = auditLogs.length;
    const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
    
    const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endEntry = Math.min(currentPage * rowsPerPage, totalEntries);

    document.getElementById("paginationInfo").textContent = `Showing ${startEntry} to ${endEntry} of ${totalEntries} entries`;
    document.getElementById("pageNumberDisplay").textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled = currentPage >= totalPages;
}

/**
 * ==========================================================
 * Audit Modal (Red for Old, Green for New Data Table)
 * ==========================================================
 *//**
 /**
 * ==========================================================
 * Audit Modal (Super Compact & Clean UI)
 * ==========================================================
 */

function initAuditModal() {
    const modal = document.getElementById("auditModal");
    const overlay = document.getElementById("auditOverlay");
    const closeBtn = document.getElementById("closeAuditBtn");

    closeBtn?.addEventListener("click", closeAuditModal);
    overlay?.addEventListener("click", closeAuditModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAuditModal();
        }
    });
}

function openAuditModal(log) {
    const modal = document.getElementById("auditModal");
    const tableBody = document.getElementById("auditTableBody");

    if (!modal || !tableBody) return;

    tableBody.innerHTML = "";

    // 1. Base fields (Super compact rows)
    const baseFields = ["id", "actor_email", "action", "resource", "object_id", "ip_address", "request_method", "endpoint", "created_at"];
    
    baseFields.forEach(field => {
        if (log[field] !== undefined && log[field] !== null) {
            const row = document.createElement("tr");
            let val = log[field];
            if (typeof val === "object") val = JSON.stringify(val);

            row.innerHTML = `
                <td class="px-2.5 py-1 font-medium text-gray-600 text-[11px] capitalize bg-gray-50/60 w-1/3">${field.replace(/_/g, " ")}</td>
                <td class="px-2.5 py-1 text-gray-700 text-[11px] font-mono bg-white" colspan="2">${val}</td>
            `;
            tableBody.appendChild(row);
        }
    });

    // 2. Old and New values comparison breakdown (Compact Red & Green highlighting)
    let oldVals = log.old_values || {};
    let newVals = log.new_values || {};

    if (typeof oldVals === "string") { try { oldVals = JSON.parse(oldVals); } catch(e){} }
    if (typeof newVals === "string") { try { newVals = JSON.parse(newVals); } catch(e){} }

    const allKeys = [...new Set([...Object.keys(oldVals), ...Object.keys(newVals)])];

    if (allKeys.length > 0) {
        // Section Header Row
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <td colspan="3" class="px-2.5 py-1.5 bg-indigo-50 font-bold text-[10px] uppercase tracking-wider text-indigo-700">
                Changed Properties Breakdown
            </td>
        `;
        tableBody.appendChild(headerRow);

        allKeys.forEach(key => {
            const oldVal = oldVals[key] !== undefined ? oldVals[key] : "-";
            const newVal = newVals[key] !== undefined ? newVals[key] : "-";

            const row = document.createElement("tr");
            const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

            const oldFormatted = typeof oldVal === "object" ? JSON.stringify(oldVal) : oldVal;
            const newFormatted = typeof newVal === "object" ? JSON.stringify(newVal) : newVal;

            // Compact Red and Green styling
            const oldStyleClass = isChanged 
                ? "text-red-700 bg-red-50/80 font-semibold border-l-2 border-red-500" 
                : "text-gray-500 bg-white";
                
            const newStyleClass = isChanged 
                ? "text-green-700 bg-green-50/80 font-semibold border-l-2 border-green-500" 
                : "text-gray-500 bg-white";

            row.innerHTML = `
                <td class="px-2.5 py-1 font-medium text-gray-700 text-[11px] capitalize bg-gray-50/30">↳ ${key.replace(/_/g, " ")}</td>
                <td class="px-2.5 py-1 text-[11px] font-mono ${oldStyleClass}">${oldFormatted}</td>
                <td class="px-2.5 py-1 text-[11px] font-mono ${newStyleClass}">${newFormatted}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    modal.classList.remove("hidden");
}

function closeAuditModal() {
    const modal = document.getElementById("auditModal");
    if (!modal) return;
    modal.classList.add("hidden");
}