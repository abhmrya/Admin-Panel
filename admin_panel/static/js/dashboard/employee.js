/**
 * ==========================================================
 * Employee Dashboard
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

    if (!(await Guard.auth())) {
        return;
    }

    await initializeEmployeeDashboard();

});


/* ==========================================================
   INITIALIZE
   ========================================================== */

async function initializeEmployeeDashboard() {

    await Promise.allSettled([
        loadEmployeeProfile(),
        loadEmployeeAttendance(),
        loadEmployeeLeave(),
        loadEmployeeDocuments()
    ]);

}


/* ==========================================================
   PROFILE
   ========================================================== */

async function loadEmployeeProfile() {

    try {

        let user = Auth.getCurrentUser();

        if (user?.user) {
            user = user.user;
        }

        if (!user) {
            user = await AuthService.fetchCurrentUser();
        }

        if (user?.user) {
            user = user.user;
        }

        if (!user) {
            return;
        }


        const name =
            [
                user.first_name,
                user.last_name
            ]
                .filter(Boolean)
                .join(" ")
            ||
            user.username
            ||
            "Employee";


        setText(
            "welcomeMessage",
            `Welcome back, ${name}`
        );


        let profile = null;

        try {
            profile = await ProfileService.getProfile();
        } catch (profileError) {
            console.warn(
                "Profile API failed:",
                profileError
            );
        }


        if (!profile) {

            setBasicProfile(
                user,
                name
            );

            return;
        }


        const profileUser =
            profile.user_data ||
            profile.user ||
            user;


        const fullName =
            [
                profileUser.first_name,
                profileUser.last_name
            ]
                .filter(Boolean)
                .join(" ")
            ||
            profileUser.username
            ||
            name;


        setText(
            "welcomeMessage",
            `Welcome back, ${fullName}`
        );


        setText(
            "profileName",
            fullName
        );


        setText(
            "profileEmail",
            profileUser.email ||
            user.email ||
            "--"
        );


        setText(
            "profilePhone",
            profileUser.phone_number ||
            profileUser.phone ||
            user.phone_number ||
            "--"
        );


        setText(
            "profileRole",
            profileUser.role ||
            user.role ||
            "--"
        );


        setText(
            "profileGender",
            profile.gender ||
            profileUser.gender ||
            "Not specified"
        );


        setText(
            "profileDob",
            profile.dob ||
            profile.date_of_birth ||
            profileUser.dob ||
            "Not specified"
        );


        setText(
            "profileAddress",
            profile.address ||
            profileUser.address ||
            "Not available"
        );


        renderAvatar(
            profile.avatar ||
            profile.avatar_url ||
            null,
            fullName
        );


    } catch (error) {

        console.error(
            "Failed to load employee profile:",
            error
        );

    }

}


/* ==========================================================
   BASIC PROFILE FALLBACK
   ========================================================== */

function setBasicProfile(user, name) {

    setText(
        "profileName",
        name
    );

    setText(
        "profileEmail",
        user.email || "--"
    );

    setText(
        "profilePhone",
        user.phone_number ||
        user.phone ||
        "--"
    );

    setText(
        "profileRole",
        user.role || "--"
    );

    setText(
        "profileGender",
        user.gender ||
        "Not specified"
    );

    setText(
        "profileDob",
        user.dob ||
        "Not specified"
    );

    setText(
        "profileAddress",
        user.address ||
        "Not available"
    );

    renderAvatar(
        null,
        name
    );

}


/* ==========================================================
   AVATAR
   ========================================================== */

function renderAvatar(url, name) {

    const image =
        document.getElementById(
            "profileAvatarImage"
        );

    const initials =
        document.getElementById(
            "profileAvatarInitials"
        );


    if (!image || !initials) {
        return;
    }


    if (url) {

        image.src = url;

        image.classList.remove(
            "hidden"
        );

        initials.classList.add(
            "hidden"
        );


        image.onerror = () => {

            image.classList.add(
                "hidden"
            );

            initials.classList.remove(
                "hidden"
            );

            initials.textContent =
                getInitials(name);

        };

        return;
    }


    image.classList.add(
        "hidden"
    );

    initials.classList.remove(
        "hidden"
    );

    initials.textContent =
        getInitials(name);

}


