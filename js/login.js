
/* =========================================================
   COSMOS LOGIN
   Username + Password Authentication
   Supabase Auth session support
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");
    const button = document.getElementById("loginButton");

    if (!form || !message || !button) {
        console.error("COSMOS login form elements were not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        message.className = "form-message";
        message.textContent = "";

        if (!username || !password) {
            showError("Please enter your username and password.");
            return;
        }

        button.disabled = true;
        button.innerHTML = 'Logging in <span>...</span>';

        try {
            /* =============================================
               ADMIN LOGIN
               ============================================= */

            if (
                username === COSMOS_CONFIG.adminUsername &&
                password === COSMOS_CONFIG.adminPassword
            ) {
                const adminUser = {
                    id: "admin",
                    full_name: "Administrator",
                    username: "admin",
                    role: "admin"
                };

                setCurrentCosmosUser(adminUser);

                showSuccess("Admin login successful. Redirecting...");

                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 700);

                return;
            }

            /* =============================================
               STUDENT LOGIN THROUGH EDGE FUNCTION
               ============================================= */

            if (
                typeof cosmosSupabase === "undefined" ||
                !cosmosSupabase
            ) {
                throw new Error(
                    "COSMOS Supabase client is not initialized. Please check config.js."
                );
            }

            const { data, error } =
                await cosmosSupabase.functions.invoke("cosmos-auth", {
                    body: {
                        action: "login",
                        username,
                        password
                    }
                });

            if (error) {
                console.error("COSMOS Auth function error:", error);
                throw new Error(
                    "Unable to contact the authentication service. Please check the Edge Function deployment."
                );
            }

            if (!data || data.success !== true || !data.session || !data.user) {
                throw new Error(
                    data?.message || "Invalid username or password."
                );
            }

            /* =============================================
               SAVE REAL SUPABASE AUTH SESSION
               ============================================= */

            const { data: sessionData, error: sessionError } =
                await cosmosSupabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token
                });

            if (sessionError || !sessionData?.session || !sessionData?.user) {
                console.error(
                    "Could not save Supabase session:",
                    sessionError
                );

                throw new Error(
                    "Login was verified, but the Supabase session could not be saved. Please try again."
                );
            }

            /* =============================================
               SAVE COSMOS STUDENT PROFILE
               ============================================= */

            const student = data.user;

            const studentUser = {
                // Keep the COSMOS student record ID for app profile lookups.
                id: student.student_id || student.id,
                student_id: student.student_id || student.id,

                // The actual Supabase Auth user ID.
                auth_user_id: sessionData.user.id,

                full_name: student.full_name || "Student",
                username: student.username || username,
                role: student.role || "student",
                department: student.department || "",
                career_direction: student.career_direction || ""
            };

            setCurrentCosmosUser(studentUser);

            /* =============================================
               SUCCESS
               ============================================= */

            showSuccess("Login successful. Redirecting...");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 700);

        } catch (error) {
            console.error("COSMOS Login Error:", error);

            let errorMessage =
                error?.message || "Login failed. Please try again.";

            if (errorMessage.toLowerCase().includes("invalid username")) {
                errorMessage = "Invalid username or password.";
            }

            showError(errorMessage);

        } finally {
            button.disabled = false;
            button.innerHTML = 'Login <span>→</span>';
        }
    });

    /* =============================================
       SHOW ERROR
       ============================================= */

    function showError(text) {
        message.className = "form-message error-message";
        message.textContent = text;
    }

    /* =============================================
       SHOW SUCCESS
       ============================================= */

    function showSuccess(text) {
        message.className = "form-message success-message";
        message.textContent = text;
    }
});
