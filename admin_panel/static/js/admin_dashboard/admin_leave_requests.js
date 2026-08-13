/**
 * ==========================================================
 * Admin Leave Requests
 * ==========================================================
 */

console.log("ADMIN LEAVE REQUESTS JS LOADED");


const AdminLeaveRequests = {

    requests: [],

    currentRejectId: null,


    /* ======================================================
       INIT
    ====================================================== */

    init() {

        console.log("Initializing Admin Leave Requests...");

        this.cacheElements();
        this.bindEvents();
        this.loadRequests();

        console.log("Admin Leave Requests initialized.");
    },


    /* ======================================================
       CACHE
    ====================================================== */

    cacheElements() {

        this.tableBody =
            document.getElementById("leave-table-body");

        this.loading =
            document.getElementById("leave-loading");

        this.empty =
            document.getElementById("leave-empty");

        this.error =
            document.getElementById("leave-error");


        this.search =
            document.getElementById("leave-search");

        this.status =
            document.getElementById("leave-status");

        this.startDate =
            document.getElementById("leave-start-date");

        this.endDate =
            document.getElementById("leave-end-date");


        this.filterBtn =
            document.getElementById("leave-filter-btn");

        this.resetBtn =
            document.getElementById("leave-reset-btn");

        this.refreshBtn =
            document.getElementById("leave-refresh-btn");


        this.statTotal =
            document.getElementById("stat-total");

        this.statPending =
            document.getElementById("stat-pending");

        this.statApproved =
            document.getElementById("stat-approved");

        this.statRejected =
            document.getElementById("stat-rejected");


        /* Slider */

        this.slider =
            document.getElementById("leave-slider");

        this.sliderPanel =
            document.getElementById("leave-slider-panel");

        this.sliderOverlay =
            document.getElementById("leave-slider-overlay");

        this.sliderClose =
            document.getElementById("leave-slider-close");

        this.sliderContent =
            document.getElementById("leave-slider-content");


        /* Reject */

        this.rejectModal =
            document.getElementById("reject-modal");

        this.rejectOverlay =
            document.getElementById("reject-modal-overlay");

        this.rejectReason =
            document.getElementById("reject-reason");

        this.rejectError =
            document.getElementById("reject-error");

        this.rejectCancelBtn =
            document.getElementById("reject-cancel-btn");

        this.rejectConfirmBtn =
            document.getElementById("reject-confirm-btn");
    },


    /* ======================================================
       EVENTS
    ====================================================== */

    bindEvents() {

        this.filterBtn.addEventListener(
            "click",
            () => this.loadRequests()
        );


        this.resetBtn.addEventListener(
            "click",
            () => this.resetFilters()
        );


        this.refreshBtn.addEventListener(
            "click",
            () => this.loadRequests()
        );


        this.search.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    this.loadRequests();
                }

            }
        );


        this.sliderClose.addEventListener(
            "click",
            () => this.closeSlider()
        );


        this.sliderOverlay.addEventListener(
            "click",
            () => this.closeSlider()
        );


        this.rejectCancelBtn.addEventListener(
            "click",
            () => this.closeRejectModal()
        );


        this.rejectOverlay.addEventListener(
            "click",
            () => this.closeRejectModal()
        );


        this.rejectConfirmBtn.addEventListener(
            "click",
            () => this.confirmReject()
        );


        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    this.closeSlider();
                    this.closeRejectModal();

                }

            }
        );
    },


    /* ======================================================
       LOAD REQUESTS
    ====================================================== */

    async loadRequests() {

        try {

            this.showLoading();
            this.hideError();

            const params =
                this.buildQueryParams();

            const response =
                await LeaveService.getLeaveRequests(params);


            this.requests =
                Array.isArray(response)
                    ? response
                    : response.results || [];


            this.updateStats();
            this.render();

        }
        catch (error) {

            console.error(
                "Failed to load leave requests:",
                error
            );

            this.showError(
                error?.message ||
                "Failed to load leave requests."
            );

            this.requests = [];

            this.updateStats();
            this.render();

        }
        finally {

            this.hideLoading();

        }
    },


    /* ======================================================
       QUERY PARAMS
    ====================================================== */

    buildQueryParams() {

        const params =
            new URLSearchParams();


        if (this.status.value) {

            params.append(
                "status",
                this.status.value
            );

        }


        if (this.startDate.value) {

            params.append(
                "start_date",
                this.startDate.value
            );

        }


        if (this.endDate.value) {

            params.append(
                "end_date",
                this.endDate.value
            );

        }


        /*
         * Search is handled on frontend so this works
         * even if backend doesn't support search.
         */

        const query =
            params.toString();


        return query
            ? `?${query}`
            : "";
    },


    /* ======================================================
       FILTER SEARCH
    ====================================================== */

    getFilteredRequests() {

        const search =
            this.search.value
                .trim()
                .toLowerCase();


        if (!search) {
            return this.requests;
        }


        return this.requests.filter(
            leave => {

                const email =
                    String(
                        leave.employee_email || ""
                    ).toLowerCase();


                return email.includes(search);

            }
        );
    },


    /* ======================================================
       STATS
    ====================================================== */

    updateStats() {

        const requests =
            this.requests;


        this.statTotal.textContent =
            requests.length;


        this.statPending.textContent =
            requests.filter(
                item => item.status === "PENDING"
            ).length;


        this.statApproved.textContent =
            requests.filter(
                item => item.status === "APPROVED"
            ).length;


        this.statRejected.textContent =
            requests.filter(
                item => item.status === "REJECTED"
            ).length;
    },


    /* ======================================================
       RENDER
    ====================================================== */

    render() {

        this.tableBody.innerHTML = "";


        const requests =
            this.getFilteredRequests();


        if (!requests.length) {

            this.showEmpty();

            return;
        }


        this.hideEmpty();


        requests.forEach(
            leave => this.renderRow(leave)
        );
    },


    /* ======================================================
       TABLE ROW
    ====================================================== */

    renderRow(leave) {

        const row =
            document.createElement("tr");


        row.className =
            "transition hover:bg-gray-50";


        row.innerHTML = `

            <td class="px-4 py-3">

                <div class="max-w-[220px]">

                    <p class="truncate text-sm font-medium text-gray-900">
                        ${this.escapeHtml(
                            leave.employee_email || "-"
                        )}
                    </p>

                    <p class="mt-0.5 text-xs text-gray-500">
                        Request #${leave.id}
                    </p>

                </div>

            </td>


            <td class="whitespace-nowrap px-4 py-3">

                <p class="text-sm font-medium text-gray-800">
                    ${this.escapeHtml(
                        leave.leave_type_name || "-"
                    )}
                </p>

                <p class="mt-0.5 text-xs text-gray-500">
                    ${this.formatDayType(
                        leave.day_type
                    )}
                </p>

            </td>


            <td class="whitespace-nowrap px-4 py-3">

                <p class="text-sm text-gray-700">
                    ${this.formatDate(
                        leave.start_date
                    )}
                </p>

                <p class="text-xs text-gray-500">
                    to ${this.formatDate(
                        leave.end_date
                    )}
                </p>

            </td>


            <td class="whitespace-nowrap px-4 py-3">

                <span class="text-sm font-semibold text-gray-900">
                    ${leave.total_days || "0"}
                </span>

            </td>


            <td class="whitespace-nowrap px-4 py-3">

                ${this.getStatusBadge(
                    leave.status
                )}

            </td>


            <td class="whitespace-nowrap px-4 py-3 text-right">

                <button
                    type="button"
                    data-view-id="${leave.id}"
                    class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                    View
                </button>

            </td>

        `;


        row.querySelector(
            "[data-view-id]"
        ).addEventListener(
            "click",
            () => this.openSlider(leave.id)
        );


        this.tableBody.appendChild(row);
    },


    /* ======================================================
       STATUS BADGE
    ====================================================== */

    getStatusBadge(status) {

        const badges = {

            PENDING: {
                className:
                    "bg-amber-100 text-amber-700",
                label: "Pending"
            },

            APPROVED: {
                className:
                    "bg-green-100 text-green-700",
                label: "Approved"
            },

            REJECTED: {
                className:
                    "bg-red-100 text-red-700",
                label: "Rejected"
            },

            CANCELLED: {
                className:
                    "bg-gray-100 text-gray-700",
                label: "Cancelled"
            }

        };


        const badge =
            badges[status] || {

                className:
                    "bg-gray-100 text-gray-700",

                label:
                    status || "Unknown"

            };


        return `
            <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}">
                ${badge.label}
            </span>
        `;
    },


    /* ======================================================
       OPEN SLIDER
    ====================================================== */

    openSlider(id) {

        const leave =
            this.requests.find(
                item => item.id === id
            );


        if (!leave) {
            return;
        }


        this.sliderContent.innerHTML =
            this.getSliderContent(leave);


        this.slider.classList.remove("hidden");


        requestAnimationFrame(
            () => {

                this.sliderPanel.classList.remove(
                    "translate-x-full"
                );

            }
        );


        document.body.classList.add(
            "overflow-hidden"
        );
    },


    /* ======================================================
       SLIDER CONTENT
    ====================================================== */

    getSliderContent(leave) {

        const canReview =
            leave.status === "PENDING";


        const approvals =
            leave.approvals || [];


        const approvalHtml =
            approvals.length

                ? approvals.map(
                    approval => `

                        <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">

                            <div class="flex items-start justify-between gap-3">

                                <div>

                                    <p class="text-sm font-medium text-gray-900">
                                        ${this.escapeHtml(
                                            approval.approver_name || "-"
                                        )}
                                    </p>

                                    <p class="mt-0.5 text-xs text-gray-500">
                                        ${this.escapeHtml(
                                            approval.approver_email || "-"
                                        )}
                                    </p>

                                </div>

                                ${this.getStatusBadge(
                                    approval.action
                                )}

                            </div>


                            ${
                                approval.comment
                                    ? `
                                        <p class="mt-3 text-sm text-gray-700">
                                            ${this.escapeHtml(
                                                approval.comment
                                            )}
                                        </p>
                                    `
                                    : `
                                        <p class="mt-3 text-sm italic text-gray-400">
                                            No comment
                                        </p>
                                    `
                            }


                            <p class="mt-2 text-xs text-gray-500">
                                ${this.formatDateTime(
                                    approval.created_at
                                )}
                            </p>

                        </div>

                    `
                ).join("")

                : `
                    <div class="rounded-lg bg-gray-50 p-4 text-center">

                        <p class="text-sm text-gray-500">
                            No approval history available.
                        </p>

                    </div>
                `;


        return `

            <div class="space-y-5">


                <!-- Employee -->

                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <div class="flex items-center gap-3">

                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                            ${this.getInitial(
                                leave.employee_email
                            )}
                        </div>

                        <div class="min-w-0">

                            <p class="text-sm font-semibold text-gray-900">
                                Employee
                            </p>

                            <p class="truncate text-sm text-gray-500">
                                ${this.escapeHtml(
                                    leave.employee_email || "-"
                                )}
                            </p>

                        </div>

                    </div>

                </div>


                <!-- Status -->

                <div class="flex items-center justify-between">

                    <div>

                        <p class="text-xs uppercase tracking-wide text-gray-400">
                            Request
                        </p>

                        <p class="mt-1 text-sm font-medium text-gray-700">
                            #${leave.id}
                        </p>

                    </div>

                    ${this.getStatusBadge(
                        leave.status
                    )}

                </div>


                <!-- Leave Details -->

                <div>

                    <h3 class="mb-3 text-sm font-semibold text-gray-900">
                        Leave Information
                    </h3>


                    <div class="grid grid-cols-2 gap-3">

                        ${this.detailItem(
                            "Leave Type",
                            leave.leave_type_name
                        )}

                        ${this.detailItem(
                            "Day Type",
                            this.formatDayType(
                                leave.day_type
                            )
                        )}

                        ${this.detailItem(
                            "Start Date",
                            this.formatDate(
                                leave.start_date
                            )
                        )}

                        ${this.detailItem(
                            "End Date",
                            this.formatDate(
                                leave.end_date
                            )
                        )}

                        ${this.detailItem(
                            "Total Days",
                            leave.total_days
                        )}

                        ${this.detailItem(
                            "Created At",
                            this.formatDateTime(
                                leave.created_at
                            )
                        )}

                    </div>

                </div>


                <!-- Reason -->

                <div>

                    <h3 class="mb-2 text-sm font-semibold text-gray-900">
                        Reason
                    </h3>

                    <div class="rounded-lg bg-gray-50 p-3">

                        <p class="whitespace-pre-wrap text-sm text-gray-700">
                            ${this.escapeHtml(
                                leave.reason || "-"
                            )}
                        </p>

                    </div>

                </div>


                ${
                    leave.rejection_reason
                        ? `

                            <div>

                                <h3 class="mb-2 text-sm font-semibold text-red-700">
                                    Rejection Reason
                                </h3>

                                <div class="rounded-lg border border-red-100 bg-red-50 p-3">

                                    <p class="whitespace-pre-wrap text-sm text-red-700">
                                        ${this.escapeHtml(
                                            leave.rejection_reason
                                        )}
                                    </p>

                                </div>

                            </div>

                        `
                        : ""
                }


                <!-- Reviewed -->

                <div class="grid grid-cols-2 gap-3">

                    ${this.detailItem(
                        "Reviewed At",
                        leave.reviewed_at
                            ? this.formatDateTime(
                                leave.reviewed_at
                            )
                            : "-"
                    )}

                </div>


                <!-- Approval History -->

                <div>

                    <h3 class="mb-3 text-sm font-semibold text-gray-900">
                        Approval History
                    </h3>

                    <div class="space-y-3">
                        ${approvalHtml}
                    </div>

                </div>


                ${
                    canReview

                        ? `

                            <!-- Actions -->

                            <div class="sticky bottom-0 border-t border-gray-200 bg-white pt-4">

                                <div class="flex gap-3">

                                    <button
                                        type="button"
                                        data-approve-id="${leave.id}"
                                        class="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                                    >
                                        ✓ Approve
                                    </button>


                                    <button
                                        type="button"
                                        data-reject-id="${leave.id}"
                                        class="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                                    >
                                        ✕ Reject
                                    </button>

                                </div>

                            </div>

                        `

                        : ""

                }

            </div>

        `;


    },


    /* ======================================================
       DETAIL ITEM
    ====================================================== */

    detailItem(label, value) {

        return `

            <div class="rounded-lg bg-gray-50 p-3">

                <p class="text-xs text-gray-500">
                    ${this.escapeHtml(label)}
                </p>

                <p class="mt-1 text-sm font-medium text-gray-900">
                    ${this.escapeHtml(
                        String(value ?? "-")
                    )}
                </p>

            </div>

        `;
    },


    /* ======================================================
       APPROVE
    ====================================================== */

    async approveLeave(id) {

        if (!confirm(
            "Are you sure you want to approve this leave?"
        )) {
            return;
        }


        try {

            this.setButtonLoading(
                `[data-approve-id="${id}"]`,
                "Approving..."
            );


            await LeaveService.approveLeave(id);


            this.closeSlider();


            await this.loadRequests();

        }
        catch (error) {

            console.error(
                "Failed to approve leave:",
                error
            );


            alert(
                error?.message ||
                "Failed to approve leave."
            );

        }
    },


    /* ======================================================
       OPEN REJECT MODAL
    ====================================================== */

    openRejectModal(id) {

        this.currentRejectId = id;

        this.rejectReason.value = "";

        this.rejectError.classList.add(
            "hidden"
        );

        this.rejectModal.classList.remove(
            "hidden"
        );

        document.body.classList.add(
            "overflow-hidden"
        );


        setTimeout(
            () => this.rejectReason.focus(),
            100
        );
    },


    /* ======================================================
       CONFIRM REJECT
    ====================================================== */

    async confirmReject() {

        const id =
            this.currentRejectId;


        if (!id) {
            return;
        }


        const reason =
            this.rejectReason.value.trim();


        if (!reason) {

            this.rejectError.textContent =
                "Rejection reason is required.";

            this.rejectError.classList.remove(
                "hidden"
            );

            return;
        }


        try {

            this.rejectConfirmBtn.disabled =
                true;

            this.rejectConfirmBtn.textContent =
                "Rejecting...";


            await LeaveService.rejectLeave(
                id,
                {
                    reason: reason
                }
            );


            this.closeRejectModal();
            this.closeSlider();


            await this.loadRequests();

        }
        catch (error) {

            console.error(
                "Failed to reject leave:",
                error
            );


            this.rejectError.textContent =
                error?.message ||
                "Failed to reject leave.";

            this.rejectError.classList.remove(
                "hidden"
            );

        }
        finally {

            this.rejectConfirmBtn.disabled =
                false;

            this.rejectConfirmBtn.textContent =
                "Reject Leave";

        }
    },


    /* ======================================================
       CLOSE REJECT MODAL
    ====================================================== */

    closeRejectModal() {

        this.rejectModal.classList.add(
            "hidden"
        );

        this.currentRejectId = null;

        document.body.classList.remove(
            "overflow-hidden"
        );
    },


    /* ======================================================
       CLOSE SLIDER
    ====================================================== */

    closeSlider() {

        this.sliderPanel.classList.add(
            "translate-x-full"
        );


        setTimeout(
            () => {

                this.slider.classList.add(
                    "hidden"
                );

            },
            300
        );


        document.body.classList.remove(
            "overflow-hidden"
        );
    },


    /* ======================================================
       RESET
    ====================================================== */

    resetFilters() {

        this.search.value = "";
        this.status.value = "";
        this.startDate.value = "";
        this.endDate.value = "";

        this.loadRequests();
    },


    /* ======================================================
       LOADING
    ====================================================== */

    showLoading() {

        this.loading.classList.remove(
            "hidden"
        );
    },


    hideLoading() {

        this.loading.classList.add(
            "hidden"
        );
    },


    /* ======================================================
       EMPTY
    ====================================================== */

    showEmpty() {

        this.empty.classList.remove(
            "hidden"
        );
    },


    hideEmpty() {

        this.empty.classList.add(
            "hidden"
        );
    },


    /* ======================================================
       ERROR
    ====================================================== */

    showError(message) {

        this.error.textContent =
            message;

        this.error.classList.remove(
            "hidden"
        );
    },


    hideError() {

        this.error.classList.add(
            "hidden"
        );

        this.error.textContent = "";
    },


    /* ======================================================
       BUTTON LOADING
    ====================================================== */

    setButtonLoading(selector, text) {

        const button =
            document.querySelector(
                selector
            );


        if (!button) {
            return;
        }


        button.disabled = true;
        button.textContent = text;
        button.classList.add(
            "opacity-60",
            "cursor-not-allowed"
        );
    },


    /* ======================================================
       HELPERS
    ====================================================== */

    formatDate(date) {

        if (!date) {
            return "-";
        }


        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    },


    formatDateTime(date) {

        if (!date) {
            return "-";
        }


        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    },


    formatDayType(dayType) {

        if (dayType === "FULL_DAY") {
            return "Full Day";
        }


        if (dayType === "HALF_DAY") {
            return "Half Day";
        }


        return dayType || "-";
    },


    getInitial(email) {

        if (!email) {
            return "?";
        }


        return email
            .charAt(0)
            .toUpperCase();
    },


    escapeHtml(value) {

        const div =
            document.createElement("div");


        div.textContent =
            String(value ?? "");


        return div.innerHTML;
    }

};


/* ==========================================================
   EVENT DELEGATION FOR SLIDER ACTIONS
========================================================== */

document.addEventListener(
    "click",
    event => {

        const approveButton =
            event.target.closest(
                "[data-approve-id]"
            );


        if (approveButton) {

            const id =
                Number(
                    approveButton.dataset.approveId
                );

            AdminLeaveRequests.approveLeave(id);

            return;
        }


        const rejectButton =
            event.target.closest(
                "[data-reject-id]"
            );


        if (rejectButton) {

            const id =
                Number(
                    rejectButton.dataset.rejectId
                );

            AdminLeaveRequests.openRejectModal(id);

        }

    }
);


/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => AdminLeaveRequests.init()
);