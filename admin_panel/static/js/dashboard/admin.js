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
 * Audit Modal (Super Compact & Clean UI with Forced Scroll)
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

    // Force strict layout restrictions with larger width and height
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.zIndex = "50";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.padding = "1rem";

    const modalContent = modal.querySelector(".bg-white") || modal.firstElementChild;
    if (modalContent) {
        modalContent.style.maxHeight = "90vh"; // Height thodi aur badha di
        modalContent.style.height = "650px";    // Fixed bada size
        modalContent.style.display = "flex";
        modalContent.style.flexDirection = "column";
        modalContent.style.overflow = "hidden";
        modalContent.style.width = "100%";
        modalContent.style.maxWidth = "48rem"; // Badi width (max-w-3xl equivalent)
        modalContent.style.borderRadius = "0.75rem";
        modalContent.style.backgroundColor = "#ffffff";
        modalContent.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
    }

    // Force table container wrapper to scroll internally
    const tableContainer = tableBody.closest("div") || tableBody.parentElement;
    if (tableContainer) {
        tableContainer.style.overflowY = "auto";
        tableContainer.style.flex = "1";
        tableContainer.style.maxHeight = "calc(90vh - 70px)";
    }

    tableBody.innerHTML = "";

    // 1. Base fields (Super compact rows)
    const baseFields = ["id", "actor_email", "action", "resource", "object_id", "ip_address", "request_method", "endpoint", "created_at"];
    
    baseFields.forEach(field => {
        if (log[field] !== undefined && log[field] !== null) {
            const row = document.createElement("tr");
            let val = log[field];
            if (typeof val === "object") val = JSON.stringify(val);

            row.innerHTML = `
                <td class="px-3.5 py-2 font-medium text-gray-600 text-xs capitalize bg-gray-50/60 w-1/3">${field.replace(/_/g, " ")}</td>
                <td class="px-3.5 py-2 text-gray-700 text-xs font-mono bg-white" colspan="2">${val}</td>
            `;
            tableBody.appendChild(row);
        }
    });

    // 2. Old and New values comparison breakdown
    let oldVals = log.old_values || {};
    let newVals = log.new_values || {};

    if (typeof oldVals === "string") { try { oldVals = JSON.parse(oldVals); } catch(e){} }
    if (typeof newVals === "string") { try { newVals = JSON.parse(newVals); } catch(e){} }

    const allKeys = [...new Set([...Object.keys(oldVals), ...Object.keys(newVals)])];

    if (allKeys.length > 0) {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <td colspan="3" class="px-3.5 py-2.5 bg-indigo-50 font-bold text-xs uppercase tracking-wider text-indigo-700">
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

            const oldStyleClass = isChanged 
                ? "text-red-700 bg-red-50/85 font-semibold border-l-2 border-red-500" 
                : "text-gray-500 bg-white";
                
            const newStyleClass = isChanged 
                ? "text-green-700 bg-green-50/85 font-semibold border-l-2 border-green-500" 
                : "text-gray-500 bg-white";

            row.innerHTML = `
                <td class="px-3.5 py-2 font-medium text-gray-700 text-xs capitalize bg-gray-50/30">↳ ${key.replace(/_/g, " ")}</td>
                <td class="px-3.5 py-2 text-xs font-mono ${oldStyleClass}">${oldFormatted}</td>
                <td class="px-3.5 py-2 text-xs font-mono ${newStyleClass}">${newFormatted}</td>
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
    modal.style.display = ""; // Reset inline style on close
}