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


/* ==========================================================
   INITIALIZATION
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    if (
        typeof Guard !== "undefined" &&
        !(await Guard.auth())
    ) {
        return;
    }

    initAttendanceControls();
    initAttendanceModal();

    await loadAttendanceData();

});


/* ==========================================================
   LOAD ATTENDANCE
   ========================================================== */

async function loadAttendanceData() {

    const tbody = document.getElementById(
        "attendanceTableBody"
    );

    if (!tbody) return;


    tbody.innerHTML = `
        <tr>
            <td
                colspan="11"
                class="py-10 text-center text-sm text-slate-500"
            >
                Loading attendance records...
            </td>
        </tr>
    `;


    try {

        const endpoint =
            APP_CONFIG.ENDPOINTS.ATTENDANCE ||
            "/attendance/";


        const data = await Api.get(endpoint);


        attendanceLogs = Array.isArray(data)
            ? data
            : (data.results ?? []);


        filteredAttendanceLogs = [...attendanceLogs];

        currentAttPage = 1;

        applyDateFilter(false);


    } catch (error) {

        console.error(
            "Error loading attendance:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    class="py-10 text-center text-sm text-red-600"
                >
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

    const filterDate =
        document.getElementById("filterDate");


    const selectedDate =
        filterDate?.value;


    if (selectedDate) {

        filteredAttendanceLogs =
            attendanceLogs.filter(
                record => record.date === selectedDate
            );

    } else {

        filteredAttendanceLogs =
            [...attendanceLogs];

    }


    if (resetPage) {
        currentAttPage = 1;
    }


    renderAttendanceTable();

}


/* ==========================================================
   RENDER TABLE
   ========================================================== */

function renderAttendanceTable() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        filteredAttendanceLogs.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="11"
                    class="py-10 text-center text-sm text-slate-500"
                >
                    No attendance logs found.
                </td>
            </tr>
        `;


        updateAttendancePaginationUI(1);

        return;

    }


    const totalPages =
        Math.ceil(
            filteredAttendanceLogs.length /
            attRowsPerPage
        ) || 1;


    if (currentAttPage > totalPages) {
        currentAttPage = totalPages;
    }


    if (currentAttPage < 1) {
        currentAttPage = 1;
    }


    const start =
        (currentAttPage - 1) *
        attRowsPerPage;


    const end =
        start + attRowsPerPage;


    const paginated =
        filteredAttendanceLogs.slice(
            start,
            end
        );


    paginated.forEach(record => {

        const row =
            document.createElement("tr");


        row.className =
            "hover:bg-slate-50 transition";


        const employeeName =
            record.employee_name ||
            "Unknown Employee";


        const employeeEmail =
            record.employee_email ||
            "-";


        const id =
            record.id || "-";


        const checkIn =
            formatDateTime(
                record.check_in
            );


        const checkOut =
            formatDateTime(
                record.check_out
            );


        const workingMinutes =
            Number(
                record.working_minutes || 0
            );


        const workingHours =
            record.working_hours ||
            formatMinutes(
                workingMinutes
            );


        const createdAt =
            formatDateTime(
                record.created_at
            );


        const updatedAt =
            formatDateTime(
                record.updated_at
            );


        const statusBadge =
            getStatusBadge(
                record.status
            );


        row.innerHTML = `

            <!-- ID -->

            <td class="px-5 py-4">

                <span
                    title="${escapeHtml(id)}"
                    class="font-mono text-[10px] text-slate-500"
                >
                    ${escapeHtml(
                        shortenUUID(id)
                    )}
                </span>

            </td>


            <!-- Employee -->

            <td class="px-5 py-4">

                <div class="font-semibold text-slate-800">
                    ${escapeHtml(
                        employeeName
                    )}
                </div>

            </td>


            <!-- Email -->

            <td class="px-5 py-4">

                <span class="text-xs text-slate-600">
                    ${escapeHtml(
                        employeeEmail
                    )}
                </span>

            </td>


            <!-- Date -->

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">

                ${escapeHtml(
                    record.date || "-"
                )}

            </td>


            <!-- Check In -->

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">

                ${checkIn}

            </td>


            <!-- Check Out -->

            <td class="whitespace-nowrap px-5 py-4 text-sm text-slate-600">

                ${
                    record.check_out
                        ? checkOut
                        : `<span class="text-amber-600">
                               Active
                           </span>`
                }

            </td>


            <!-- Working -->

            <td class="whitespace-nowrap px-5 py-4 text-center">

                <div class="font-semibold text-slate-700">
                    ${workingHours}
                </div>

                <div class="text-[10px] text-slate-400">
                    ${workingMinutes} min
                </div>

            </td>


            <!-- Status -->

            <td class="whitespace-nowrap px-5 py-4 text-center">

                ${statusBadge}

            </td>


            <!-- Created -->

            <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-500">

                ${createdAt}

            </td>


            <!-- Updated -->

            <td class="whitespace-nowrap px-5 py-4 text-xs text-slate-500">

                ${updatedAt}

            </td>


            <!-- Action -->

            <td class="px-5 py-4 text-center">

                <button
                    type="button"
                    class="editAttendanceBtn rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    data-id="${escapeHtml(id)}"
                >
                    Edit
                </button>

            </td>

        `;


        tbody.appendChild(row);

    });


    attachEditButtons();


    updateAttendancePaginationUI(
        totalPages
    );

}


/* ==========================================================
   STATUS BADGE
   ========================================================== */

function getStatusBadge(status) {

    const classes = {

        PRESENT:
            "bg-emerald-100 text-emerald-700",

        ABSENT:
            "bg-red-100 text-red-700",

        HALF_DAY:
            "bg-amber-100 text-amber-700",

        ON_LEAVE:
            "bg-indigo-100 text-indigo-700",

    };


    const labels = {

        PRESENT: "Present",

        ABSENT: "Absent",

        HALF_DAY: "Half Day",

        ON_LEAVE: "On Leave",

    };


    const className =
        classes[status] ||
        "bg-slate-100 text-slate-700";


    const label =
        labels[status] ||
        status ||
        "Unknown";


    return `
        <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold ${className}"
        >
            ${escapeHtml(label)}
        </span>
    `;

}


/* ==========================================================
   PAGINATION
   ========================================================== */

function initAttendanceControls() {

    const prevBtn =
        document.getElementById(
            "attPrevBtn"
        );


    const nextBtn =
        document.getElementById(
            "attNextBtn"
        );


    const filterDate =
        document.getElementById(
            "filterDate"
        );


    const clearDateFilter =
        document.getElementById(
            "clearDateFilter"
        );


    const refreshBtn =
        document.getElementById(
            "refreshAttendanceBtn"
        );


    prevBtn?.addEventListener(
        "click",
        () => {

            if (currentAttPage > 1) {

                currentAttPage--;

                renderAttendanceTable();

            }

        }
    );


    nextBtn?.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.ceil(
                    filteredAttendanceLogs.length /
                    attRowsPerPage
                ) || 1;


            if (
                currentAttPage <
                totalPages
            ) {

                currentAttPage++;

                renderAttendanceTable();

            }

        }
    );


    filterDate?.addEventListener(
        "change",
        () => {

            applyDateFilter(true);

        }
    );


    clearDateFilter?.addEventListener(
        "click",
        () => {

            if (filterDate) {
                filterDate.value = "";
            }

            applyDateFilter(true);

        }
    );


    refreshBtn?.addEventListener(
        "click",
        async () => {

            await loadAttendanceData();

        }
    );

}


/* ==========================================================
   PAGINATION UI
   ========================================================== */

function updateAttendancePaginationUI(
    totalPages
) {

    const totalEntries =
        filteredAttendanceLogs.length;


    const startEntry =
        totalEntries === 0
            ? 0
            : (
                (currentAttPage - 1) *
                attRowsPerPage
            ) + 1;


    const endEntry =
        Math.min(
            currentAttPage *
            attRowsPerPage,
            totalEntries
        );


    const infoEl =
        document.getElementById(
            "attendancePaginationInfo"
        );


    const displayEl =
        document.getElementById(
            "attPageDisplay"
        );


    const prevBtn =
        document.getElementById(
            "attPrevBtn"
        );


    const nextBtn =
        document.getElementById(
            "attNextBtn"
        );


    if (infoEl) {

        infoEl.textContent =
            `Showing ${startEntry} to ${endEntry} of ${totalEntries} entries`;

    }


    if (displayEl) {

        displayEl.textContent =
            `Page ${currentAttPage} of ${totalPages}`;

    }


    if (prevBtn) {

        prevBtn.disabled =
            currentAttPage === 1;

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

    document
        .querySelectorAll(
            ".editAttendanceBtn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;


                    const record =
                        attendanceLogs.find(
                            item =>
                                String(item.id) ===
                                String(id)
                        );


                    if (!record) {

                        console.error(
                            "Attendance record not found:",
                            id
                        );

                        return;

                    }


                    openAttendanceEditModal(
                        record
                    );

                }
            );

        });

}


/* ==========================================================
   MODAL INITIALIZATION
   ========================================================== */

function initAttendanceModal() {

    const modal =
        document.getElementById(
            "attendanceEditModal"
        );


    const overlay =
        document.getElementById(
            "attendanceEditOverlay"
        );


    const closeBtn =
        document.getElementById(
            "closeAttendanceModal"
        );


    const cancelBtn =
        document.getElementById(
            "cancelAttendanceEdit"
        );


    const form =
        document.getElementById(
            "attendanceEditForm"
        );


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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.classList.contains("hidden")
            ) {

                closeAttendanceEditModal();

            }

        }
    );


    form?.addEventListener(
        "submit",
        handleAttendanceUpdate
    );

}


/* ==========================================================
   OPEN EDIT MODAL
   ========================================================== */

function openAttendanceEditModal(
    record
) {

    const modal =
        document.getElementById(
            "attendanceEditModal"
        );


    if (!modal) return;


    document.getElementById(
        "editAttendanceId"
    ).value =
        record.id || "";


    document.getElementById(
        "editEmployeeName"
    ).value =
        record.employee_name || "";


    document.getElementById(
        "editEmployeeEmail"
    ).value =
        record.employee_email || "";


    document.getElementById(
        "editAttendanceDate"
    ).value =
        record.date || "";


    document.getElementById(
        "editCheckIn"
    ).value =
        toDateTimeLocal(
            record.check_in
        );


    document.getElementById(
        "editCheckOut"
    ).value =
        toDateTimeLocal(
            record.check_out
        );


    document.getElementById(
        "editAttendanceStatus"
    ).value =
        record.status || "PRESENT";


    document.getElementById(
        "editWorkingTime"
    ).textContent =
        record.working_hours ||
        formatMinutes(
            Number(
                record.working_minutes || 0
            )
        );


    document.getElementById(
        "editCreatedAt"
    ).value =
        formatDateTime(
            record.created_at
        );


    document.getElementById(
        "editUpdatedAt"
    ).value =
        formatDateTime(
            record.updated_at
        );


    clearEditError();


    modal.classList.remove("hidden");
    modal.classList.add("flex");

}


/* ==========================================================
   CLOSE MODAL
   ========================================================== */

function closeAttendanceEditModal() {

    const modal =
        document.getElementById(
            "attendanceEditModal"
        );


    if (!modal) return;


    modal.classList.add("hidden");
    modal.classList.remove("flex");


    clearEditError();

}


/* ==========================================================
   UPDATE ATTENDANCE
   ========================================================== */

async function handleAttendanceUpdate(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editAttendanceId"
        ).value;


    const checkIn =
        document.getElementById(
            "editCheckIn"
        ).value;


    const checkOut =
        document.getElementById(
            "editCheckOut"
        ).value;


    const status =
        document.getElementById(
            "editAttendanceStatus"
        ).value;


    const saveButton =
        document.getElementById(
            "saveAttendanceEdit"
        );


    clearEditError();


    if (
        checkIn &&
        checkOut &&
        new Date(checkOut) <
        new Date(checkIn)
    ) {

        showEditError(
            "Check-out time cannot be earlier than check-in time."
        );

        return;

    }


    const payload = {

        check_in:
            checkIn
                ? new Date(
                    checkIn
                ).toISOString()
                : null,

        check_out:
            checkOut
                ? new Date(
                    checkOut
                ).toISOString()
                : null,

        status: status,

    };


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    try {

        const endpoint =
            (
                APP_CONFIG.ENDPOINTS.ATTENDANCE ||
                "/attendance/"
            ) +
            `${id}/`;


        const response =
            await Api.patch(
                endpoint,
                payload
            );


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


        const message =
            extractApiError(
                error
            );


        showEditError(
            message
        );


    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "Save Changes";

    }

}


/* ==========================================================
   ERROR HANDLING
   ========================================================== */

function showEditError(
    message
) {

    const errorBox =
        document.getElementById(
            "attendanceEditError"
        );


    if (!errorBox) return;


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );

}


function clearEditError() {

    const errorBox =
        document.getElementById(
            "attendanceEditError"
        );


    if (!errorBox) return;


    errorBox.textContent = "";

    errorBox.classList.add(
        "hidden"
    );

}


function extractApiError(
    error
) {

    if (
        error?.data?.detail
    ) {

        return error.data.detail;

    }


    if (
        error?.response?.data?.detail
    ) {

        return error.response.data.detail;

    }


    if (
        error?.data &&
        typeof error.data === "object"
    ) {

        const values =
            Object.values(
                error.data
            );


        if (values.length) {

            return values
                .flat()
                .join(" ");

        }

    }


    return (
        error?.message ||
        "Failed to update attendance."
    );

}


/* ==========================================================
   FORMAT HELPERS
   ========================================================== */

function formatDateTime(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );

}


function toDateTimeLocal(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


function formatMinutes(
    minutes
) {

    minutes =
        Number(minutes) || 0;


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    return `${hours}h ${remainingMinutes}m`;

}


function shortenUUID(
    value
) {

    if (!value) {
        return "-";
    }


    const stringValue =
        String(value);


    if (
        stringValue.length <= 12
    ) {

        return stringValue;

    }


    return (
        stringValue.slice(0, 8) +
        "..."
    );

}


/* ==========================================================
   HTML ESCAPE
   ========================================================== */

function escapeHtml(
    value
) {

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