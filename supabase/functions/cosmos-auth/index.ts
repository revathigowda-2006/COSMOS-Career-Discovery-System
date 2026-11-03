
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_KEY =
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !PUBLIC_KEY) {
    throw new Error("Required Supabase environment variables are missing.");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

const publicClient = createClient(SUPABASE_URL, PUBLIC_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

function response(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });
}

function studentEmail(username: string) {
    return `${username}@cosmos.invalid`;
}

async function findAuthUser(email: string) {
    for (let page = 1; page <= 10; page++) {
        const { data, error } =
            await admin.auth.admin.listUsers({
                page,
                perPage: 1000
            });

        if (error) throw error;

        const found = data.users.find(
            user => user.email?.toLowerCase() === email.toLowerCase()
        );

        if (found) return found;
        if (data.users.length < 1000) break;
    }

    return null;
}

async function signInStudent(
    email: string,
    password: string
) {
    return await publicClient.auth.signInWithPassword({
        email,
        password
    });
}

async function loginStudent(username: string, password: string) {
    const { data: student, error: studentError } = await admin
        .from("students")
        .select(
            "id, full_name, username, password_hash, role, department, career_direction, auth_user_id"
        )
        .eq("username", username)
        .eq("role", "student")
        .maybeSingle();

    if (studentError || !student) {
        return response({
            success: false,
            message: "Invalid username or password."
        }, 401);
    }

    const email = studentEmail(student.username);
    let authUserId = student.auth_user_id as string | null;
    let createdAuthUser = false;

    // First try the existing Supabase Auth account.
    if (authUserId) {
        let signIn = await signInStudent(email, password);

        // Migrate the old password only if it matches the legacy value.
        if (signIn.error) {
            if (
                !student.password_hash ||
                student.password_hash !== password
            ) {
                return response({
                    success: false,
                    message: "Invalid username or password."
                }, 401);
            }

            const { error: updateError } =
                await admin.auth.admin.updateUserById(
                    authUserId,
                    { password }
                );

            if (updateError) {
                console.error("Password migration error:", updateError);
                return response({
                    success: false,
                    message: "Unable to update your login securely. Please contact support."
                }, 500);
            }

            signIn = await signInStudent(email, password);
        }

        if (signIn.error || !signIn.data.session) {
            return response({
                success: false,
                message: "Unable to sign in. Please try again."
            }, 401);
        }

        // Clear the old password only after successful Auth login.
        if (student.password_hash) {
            await admin
                .from("students")
                .update({ password_hash: null })
                .eq("id", student.id);
        }

        return response({
            success: true,
            message: "Login successful.",
            session: signIn.data.session,
            user: {
                id: student.id,
                auth_user_id: authUserId,
                full_name: student.full_name,
                username: student.username,
                role: "student",
                department: student.department,
                career_direction: student.career_direction
            }
        });
    }

    // Account has no Auth link yet. Verify its old password first.
    if (
        !student.password_hash ||
        student.password_hash !== password
    ) {
        return response({
            success: false,
            message: "Invalid username or password."
        }, 401);
    }

    // Reuse an existing Auth account if one already exists.
    let authUser = await findAuthUser(email);

    if (authUser) {
        authUserId = authUser.id;

        const { error } = await admin.auth.admin.updateUserById(
            authUserId,
            { password }
        );

        if (error) {
            console.error("Existing Auth account update error:", error);
            return response({
                success: false,
                message: "Unable to migrate this account. Please contact support."
            }, 500);
        }
    } else {
        const { data, error } =
            await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    username: student.username,
                    full_name: student.full_name,
                    role: "student"
                }
            });

        if (error || !data.user) {
            console.error("Auth account creation error:", error);
            return response({
                success: false,
                message: "Unable to migrate this account. Please contact support."
            }, 500);
        }

        authUserId = data.user.id;
        createdAuthUser = true;
    }

    // Connect the existing student row to its Auth account.
    const { error: linkError } = await admin
        .from("students")
        .update({ auth_user_id: authUserId })
        .eq("id", student.id);

    if (linkError) {
        console.error("Account linking error:", linkError);

        if (createdAuthUser && authUserId) {
            await admin.auth.admin.deleteUser(authUserId);
        }

        return response({
            success: false,
            message: "Unable to link your account. Your old password is still preserved."
        }, 500);
    }

    const signIn = await signInStudent(email, password);

    if (signIn.error || !signIn.data.session) {
        return response({
            success: false,
            message: "Account migration started, but login failed. Please try again."
        }, 401);
    }

    // Password migration is complete. Remove the old password value.
    await admin
        .from("students")
        .update({ password_hash: null })
        .eq("id", student.id);

    return response({
        success: true,
        message: "Your account was securely migrated.",
        session: signIn.data.session,
        user: {
            id: student.id,
            auth_user_id: authUserId,
            full_name: student.full_name,
            username: student.username,
            role: "student",
            department: student.department,
            career_direction: student.career_direction
        }
    });
}

async function registerStudent(body: Record<string, unknown>) {
    const fullName = String(body.fullName ?? "").trim();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const department = String(body.department ?? "").trim();
    const careerDirection =
        String(body.careerDirection ?? "").trim();

    if (
        fullName.length < 2 ||
        username.length < 3 ||
        !/^[a-zA-Z0-9_]+$/.test(username) ||
        password.length < 6 ||
        !department ||
        !careerDirection
    ) {
        return response({
            success: false,
            message: "Please check all registration details."
        }, 400);
    }

    const { data: existingStudent, error: checkError } = await admin
        .from("students")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (checkError) {
        console.error("Student lookup error:", checkError);
        return response({
            success: false,
            message: "Unable to check registration. Please try again."
        }, 500);
    }

    if (existingStudent) {
        return response({
            success: false,
            message: "This username is already registered."
        }, 409);
    }

    const email = studentEmail(username);

    const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username,
                full_name: fullName,
                role: "student"
            }
        });

    if (authError || !authData.user) {
        console.error("Registration Auth error:", authError);
        return response({
            success: false,
            message: "Unable to create your account. Please try again."
        }, 400);
    }

    const { data: student, error: insertError } = await admin
        .from("students")
        .insert({
            full_name: fullName,
            username,
            password_hash: null,
            role: "student",
            department,
            career_direction: careerDirection,
            auth_user_id: authData.user.id
        })
        .select(
            "id, full_name, username, role, department, career_direction, auth_user_id"
        )
        .single();

    if (insertError || !student) {
        // Avoid leaving an Auth account behind if registration fails.
        await admin.auth.admin.deleteUser(authData.user.id);

        console.error("Student insert error:", insertError);

        return response({
            success: false,
            message: "Unable to save student details. Please try again."
        }, 400);
    }

    return response({
        success: true,
        message: "Account created successfully.",
        user: student
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return response({
            success: false,
            message: "Method not allowed."
        }, 405);
    }

    try {
        const body = await req.json();

        const action = String(body.action ?? "");

        if (action === "login") {
            const username = String(body.username ?? "")
                .trim()
                .toLowerCase();
            const password = String(body.password ?? "");

            if (!username || !password) {
                return response({
                    success: false,
                    message: "Enter your username and password."
                }, 400);
            }

            return await loginStudent(username, password);
        }

        if (action === "register") {
            return await registerStudent(body);
        }

        return response({
            success: false,
            message: "Invalid authentication action."
        }, 400);

    } catch (error) {
        console.error("COSMOS authentication error:", error);

        return response({
            success: false,
            message: "Something went wrong. Please try again."
        }, 500);
    }
});
