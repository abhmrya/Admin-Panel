/**
 * ==========================================================
 * HR DASHBOARD
 * ==========================================================
 *
 * Dependencies:
 * - core/config.js
 * - core/api.js
 * - core/guard.js
 * - services/dashboard.service.js
 * - services/audit.service.js
 *
 * Responsibilities:
 * - HR statistics
 * - Workforce overview
 * - Recent audit activity
 * - Audit pagination
 * - Audit details modal
 * ==========================================================
 */


const HrDashboard = {

    state: {
        stats: null,

        audit: {
            items: [],
            total: 0,
            page: 1,
            pageSize: 5,
        },
    },


    async init() {

        if (!(await Guard.auth())) {
            return;
        }

        this.bindEvents();

        await Promise.allSettled([
            this.loadStats(),
            this.loadAuditActivity(),
        ]);

    },


    // ======================================================
    // EVENTS
    // ======================================================

    bindEvents() {

        const rowsPerPage = document.getElementById("rowsPerPage");

        if (rowsPerPage) {

            rowsPerPage.addEventListener("change", async (event) => {

                const pageSize = Number(event.target.value);

                this.state.audit.pageSize = pageSize;
                this.state.audit.page = 1;

                await this.loadAuditActivity();

            });

        }


        const previousButton = document.getElementById("prevPageBtn");

        if (previousButton) {

            previousButton.addEventListener("click", async () => {

                if (this.state.audit.page <= 1) {
                    return;
                }

                this.state.audit.page -= 1;

                await this.loadAuditActivity();

            });

        }


        const nextButton = document.getElementById("nextPageBtn");

        if (nextButton) {

            nextButton.addEventListener("click", async () => {

                const totalPages = this.getTotalAuditPages();

                if (this.state.audit.page >= totalPages) {
                    return;
                }

                this.state.audit.page += 1;

                await this.loadAuditActivity();

            });

        }


        const closeButton = document.getElementById("closeAuditBtn");

        if (closeButton) {

            closeButton.addEventListener("click", () => {
                this.closeAuditModal();
            });

        }


        const overlay = document.getElementById("auditOverlay");

        if (overlay) {

            overlay.addEventListener("click", () => {
                this.closeAuditModal();
            });

        }


        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                this.closeAuditModal();
            }

        });

    },


    // ======================================================
    // DASHBOARD STATS
    // ======================================================

    async loadStats() {

        try {

            const stats = await DashboardService.getStats();

            if (!stats) {
                return;
            }

            this.state.stats = stats;

            this.renderStats(stats);

        } catch (error) {

            console.error(
                "Failed to load HR dashboard statistics:",
                error
            );

            this.renderStatsError();

        }

    },


    renderStats(stats) {

        this.setStat(
            "statEmployeesCount",
            stats.employees_count
        );

        this.setStat(
            "statDepartmentsCount",
            stats.departments_count
        );

        this.setStat(
            "statOnLeaveCount",
            stats.on_leave_today
        );

        this.setStat(
            "statNewHiresCount",
            stats.new_hires_count
        );

        this.setStat(
            "statPendingLeaveCount",
            stats.pending_leave_requests
        );


        // Workforce overview

        this.setStat(
            "overviewEmployees",
            stats.employees_count
        );

        this.setStat(
            "overviewOnLeave",
            stats.on_leave_today
        );

        this.setStat(
            "overviewPendingLeaves",
            stats.pending_leave_requests
        );


        const overviewStatus =
            document.getElementById("employeeOverviewStatus");

        if (overviewStatus) {

            overviewStatus.textContent = "Live";

            overviewStatus.classList.remove(
                "bg-slate-100",
                "text-slate-500"
            );

            overviewStatus.classList.add(
                "bg-emerald-100",
                "text-emerald-700"
            );

        }

    },


    renderStatsError() {

        const ids = [
            "statEmployeesCount",
            "statDepartmentsCount",
            "statOnLeaveCount",
            "statNewHiresCount",
            "statPendingLeaveCount",
            "overviewEmployees",
            "overviewOnLeave",
            "overviewPendingLeaves",
        ];

        ids.forEach((id) => {
            this.setStat(id, 0);
        });


        const overviewStatus =
            document.getElementById("employeeOverviewStatus");

        if (overviewStatus) {

            overviewStatus.textContent = "Unavailable";

            overviewStatus.classList.remove(
                "bg-slate-100",
                "text-slate-500"
            );

            overviewStatus.classList.add(
                "bg-red-100",
                "text-red-600"
            );

        }

    },


    setStat(elementId, value) {

        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent =
            value === null ||
            value === undefined
                ? "0"
                : value;

    },


    // ======================================================
    // AUDIT ACTIVITY
    // ======================================================

    async loadAuditActivity() {

        const tableBody =
            document.getElementById("recentActivityTable");

        if (!tableBody) {
            return;
        }


        this.renderAuditLoading();


        try {

            const endpoint = this.getAuditEndpoint();

            if (!endpoint) {

                this.renderAuditUnavailable();

                return;
            }


            const response = await Api.get(endpoint);


            const normalized =
                this.normalizeAuditResponse(response);


            this.state.audit.items =
                normalized.items;

            this.state.audit.total =
                normalized.total;


            this.renderAuditTable();

            this.renderPagination();

        } catch (error) {

            console.error(
                "Failed to load HR audit activity:",
                error
            );

            this.renderAuditError();

        }

    },


    /**
     * Resolve audit endpoint.
     *
     * Preferred:
     *
     * APP_CONFIG.ENDPOINTS.AUDIT_LOGS
     *
     * Fallback:
     *
     * APP_CONFIG.ENDPOINTS.AUDIT
     */

    getAuditEndpoint() {

        if (
            typeof APP_CONFIG !== "undefined" &&
            APP_CONFIG.ENDPOINTS
        ) {

            if (APP_CONFIG.ENDPOINTS.AUDIT_LOGS) {
                return APP_CONFIG.ENDPOINTS.AUDIT_LOGS;
            }

            if (APP_CONFIG.ENDPOINTS.AUDIT) {
                return APP_CONFIG.ENDPOINTS.AUDIT;
            }

        }

        return null;

    },


    // ======================================================
    // AUDIT RESPONSE NORMALIZATION
    // ======================================================

    normalizeAuditResponse(response) {

        if (!response) {

            return {
                items: [],
                total: 0,
            };

        }


        /*
         * DRF paginated response:
         *
         * {
         *     count: 10,
         *     next: "...",
         *     previous: null,
         *     results: [...]
         * }
         */

        if (Array.isArray(response.results)) {

            return {
                items: response.results,
                total: Number(response.count || response.results.length),
            };

        }


        /*
         * Plain array
         */

        if (Array.isArray(response)) {

            return {
                items: response,
                total: response.length,
            };

        }


        /*
         * Some APIs use:
         *
         * {
         *     data: [],
         *     count: 10
         * }
         */

        if (Array.isArray(response.data)) {

            return {
                items: response.data,
                total: Number(response.count || response.data.length),
            };

        }


        /*
         * Some APIs use:
         *
         * {
         *     items: [],
         *     total: 10
         * }
         */

        if (Array.isArray(response.items)) {

            return {
                items: response.items,
                total: Number(response.total || response.items.length),
            };

        }


        return {
            items: [],
            total: 0,
        };

    },


    // ======================================================
    // AUDIT TABLE
    // ======================================================

    renderAuditTable() {

        const tableBody =
            document.getElementById("recentActivityTable");

        if (!tableBody) {
            return;
        }


        const items =
            this.state.audit.items;


        if (!items.length) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-6 py-12 text-center text-sm text-slate-400"
                    >
                        No audit activity found.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            items
                .map((item, index) =>
                    this.renderAuditRow(item, index)
                )
                .join("");


        tableBody
            .querySelectorAll("[data-audit-index]")
            .forEach((button) => {

                button.addEventListener("click", () => {

                    const index =
                        Number(
                            button.dataset.auditIndex
                        );

                    const audit =
                        this.state.audit.items[index];

                    this.openAuditModal(audit);

                });

            });

    },


    renderAuditRow(item, index) {

        const user =
            this.getAuditUser(item);

        const action =
            this.getAuditAction(item);

        const resource =
            this.getAuditResource(item);

        const ipAddress =
            this.getAuditIp(item);

        const timestamp =
            this.getAuditTimestamp(item);


        return `
            <tr class="transition-colors hover:bg-slate-50">

                <td class="whitespace-nowrap px-6 py-4">

                    <div class="flex items-center gap-3">

                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600">
                            ${this.getInitials(user)}
                        </div>

                        <div class="min-w-0">

                            <p class="truncate text-xs font-semibold text-slate-800">
                                ${this.escapeHtml(user)}
                            </p>

                        </div>

                    </div>

                </td>


                <td class="whitespace-nowrap px-6 py-4">

                    <span class="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                        ${this.escapeHtml(action)}
                    </span>

                </td>


                <td class="whitespace-nowrap px-6 py-4">

                    <span class="text-xs font-medium text-slate-600">
                        ${this.escapeHtml(resource)}
                    </span>

                </td>


                <td class="whitespace-nowrap px-6 py-4">

                    <span class="font-mono text-[11px] text-slate-500">
                        ${this.escapeHtml(ipAddress)}
                    </span>

                </td>


                <td class="whitespace-nowrap px-6 py-4">

                    <span
                        class="text-xs font-medium text-slate-500"
                        title="${this.escapeHtml(timestamp)}"
                    >
                        ${this.formatDate(timestamp)}
                    </span>

                </td>


                <td class="px-6 py-4 text-center">

                    <button
                        type="button"
                        data-audit-index="${index}"
                        class="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-[11px] font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                    >
                        View
                    </button>

                </td>

            </tr>
        `;

    },


    // ======================================================
    // AUDIT MODAL
    // ======================================================

    openAuditModal(audit) {

        if (!audit) {
            return;
        }


        const modal =
            document.getElementById("auditModal");

        if (!modal) {
            return;
        }


        this.setModalValue(
            "auditModalUser",
            this.getAuditUser(audit)
        );

        this.setModalValue(
            "auditModalAction",
            this.getAuditAction(audit)
        );

        this.setModalValue(
            "auditModalResource",
            this.getAuditResource(audit)
        );


        const tableBody =
            document.getElementById("auditTableBody");

        const noChanges =
            document.getElementById("auditNoChanges");


        if (tableBody) {
            tableBody.innerHTML = "";
        }

        if (noChanges) {
            noChanges.classList.add("hidden");
        }


        const changes =
            this.getAuditChanges(audit);


        if (!changes.length) {

            if (noChanges) {
                noChanges.classList.remove("hidden");
            }

        } else {

            if (tableBody) {

                tableBody.innerHTML =
                    changes
                        .map((change) =>
                            this.renderAuditChange(change)
                        )
                        .join("");

            }

        }


        modal.classList.remove("hidden");
        modal.classList.add("flex");

        document.body.classList.add("overflow-hidden");

    },


    closeAuditModal() {

        const modal =
            document.getElementById("auditModal");

        if (!modal) {
            return;
        }


        modal.classList.add("hidden");
        modal.classList.remove("flex");

        document.body.classList.remove("overflow-hidden");

    },


    renderAuditChange(change) {

        const field =
            change.field ||
            change.property ||
            change.name ||
            "Unknown";


        const oldValue =
            change.old_value ??
            change.old ??
            change.previous ??
            "";


        const newValue =
            change.new_value ??
            change.new ??
            change.current ??
            "";


        return `
            <tr>

                <td class="px-5 py-4 font-semibold text-slate-700">
                    ${this.escapeHtml(field)}
                </td>

                <td class="px-5 py-4">

                    <div class="rounded-xl bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                        ${this.formatValue(oldValue)}
                    </div>

                </td>

                <td class="px-5 py-4">

                    <div class="rounded-xl bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-700">
                        ${this.formatValue(newValue)}
                    </div>

                </td>

            </tr>
        `;

    },


    getAuditChanges(audit) {

        if (!audit) {
            return [];
        }


        /*
         * Preferred structure:
         *
         * changes: [
         *     {
         *         field: "status",
         *         old_value: "PENDING",
         *         new_value: "APPROVED"
         *     }
         * ]
         */

        if (Array.isArray(audit.changes)) {
            return audit.changes;
        }


        /*
         * Alternative:
         *
         * details: {
         *     changes: [...]
         * }
         */

        if (
            audit.details &&
            Array.isArray(audit.details.changes)
        ) {

            return audit.details.changes;

        }


        /*
         * old_values / new_values
         */

        if (
            audit.old_values &&
            audit.new_values
        ) {

            const fields =
                new Set([
                    ...Object.keys(audit.old_values),
                    ...Object.keys(audit.new_values),
                ]);


            return Array.from(fields).map((field) => {

                return {
                    field: field,
                    old_value: audit.old_values[field],
                    new_value: audit.new_values[field],
                };

            });

        }


        return [];

    },


    // ======================================================
    // PAGINATION
    // ======================================================

    getTotalAuditPages() {

        const total =
            this.state.audit.total;

        const pageSize =
            this.state.audit.pageSize;


        if (!total || !pageSize) {
            return 1;
        }


        return Math.max(
            1,
            Math.ceil(total / pageSize)
        );

    },


    renderPagination() {

        const total =
            this.state.audit.total;

        const page =
            this.state.audit.page;

        const pageSize =
            this.state.audit.pageSize;

        const totalPages =
            this.getTotalAuditPages();


        const paginationInfo =
            document.getElementById("paginationInfo");

        const pageNumber =
            document.getElementById("pageNumberDisplay");

        const previousButton =
            document.getElementById("prevPageBtn");

        const nextButton =
            document.getElementById("nextPageBtn");


        const start =
            total === 0
                ? 0
                : ((page - 1) * pageSize) + 1;


        const end =
            Math.min(
                page * pageSize,
                total
            );


        if (paginationInfo) {

            paginationInfo.textContent =
                `Showing ${start} to ${end} of ${total} entries`;

        }


        if (pageNumber) {

            pageNumber.textContent =
                `Page ${page} of ${totalPages}`;

        }


        if (previousButton) {
            previousButton.disabled =
                page <= 1;
        }


        if (nextButton) {
            nextButton.disabled =
                page >= totalPages;
        }

    },


    // ======================================================
    // AUDIT UI STATES
    // ======================================================

    renderAuditLoading() {

        const tableBody =
            document.getElementById("recentActivityTable");

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-6 py-12 text-center"
                >
                    <div class="flex items-center justify-center gap-3">

                        <div class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>

                        <span class="text-sm text-slate-400">
                            Loading audit activity...
                        </span>

                    </div>
                </td>
            </tr>
        `;

    },


    renderAuditUnavailable() {

        const tableBody =
            document.getElementById("recentActivityTable");

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-6 py-12 text-center"
                >
                    <p class="text-sm font-semibold text-slate-500">
                        Audit endpoint is not configured.
                    </p>

                    <p class="mt-1 text-xs text-slate-400">
                        Configure APP_CONFIG.ENDPOINTS.AUDIT_LOGS.
                    </p>
                </td>
            </tr>
        `;


        this.state.audit.items = [];
        this.state.audit.total = 0;

        this.renderPagination();

    },


    renderAuditError() {

        const tableBody =
            document.getElementById("recentActivityTable");

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-6 py-12 text-center"
                >
                    <p class="text-sm font-semibold text-red-500">
                        Failed to load audit activity.
                    </p>

                    <p class="mt-1 text-xs text-slate-400">
                        Please try again later.
                    </p>
                </td>
            </tr>
        `;


        this.state.audit.items = [];
        this.state.audit.total = 0;

        this.renderPagination();

    },


    // ======================================================
    // AUDIT FIELD HELPERS
    // ======================================================

    getAuditUser(item) {

        return (
            item.user_email ||
            item.user_username ||
            item.username ||
            item.user ||
            item.actor_email ||
            item.actor ||
            "System"
        );

    },


    getAuditAction(item) {

        return (
            item.action ||
            item.action_type ||
            item.event ||
            item.event_type ||
            "Unknown"
        );

    },


    getAuditResource(item) {

        return (
            item.resource ||
            item.resource_type ||
            item.model ||
            item.content_type ||
            "—"
        );

    },


    getAuditIp(item) {

        return (
            item.ip_address ||
            item.ip ||
            item.client_ip ||
            "—"
        );

    },


    getAuditTimestamp(item) {

        return (
            item.created_at ||
            item.timestamp ||
            item.occurred_at ||
            item.time ||
            ""
        );

    },


    // ======================================================
    // FORMATTING
    // ======================================================

    formatDate(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (Number.isNaN(date.getTime())) {
            return this.escapeHtml(String(value));
        }


        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );

    },


    formatValue(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }


        if (typeof value === "object") {

            try {

                return this.escapeHtml(
                    JSON.stringify(
                        value,
                        null,
                        2
                    )
                );

            } catch {
                return "[Object]";
            }

        }


        return this.escapeHtml(
            String(value)
        );

    },


    getInitials(value) {

        if (!value) {
            return "?";
        }


        const parts =
            String(value)
                .trim()
                .split(/\s+/)
                .slice(0, 2);


        return parts
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("");

    },


    setModalValue(elementId, value) {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }


        element.textContent =
            value || "—";

    },


    escapeHtml(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    },

};


// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        HrDashboard.init();

    }
);