/* ==========================================================
   ATTENDANCE
   ========================================================== */

async function loadEmployeeAttendance() {

    try {

        const data =
            await Api.get(
                APP_CONFIG.ENDPOINTS.ATTENDANCE
            );


        if (!data) {
            return;
        }


        const records =
            normalizeListResponse(
                data
            );


        console.log(
            "Employee attendance:",
            records
        );


        if (!records.length) {

            setText(
                "todayAttendanceStatus",
                "Not Marked"
            );

            setText(
                "statAttendance",
                "0"
            );

            return;
        }


        /*
         * ------------------------------------------------------
         * FIND TODAY
         * ------------------------------------------------------
         */

        const today =
            getTodayDate();


        const record =
            records.find(item => {

                const date =
                    item.date ||
                    item.attendance_date ||
                    item.attendanceDate;

                return normalizeDate(date) === today;

            });


        /*
         * ------------------------------------------------------
         * TODAY STATUS
         * ------------------------------------------------------
         */

        if (!record) {

            setText(
                "todayAttendanceStatus",
                "Not Marked"
            );

            setText(
                "todayCheckIn",
                "--"
            );

            setText(
                "todayCheckOut",
                "--"
            );

            setText(
                "todayWorkingHours",
                "--"
            );

        } else {

            setText(
                "todayAttendanceStatus",
                formatAttendanceStatus(
                    record.status
                )
            );


            setText(
                "todayCheckIn",
                formatTime(
                    record.check_in ||
                    record.check_in_time ||
                    record.checkIn
                )
            );


            setText(
                "todayCheckOut",
                formatTime(
                    record.check_out ||
                    record.check_out_time ||
                    record.checkOut
                )
            );


            setText(
                "todayWorkingHours",
                formatWorkingHours(
                    record
                )
            );

        }


        /*
         * ------------------------------------------------------
         * ATTENDANCE STATISTICS
         * ------------------------------------------------------
         */

        const presentDays =
            records.filter(record =>
                isStatus(
                    record.status,
                    [
                        "PRESENT",
                        "Present",
                        "present"
                    ]
                )
            ).length;


        setText(
            "statAttendance",
            presentDays
        );


    } catch (error) {

        console.warn(
            "Attendance loading failed:",
            error
        );

    }

}


/* ==========================================================
   LEAVE
   ========================================================== */

