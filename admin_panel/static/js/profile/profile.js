/**
 * ==========================================
 * profile.js
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", initializeProfile);

async function initializeProfile() {

    bindEvents();

    await loadProfile();

}

function bindEvents() {

    document
        .getElementById("profileForm")
        .addEventListener("submit", updateProfile);

    document
        .getElementById("chooseAvatar")
        .addEventListener("click", () => {
            document.getElementById("avatar").click();
        });

    document
        .getElementById("avatar")
        .addEventListener("change", previewAvatar);

    document
        .getElementById("first_name")
        .addEventListener("input", validateNameInput);

    document
        .getElementById("last_name")
        .addEventListener("input", validateNameInput);

}

async function loadProfile() {

    try {

        const profile =
            await ProfileService.getProfile();

        fillForm(profile);

    }

    catch (error) {

        console.error(error);

        alert("Unable to load profile.");

    }

}

function fillForm(profile) {

    const user = profile.user_data;

    document.getElementById("first_name").value =
        user.first_name || "";

    document.getElementById("last_name").value =
        user.last_name || "";

    document.getElementById("username").value =
        user.username || "";

    document.getElementById("email").value =
        user.email || "";

    document.getElementById("phone_number").value =
        user.phone_number || "";

    document.getElementById("role").value =
        user.role || "";

    document.getElementById("gender").value =
        profile.gender || "";

    document.getElementById("dob").value =
        profile.dob || "";

    document.getElementById("address").value =
        profile.address || "";

    document.getElementById("profileName").textContent =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.username;

    document.getElementById("profileEmailText").textContent =
        user.email || "";

    document.getElementById("profileRole").textContent =
        user.role || "";

    if (profile.avatar) {

        document.getElementById("avatarPreview").src =
            profile.avatar;

    }

    else {

        document.getElementById("avatarPreview").src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=180`;

    }

}

function previewAvatar(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {

        document.getElementById("avatarPreview").src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}

function validateNameInput(event) {

    event.target.value =
        event.target.value.replace(/[^A-Za-z\s]/g, "");

}

function validateName(name, fieldName) {

    if (!name) {

        throw new Error(`${fieldName} is required.`);

    }

    if (name.length < 2) {

        throw new Error(
            `${fieldName} must be at least 2 characters.`
        );

    }

    if (name.length > 50) {

        throw new Error(
            `${fieldName} must not exceed 50 characters.`
        );

    }

    const regex = /^[A-Za-z\s]+$/;

    if (!regex.test(name)) {

        throw new Error(
            `${fieldName} can contain only letters and spaces.`
        );

    }

}

async function updateProfile(event) {

    event.preventDefault();

    try {

        const firstName =
            document.getElementById("first_name").value.trim();

        const lastName =
            document.getElementById("last_name").value.trim();

        validateName(firstName, "First Name");
        validateName(lastName, "Last Name");

        const formData = new FormData();

        formData.append("first_name", firstName);

        formData.append("last_name", lastName);

        formData.append(
            "phone_number",
            document.getElementById("phone_number").value.trim()
        );

        formData.append(
            "gender",
            document.getElementById("gender").value
        );

        formData.append(
            "dob",
            document.getElementById("dob").value
        );

        formData.append(
            "address",
            document.getElementById("address").value.trim()
        );

        const avatar =
            document.getElementById("avatar").files[0];

        if (avatar) {

            formData.append("avatar", avatar);

        }

        await ProfileService.updateProfile(formData);

        alert("Profile updated successfully.");

        await loadProfile();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to update profile."
        );

    }

}