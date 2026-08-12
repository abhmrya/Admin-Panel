/**
 * =====================================================
 * attendance.js - Client Side Attendance Management
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    loadAttendanceData();
    displayCurrentDate();
});

function displayCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString(undefined, options);
    document.getElementById("currentDateDisplay").innerText = todayStr;
}

/**
 * Fetch attendance logs and determine today's state
 */
async function loadAttendanceData() {
    try {
        // Assuming your router endpoint is registered under DEPARTMENTS or a new ATTENDANCE endpoint in config.js
        // Let's use APP_CONFIG.ENDPOINTS.ATTENDANCE (Make sure to add ATTENDANCE: "/attendance/" in config.js)
        const endpoint = APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/";
        const data = await Api.get(endpoint);
        
        const records = Array.isArray(data) ? data : (data.results || []);
        const tbody = document.getElementById("attendanceHistoryBody");
        tbody.innerHTML = "";

        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-6 text-center text-gray-400 text-sm">No attendance records found.</td></tr>`;
            setUIAttendanceState(null);
            return;
        }

        // Check if there's an entry for today
        const todayString = new Date().toISOString().split('T')[0];
        const todayRecord = records.find(r => r.date === todayString);

        setUIAttendanceState(todayRecord);

        // Render table history
        records.forEach(rec => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-gray-50 transition";
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${rec.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600">${formatTime(rec.check_in)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-600">${formatTime(rec.check_out)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${formatMinutes(rec.working_minutes)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(rec.status)}">
                        ${rec.status}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Failed to load attendance:", error);
        showNotification("Error loading attendance history.", "error");
    }
}

/**
 * Handle Check In Action
 */
async function handleCheckIn() {
    try {
        const endpoint = (APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/") + "check-in/";
        const response = await Api.post(endpoint);
        
        showNotification(response.message || "Checked in successfully!", "success");
        loadAttendanceData();
    } catch (error) {
        console.error("Check-in error:", error);
        const errorMsg = error.data?.detail || error.message;
        showNotification(errorMsg, "error");
    }
}

/**
 * Handle Check Out Action
 */
async function handleCheckOut() {
    try {
        const endpoint = (APP_CONFIG.ENDPOINTS.ATTENDANCE || "/attendance/") + "check-out/";
        const response = await Api.post(endpoint);
        
        showNotification(response.message || "Checked out successfully!", "success");
        loadAttendanceData();
    } catch (error) {
        console.error("Check-out error:", error);
        const errorMsg = error.data?.detail || error.message;
        showNotification(errorMsg, "error");
    }
}

/**
 * Update UI buttons and status based on today's record state
 */
function setUIAttendanceState(todayRecord) {
    const checkInBtn = document.getElementById("checkInBtn");
    const checkOutBtn = document.getElementById("checkOutBtn");
    const badge = document.getElementById("attendanceStatusBadge");
    const infoText = document.getElementById("timeInfoText");

    if (!todayRecord) {
        // Haven't checked in yet today
        checkInBtn.disabled = false;
        checkOutBtn.disabled = true;
        badge.className = "px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800";
        badge.innerText = "Not Started";
        infoText.innerText = "You haven't checked in for today.";
        return;
    }

    if (todayRecord.check_in && !todayRecord.check_out) {
        // Currently checked in, waiting for check out
        checkInBtn.disabled = true;
        checkOutBtn.disabled = false;
        badge.className = "px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800";
        badge.innerText = "Checked In";
        infoText.innerText = `Checked in at ${formatTime(todayRecord.check_in)}`;
    } else if (todayRecord.check_in && todayRecord.check_out) {
        // Completed day
        checkInBtn.disabled = true;
        checkOutBtn.disabled = true;
        badge.className = "px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800";
        badge.innerText = "Completed";
        infoText.innerText = `Worked for ${formatMinutes(todayRecord.working_minutes)} today.`;
    }
}

/**
 * Utility Formatting Functions
 */
function formatTime(isoString) {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMinutes(minutes) {
    if (!minutes || minutes <= 0) return "0 mins";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'PRESENT': return 'bg-green-100 text-green-800';
        case 'ABSENT': return 'bg-red-100 text-red-800';
        case 'HALF_DAY': return 'bg-amber-100 text-amber-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function showNotification(message, type = "success") {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}