async function loadEmployeeLeave() {

    try {

        const data =
            await Api.get(
                APP_CONFIG.ENDPOINTS.LEAVE_DASHBOARD
            );


        if (!data) {
            return;
        }


        console.log(
            "Employee leave dashboard:",
            data
        );


        /*
         * ------------------------------------------------------
         * EXTRACT LEAVE BALANCES
         * ------------------------------------------------------
         */

        const balances =
            extractLeaveBalances(
                data
            );


        /*
         * ------------------------------------------------------
         * IF API ALREADY RETURNS AGGREGATED DATA
         * ------------------------------------------------------
         */

        const root =
            data.data ||
            data;


        let available =
            getNumber(
                root.available,
                root.remaining_days,
                root.remaining
            );


        let used =
            getNumber(
                root.used_days,
                root.used
            );


        let pending =
            getNumber(
                root.pending_days,
                root.pending
            );


        /*
         * ------------------------------------------------------
         * CALCULATE FROM BALANCES
         * ------------------------------------------------------
         */

        if (balances.length) {

            available =
                balances.reduce(
                    (total, item) =>
                        total +
                        getNumber(
                            item.remaining_days,
                            item.remaining
                        ),
                    0
                );


            used =
                balances.reduce(
                    (total, item) =>
                        total +
                        getNumber(
                            item.used_days,
                            item.used
                        ),
                    0
                );


            pending =
                balances.reduce(
                    (total, item) =>
                        total +
                        getNumber(
                            item.pending_days,
                            item.pending
                        ),
                    0
                );

        }


        /*
         * ------------------------------------------------------
         * PENDING REQUESTS
         * ------------------------------------------------------
         */

        let pendingRequests =
            getNumber(
                root.pending_requests
            );


        if (
            pendingRequests === null ||
            pendingRequests === undefined
        ) {

            pendingRequests =
                pending;

        }


        /*
         * ------------------------------------------------------
         * DISPLAY SUMMARY
         * ------------------------------------------------------
         */

        setText(
            "statLeaveBalance",
            formatNumber(
                available
            )
        );


        setText(
            "leaveAvailable",
            formatNumber(
                available
            )
        );


        setText(
            "leaveUsed",
            formatNumber(
                used
            )
        );


        setText(
            "leavePending",
            formatNumber(
                pending
            )
        );


        setText(
            "statPendingRequests",
            formatNumber(
                pendingRequests
            )
        );


        /*
         * ------------------------------------------------------
         * LEAVE TYPE BREAKDOWN
         * ------------------------------------------------------
         */

        renderLeaveBreakdown(
            balances
        );


    } catch (error) {

        console.warn(
            "Leave loading failed:",
            error
        );

    }

}


/* ==========================================================
   EXTRACT LEAVE BALANCES
   ========================================================== */

function extractLeaveBalances(data) {

    if (!data) {
        return [];
    }


    if (Array.isArray(data)) {
        return data;
    }


    if (Array.isArray(data.results)) {
        return data.results;
    }


    if (Array.isArray(data.data)) {
        return data.data;
    }


    if (Array.isArray(data.balances)) {
        return data.balances;
    }


    if (data.data) {

        if (Array.isArray(data.data.results)) {
            return data.data.results;
        }

        if (Array.isArray(data.data.balances)) {
            return data.data.balances;
        }

    }


    return [];

}


/* ==========================================================
   LEAVE BREAKDOWN
   ========================================================== */

function renderLeaveBreakdown(balances) {

    const container =
        document.getElementById(
            "leaveBreakdown"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!balances.length) {
        return;
    }


    balances.forEach(balance => {

        const leaveType =
            balance.leave_type_name ||
            balance.leave_type?.name ||
            balance.leave_type ||
            "Leave";


        const remaining =
            getNumber(
                balance.remaining_days,
                balance.remaining
            );


        const used =
            getNumber(
                balance.used_days,
                balance.used
            );


        const pending =
            getNumber(
                balance.pending_days,
                balance.pending
            );


        const allocated =
            getNumber(
                balance.allocated_days,
                balance.allocated
            );


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "rounded-lg border border-gray-100 bg-gray-50 p-3";


        row.innerHTML = `

            <div class="flex items-center justify-between gap-3">

                <div class="min-w-0">

                    <p class="truncate text-sm font-semibold text-gray-700">
                        ${escapeHtml(leaveType)}
                    </p>

                    <p class="mt-1 text-xs text-gray-400">
                        Allocated:
                        ${formatNumber(allocated)}
                        · Used:
                        ${formatNumber(used)}
                        · Pending:
                        ${formatNumber(pending)}
                    </p>

                </div>

                <div class="shrink-0 text-right">

                    <p class="text-lg font-bold text-emerald-600">
                        ${formatNumber(remaining)}
                    </p>

                    <p class="text-[10px] text-gray-400">
                        remaining
                    </p>

                </div>

            </div>

        `;


        container.appendChild(
            row
        );

    });

}


/* ==========================================================
   DOCUMENTS
   ========================================================== */

async function loadEmployeeDocuments() {

    /*
     * Documents API abhi tumhare pasted code me configured nahi hai.
     *
     * Isliye yahan fake value nahi dikhayenge.
     */

    setText(
        "statDocuments",
        "--"
    );

}


