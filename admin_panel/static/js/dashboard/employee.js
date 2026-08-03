/**
 * =====================================================
 * employee.js
 * =====================================================
 * Employee Dashboard Controller
 *
 * Features:
 * - Route Protection
 * - Load Current User
 * - Welcome Message
 * - Profile Card
 * =====================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

    const authenticated = await Guard.auth();

    if (!authenticated) {
        return;
    }

    await loadEmployeeProfile();

});


async function loadEmployeeProfile() {

    let user = Auth.getCurrentUser();

    if (!user) {

        try {

            user = await AuthService.fetchCurrentUser();

        } catch (error) {

            console.error("Failed to load current user.", error);

            Auth.logout();

            return;

        }

    }

    if (!user) {
        return;
    }

    const fullName =
        [
            user.first_name,
            user.last_name
        ]
            .filter(Boolean)
            .join(" ")
        || user.username
        || "Employee";

    const email =
        user.email || "";

    const welcome =
        document.getElementById("welcomeMessage");

    if (welcome) {

        welcome.textContent =
            `Welcome back, ${fullName}`;

    }

    setText("profileName", fullName);
    setText("profileEmail", email);

    const avatar =
        document.getElementById("profileAvatar");

    if (avatar) {

        avatar.textContent =
            getInitials(fullName);

    }

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


function getInitials(name = "") {

    return name
        .trim()
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

}