/**
 * ==========================================================
 * Employee Leave History
 * ==========================================================
 */

console.log("EMPLOYEE LEAVE HISTORY JS LOADED");

const EmployeeLeaveHistory = {
    history: [],

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadHistory();
        console.log("Employee Leave History initialized.");
    },

    cacheElements() {
        this.tableBody = document.getElementById("history-table-body");
        this.loading = document.getElementById("history-loading");
        this.empty = document.getElementById("history-empty");
        this.error = document.getElementById("history-error");
        this.status = document.getElementById("history-status");
        this.startDate = document.getElementById("history-start-date");
        this.endDate = document.getElementById("history-end-date");
        this.filterBtn = document.getElementById("history-filter-btn");
        this.resetBtn = document.getElementById("history-reset-btn");
        this.modal = document.getElementById("history-modal");
        this.modalContent = document.getElementById("history-modal-content");
        this.modalClose = document.getElementById("history-modal-close");
        this.modalOverlay = document.getElementById("history-modal-overlay");
    },

    bindEvents() {
        this.filterBtn.addEventListener("click", () => this.loadHistory());
        this.resetBtn.addEventListener("click", () => this.resetFilters());
        this.modalClose.addEventListener("click", () => this.closeModal());
        this.modalOverlay.addEventListener("click", () => this.closeModal());
    },

    async loadHistory() {
        try {
            this.showLoading();
            this.hideError();

            const response = await LeaveService.getHistory(
                this.buildQueryParams()
            );

            this.history = Array.isArray(response)
                ? response
                : response.results || [];

            this.render();
        } catch (error) {
            console.error("Failed to load leave history:", error);
            this.showError(error?.message || "Failed to load leave history.");
            this.history = [];
            this.render();
        } finally {
            this.hideLoading();
        }
    },

    buildQueryParams() {
        const params = new URLSearchParams();

        if (this.status.value) params.append("status", this.status.value);
        if (this.startDate.value) params.append("start_date", this.startDate.value);
        if (this.endDate.value) params.append("end_date", this.endDate.value);

        const query = params.toString();
        return query ? `?${query}` : "";
    },

    render() {
        this.tableBody.innerHTML = "";

        if (!this.history.length) {
            this.showEmpty();
            return;
        }

        this.hideEmpty();
        this.history.forEach(leave => this.renderRow(leave));
    },

    renderRow(leave) {
        const row = document.createElement("tr");

        row.className = "hover:bg-gray-50 transition";

        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                    ${this.escapeHtml(leave.leave_type_name)}
                </div>
                <div class="text-xs text-gray-400">
                    ${this.escapeHtml(leave.day_type || "")}
                </div>
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                ${this.formatDate(leave.start_date)}
                -
                ${this.formatDate(leave.end_date)}
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                ${leave.total_days}
            </td>

            <td class="px-4 py-3 max-w-[180px]">
                <div
                    class="truncate text-sm text-gray-700"
                    title="${this.escapeHtml(leave.reason || "")}"
                >
                    ${this.escapeHtml(leave.reason || "-")}
                </div>
            </td>

            <td class="px-4 py-3 whitespace-nowrap">
                ${this.getStatusBadge(leave.status)}
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                ${leave.reviewed_at ? this.formatDateTime(leave.reviewed_at) : "-"}
            </td>

            <td class="px-4 py-3 whitespace-nowrap text-right">
                <button
                    type="button"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    data-history-id="${leave.id}"
                >
                    View
                </button>
            </td>
        `;

        row.querySelector("[data-history-id]").addEventListener(
            "click",
            () => this.openModal(leave.id)
        );

        this.tableBody.appendChild(row);
    },

    getStatusBadge(status) {
        const badges = {
            APPROVED: "bg-green-100 text-green-700",
            REJECTED: "bg-red-100 text-red-700",
            CANCELLED: "bg-gray-100 text-gray-700",
        };

        const labels = {
            APPROVED: "Approved",
            REJECTED: "Rejected",
            CANCELLED: "Cancelled",
        };

        return `
            <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium
                ${badges[status] || "bg-yellow-100 text-yellow-700"}">
                ${labels[status] || status || "Unknown"}
            </span>
        `;
    },

    openModal(id) {
        const leave = this.history.find(item => item.id === id);
        if (!leave) return;

        this.modalContent.innerHTML = this.getModalContent(leave);
        this.modal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
    },

    getModalContent(leave) {
        const approvalHtml = leave.approvals?.length
            ? leave.approvals.map(approval => `
                <div class="rounded-lg border border-gray-200 p-3">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="text-sm font-medium text-gray-900">
                                ${this.escapeHtml(approval.approver_name || "-")}
                            </p>
                            <p class="text-xs text-gray-500">
                                ${this.escapeHtml(approval.approver_email || "-")}
                            </p>
                        </div>

                        ${this.getStatusBadge(approval.action)}
                    </div>

                    <p class="mt-2 text-sm text-gray-700">
                        ${this.escapeHtml(approval.comment || "No comment")}
                    </p>

                    <p class="mt-1 text-xs text-gray-400">
                        ${this.formatDateTime(approval.created_at)}
                    </p>
                </div>
            `).join("")
            : `<p class="text-sm text-gray-500">No approval records found.</p>`;

        return `
            <div class="space-y-5">

                <div class="flex items-center justify-between gap-3">
                    <div>
                        <p class="text-xs uppercase text-gray-400">
                            Leave Type
                        </p>
                        <p class="mt-1 text-lg font-semibold text-gray-900">
                            ${this.escapeHtml(leave.leave_type_name)}
                        </p>
                    </div>

                    ${this.getStatusBadge(leave.status)}
                </div>

                <div class="grid grid-cols-2 gap-3">
                    ${this.detailItem("Start Date", this.formatDate(leave.start_date))}
                    ${this.detailItem("End Date", this.formatDate(leave.end_date))}
                    ${this.detailItem("Total Days", leave.total_days)}
                    ${this.detailItem("Day Type", leave.day_type)}
                    ${this.detailItem("Created At", this.formatDateTime(leave.created_at))}
                    ${this.detailItem(
                        "Reviewed At",
                        leave.reviewed_at
                            ? this.formatDateTime(leave.reviewed_at)
                            : "-"
                    )}
                </div>

                <div>
                    <p class="text-sm font-medium text-gray-900">Reason</p>
                    <p class="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        ${this.escapeHtml(leave.reason || "-")}
                    </p>
                </div>

                ${
                    leave.rejection_reason
                        ? `
                            <div>
                                <p class="text-sm font-medium text-red-700">
                                    Rejection Reason
                                </p>
                                <p class="mt-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    ${this.escapeHtml(leave.rejection_reason)}
                                </p>
                            </div>
                        `
                        : ""
                }

                <div>
                    <p class="mb-2 text-sm font-medium text-gray-900">
                        Approval History
                    </p>

                    <div class="space-y-2">
                        ${approvalHtml}
                    </div>
                </div>

            </div>
        `;
    },

    detailItem(label, value) {
        return `
            <div class="rounded-lg bg-gray-50 p-3">
                <p class="text-xs text-gray-400">${label}</p>
                <p class="mt-1 text-sm font-medium text-gray-900">
                    ${this.escapeHtml(String(value ?? "-"))}
                </p>
            </div>
        `;
    },

    closeModal() {
        this.modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
    },

    resetFilters() {
        this.status.value = "";
        this.startDate.value = "";
        this.endDate.value = "";
        this.loadHistory();
    },

    showLoading() {
        this.loading.classList.remove("hidden");
    },

    hideLoading() {
        this.loading.classList.add("hidden");
    },

    showEmpty() {
        this.empty.classList.remove("hidden");
    },

    hideEmpty() {
        this.empty.classList.add("hidden");
    },

    showError(message) {
        this.error.textContent = message;
        this.error.classList.remove("hidden");
    },

    hideError() {
        this.error.classList.add("hidden");
        this.error.textContent = "";
    },

    formatDate(date) {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    },

    formatDateTime(date) {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    },

    escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    },
};

document.addEventListener(
    "DOMContentLoaded",
    () => EmployeeLeaveHistory.init()
);