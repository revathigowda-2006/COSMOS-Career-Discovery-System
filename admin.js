/* =========================================================
   COSMOS ADMIN DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ADMIN LOGIN CHECK
       ===================================================== */

    if (!requireCosmosAdmin()) {
        return;
    }


    /* =====================================================
       CURRENT ADMIN
       ===================================================== */

    const admin =
        getCurrentCosmosUser();


    document.getElementById(
        "adminName"
    ).textContent =
        admin?.full_name ||
        "Administrator";


    document.getElementById(
        "adminAvatar"
    ).textContent =
        "A";


    /* =====================================================
       LOGOUT
       ===================================================== */

    document.getElementById(
        "adminLogoutButton"
    ).addEventListener(
        "click",
        () => {

            logoutCosmosUser();

        }
    );


    /* =====================================================
       LOAD DATA
       ===================================================== */

    await loadAdminData();


    /* =====================================================
       SEARCH
       ===================================================== */

    setupSearch(
        "studentSearch",
        "studentsTableBody"
    );


    setupSearch(
        "certificateSearch",
        "certificatesTableBody"
    );

});


/* =========================================================
   ADMIN DATA
   ========================================================= */

let adminStudents = [];
let adminAssessments = [];
let adminTests = [];
let adminCertificates = [];


/* =========================================================
   LOAD ALL ADMIN DATA
   ========================================================= */

async function loadAdminData() {

    try {

        const supabase =
            await waitForSupabase();


        if (!supabase) {

            throw new Error(
                "Supabase connection unavailable."
            );

        }


        /*
         * Load all sections.
         *
         * Promise.allSettled is used so that
         * one unavailable table does not stop
         * the complete admin dashboard.
         */

        await Promise.allSettled([

            loadStudents(
                supabase
            ),

            loadAssessments(
                supabase
            ),

            loadTests(
                supabase
            ),

            loadCertificates(
                supabase
            )

        ]);


        updateStatistics();


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );


        updateStatistics();


        showAdminMessage(
            "Unable to connect to the database. Please check your Supabase configuration.",
            "error"
        );

    }

}


/* =========================================================
   STUDENTS
   ========================================================= */

async function loadStudents(
    supabase
) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("cosmos_users")
            .select(
                "id,full_name,username,created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        adminStudents =
            data || [];


        renderStudents();


    } catch (error) {

        console.warn(
            "Students could not be loaded:",
            error.message
        );


        adminStudents = [];


        renderStudents();

    }

}


/* =========================================================
   RENDER STUDENTS
   ========================================================= */