/* ==========================================================
   NORMALIZE API LIST
   ========================================================== */

function normalizeListResponse(data) {

    if (!data) {
        return [];
    }


    if (Array.isArray(data)) {
        return data;
    }


    if (Array.isArray(data.results)) {
        return data.results;
    }


    if (Array.isArray(data.data)) {
        return data.data;
    }


    if (Array.isArray(data.records)) {
        return data.records;
    }


    if (data.data) {

        if (Array.isArray(data.data.results)) {
            return data.data.results;
        }

        if (Array.isArray(data.data.records)) {
            return data.data.records;
        }

    }


    return [];

}


/* ==========================================================
   ATTENDANCE STATUS
   ========================================================== */

function formatAttendanceStatus(status) {

    if (!status) {
        return "Not Marked";
    }


    const labels = {

        PRESENT: "Present",

        ABSENT: "Absent",

        HALF_DAY: "Half Day",

        LATE: "Late",

        LEAVE: "Leave"

    };


    return labels[status] ||
        String(status)
            .replaceAll("_", " ")
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            );

}


/* ==========================================================
   WORKING HOURS
   ========================================================== */

function formatWorkingHours(record) {

    if (!record) {
        return "--";
    }


    if (record.working_hours) {
        return record.working_hours;
    }


    if (record.total_hours) {
        return record.total_hours;
    }


    if (record.working_time) {
        return record.working_time;
    }


    if (
        record.working_minutes !== undefined &&
        record.working_minutes !== null
    ) {

        const minutes =
            Number(
                record.working_minutes
            );


        if (
            Number.isNaN(minutes)
        ) {
            return "--";
        }


        return minutesToHours(
            minutes
        );

    }


    return "--";

}


/* ==========================================================
   MINUTES TO HOURS
   ========================================================== */

function minutesToHours(minutes) {

    const total =
        Number(minutes);


    if (
        Number.isNaN(total) ||
        total < 0
    ) {
        return "--";
    }


    const hours =
        Math.floor(
            total / 60
        );


    const remaining =
        total % 60;


    if (!remaining) {
        return `${hours}h`;
    }


    return `${hours}h ${remaining}m`;

}


/* ==========================================================
   TIME
   ========================================================== */

function formatTime(value) {

    if (!value) {
        return "--";
    }


    if (
        typeof value === "string" &&
        /^\d{2}:\d{2}/.test(value)
    ) {

        return value.substring(
            0,
            5
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ==========================================================
   TODAY
   ========================================================== */

function getTodayDate() {

    return new Date()
        .toLocaleDateString(
            "en-CA"
        );

}


/* ==========================================================
   NORMALIZE DATE
   ========================================================== */

function normalizeDate(value) {

    if (!value) {
        return null;
    }


    if (
        typeof value === "string"
    ) {

        return value.substring(
            0,
            10
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return date
        .toISOString()
        .substring(
            0,
            10
        );

}


/* ==========================================================
   NUMBER
   ========================================================== */

function getNumber(...values) {

    for (const value of values) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(value);


            if (
                !Number.isNaN(number)
            ) {

                return number;

            }

        }

    }


    return 0;

}


/* ==========================================================
   FORMAT NUMBER
   ========================================================== */

function formatNumber(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {
        return "--";
    }


    return number % 1 === 0
        ? String(number)
        : number.toFixed(2);

}


/* ==========================================================
   STATUS CHECK
   ========================================================== */

function isStatus(
    value,
    statuses
) {

    if (!value) {
        return false;
    }


    return statuses.includes(
        value
    );

}


/* ==========================================================
   SET TEXT
   ========================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ??
        "--";

}


/* ==========================================================
   INITIALS
   ========================================================== */

function getInitials(
    name = ""
) {

    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word[0])
        .join("")
        .substring(
            0,
            2
        )
        .toUpperCase();

}


/* ==========================================================
   HTML ESCAPE
   ========================================================== */

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}