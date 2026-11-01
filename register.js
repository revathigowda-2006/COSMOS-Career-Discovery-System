
/* =========================================================
   COSMOS REGISTRATION
   Supports department and career direction selection
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const message = document.getElementById("message");
    const button = document.getElementById("registerButton");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const departmentElement = document.getElementById("department");
        const careerDirectionElement =
            document.getElementById("careerDirection");

        message.className = "form-message";
        message.textContent = "";

        if (!departmentElement || !careerDirectionElement) {
            return showError(
                "Department and career direction fields are missing from register.html."
            );
        }

        const department = departmentElement.value;
        const careerDirection = careerDirectionElement.value;

        if (fullName.length < 2) {
            return showError("Please enter your full name.");
        }

        if (username.length < 3) {
            return showError(
                "Username must contain at least 3 characters."
            );
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return showError(
                "Username can contain only letters, numbers and underscore."
            );
        }

        if (password.length < 6) {
            return showError(
                "Password must contain at least 6 characters."
            );
        }

        if (password !== confirmPassword) {
            return showError("Passwords do not match.");
        }

        if (!department) {
            return showError("Please select your department.");
        }

        if (!careerDirection) {
            return showError("Please select your career direction.");
        }

        button.disabled = true;
        button.innerHTML = "Creating Account <span>...</span>";

        try {
            const result = await cosmosRPC("create_cosmos_user", {
                p_full_name: fullName,
                p_username: username,
                p_password: password,
                p_department: department,
                p_career_direction: careerDirection
            });

            const response = Array.isArray(result)
                ? result[0]
                : result;

            if (
                !response ||
                response.success !== true
            ) {
                throw new Error(
                    response?.message || "Registration failed."
                );
            }

            // Prevent a new student from inheriting older shared progress.
            if (typeof markCosmosAccountAsNew === "function") {
                markCosmosAccountAsNew(username);
            }

            showSuccess(
                "Account created successfully! Redirecting to login..."
            );

            form.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            console.error("COSMOS registration error:", error);

            showError(
                error.message ||
                "Unable to create account. Please try again."
            );

        } finally {
            button.disabled = false;
            button.innerHTML = "Create Account <span>→</span>";
        }
    });

    function showError(text) {
        message.className = "form-message error-message";
        message.textContent = text;
    }

    function showSuccess(text) {
        message.className = "form-message success-message";
        message.textContent = text;
    }
});