function renderStudents(
    list = adminStudents
) {

    const body =
        document.getElementById(
            "studentsTableBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (!list.length) {

        body.innerHTML = `
            <tr>
                <td colspan="4">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    list.forEach(
        student => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        student.full_name ||
                        "Student"
                    )}
                </td>

                <td>
                    @${escapeHTML(
                        student.username ||
                        ""
                    )}
                </td>

                <td>
                    ${formatDate(
                        student.created_at
                    )}
                </td>

                <td>
                    <span class="status-badge status-valid">
                        Active
                    </span>
                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ASSESSMENTS
   ========================================================= */

async function loadAssessments(
    supabase
) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("assessments")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        adminAssessments =
            data || [];


        renderAssessments();


    } catch (error) {

        console.warn(
            "Assessments could not be loaded:",
            error.message
        );


        adminAssessments = [];


        renderAssessments();

    }

}


/* =========================================================
   RENDER ASSESSMENTS
   ========================================================= */

function renderAssessments() {

    const body =
        document.getElementById(
            "assessmentsTableBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (!adminAssessments.length) {

        body.innerHTML = `
            <tr>
                <td colspan="7">
                    No assessment records found.
                </td>
            </tr>
        `;

        return;

    }


    adminAssessments.forEach(
        item => {

            const student =
                findStudentName(
                    item.user_id
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        student
                    )}
                </td>

                <td>
                    ${item.technical_score ?? 0}
                </td>

                <td>
                    ${item.analytical_score ?? 0}
                </td>

                <td>
                    ${item.creative_score ?? 0}
                </td>

                <td>
                    ${item.communication_score ?? 0}
                </td>

                <td>
                    ${item.leadership_score ?? 0}
                </td>

                <td>
                    ${escapeHTML(
                        item.recommended_career ||
                        "—"
                    )}
                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TECHNICAL TESTS
   ========================================================= */

async function loadTests(
    supabase
) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("test_results")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        adminTests =
            data || [];


        renderTests();


    } catch (error) {

        console.warn(
            "Tests could not be loaded:",
            error.message
        );


        adminTests = [];


        renderTests();

    }

}


/* =========================================================
   RENDER TESTS
   ========================================================= */

function renderTests() {

    const body =
        document.getElementById(
            "testsTableBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (!adminTests.length) {

        body.innerHTML = `
            <tr>
                <td colspan="6">
                    No test records found.
                </td>
            </tr>
        `;

        return;

    }


    adminTests.forEach(
        item => {

            const student =
                findStudentName(
                    item.user_id
                );


            const passed =
                item.passed === true;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        student
                    )}
                </td>

                <td>
                    ${item.score ?? 0}/
                    ${item.total_questions ?? 30}
                </td>

                <td>
                    ${item.percentage ?? 0}%
                </td>

                <td>
                    ${item.correct_answers ?? 0}
                </td>

                <td>
                    ${item.wrong_answers ?? 0}
                </td>

                <td>

                    <span class="status-badge ${
                        passed
                            ? "status-passed"
                            : "status-failed"
                    }">

                        ${
                            passed
                                ? "Passed"
                                : "Failed"
                        }

                    </span>

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   CERTIFICATES
   ========================================================= */

async function loadCertificates(
    supabase
) {

    try {

        const {
            data,
            error
        } = await supabase
            .from("certificates")
            .select("*")
            .order(
                "issue_date",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        adminCertificates =
            data || [];


        renderCertificates();


    } catch (error) {

        console.warn(
            "Certificates could not be loaded:",
            error.message
        );


        adminCertificates = [];


        renderCertificates();

    }

}


/* =========================================================
   RENDER CERTIFICATES
   ========================================================= */

function renderCertificates(
    list = adminCertificates
) {

    const body =
        document.getElementById(
            "certificatesTableBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (!list.length) {

        body.innerHTML = `
            <tr>
                <td colspan="6">
                    No certificates found.
                </td>
            </tr>
        `;

        return;

    }


    list.forEach(
        certificate => {

            const status =
                certificate.status ||
                "VALID";


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        certificate.certificate_id ||
                        "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        certificate.student_name ||
                        "Student"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        certificate.career ||
                        "—"
                    )}
                </td>

                <td>
                    ${certificate.score ?? 0}%
                </td>

                <td>
                    ${formatDate(
                        certificate.issue_date
                    )}
                </td>

                <td>

                    <span class="status-badge ${
                        status === "REVOKED"
                            ? "status-revoked"
                            : "status-valid"
                    }">

                        ${escapeHTML(
                            status
                        )}

                    </span>

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );


    const totalAssessments =
        document.getElementById(
            "totalAssessments"
        );


    const totalTests =
        document.getElementById(
            "totalTests"
        );


    const totalCertificates =
        document.getElementById(
            "totalCertificates"
        );


    const passedTests =
        document.getElementById(
            "passedTests"
        );


    const revokedCertificates =
        document.getElementById(
            "revokedCertificates"
        );


    if (totalStudents) {

        totalStudents.textContent =
            adminStudents.length;

    }


    if (totalAssessments) {

        totalAssessments.textContent =
            adminAssessments.length;

    }


    if (totalTests) {

        totalTests.textContent =
            adminTests.length;

    }


    if (totalCertificates) {

        totalCertificates.textContent =
            adminCertificates.length;

    }


    if (passedTests) {

        passedTests.textContent =
            adminTests.filter(
                test =>
                    test.passed === true
            ).length;

    }


    if (revokedCertificates) {

        revokedCertificates.textContent =
            adminCertificates.filter(
                certificate =>
                    certificate.status ===
                    "REVOKED"
            ).length;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch(
    inputId,
    tableId
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            const search =
                input.value
                    .trim()
                    .toLowerCase();


            /* ---------------------------------------------
               STUDENT SEARCH
               --------------------------------------------- */

            if (
                tableId ===
                "studentsTableBody"
            ) {

                const filtered =
                    adminStudents.filter(
                        student => {

                            const name =
                                (
                                    student.full_name ||
                                    ""
                                )
                                    .toLowerCase();


                            const username =
                                (
                                    student.username ||
                                    ""
                                )
                                    .toLowerCase();


                            return (
                                name.includes(
                                    search
                                ) ||
                                username.includes(
                                    search
                                )
                            );

                        }
                    );


                renderStudents(
                    filtered
                );

            }


            /* ---------------------------------------------
               CERTIFICATE SEARCH
               --------------------------------------------- */

            if (
                tableId ===
                "certificatesTableBody"
            ) {

                const filtered =
                    adminCertificates.filter(
                        certificate => {

                            const id =
                                (
                                    certificate.certificate_id ||
                                    ""
                                )
                                    .toLowerCase();


                            const student =
                                (
                                    certificate.student_name ||
                                    ""
                                )
                                    .toLowerCase();


                            return (
                                id.includes(
                                    search
                                ) ||
                                student.includes(
                                    search
                                )
                            );

                        }
                    );


                renderCertificates(
                    filtered
                );

            }

        }
    );

}


/* =========================================================
   FIND STUDENT NAME
   ========================================================= */

function findStudentName(
    userId
) {

    const student =
        adminStudents.find(
            item =>
                item.id === userId
        );


    return (
        student?.full_name ||
        "Student"
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "—";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "—";

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================================
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(
    text,
    type = "success"
) {

    const message =
        document.getElementById(
            "adminMessage"
        );


    if (!message) return;


    message.className =
        `admin-message ${type}`;


    message.textContent =
        text;

}