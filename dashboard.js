
/* =========================================================
   COSMOS STUDENT DASHBOARD
   Personalized student profile and journey status
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       1. STUDENT LOGIN CHECK
       ===================================================== */

    if (
        typeof requireCosmosStudent === "function" &&
        !requireCosmosStudent()
    ) {
        return;
    }

    let user =
        typeof getCurrentCosmosUser === "function"
            ? getCurrentCosmosUser()
            : null;

    if (!user) return;

    /* =====================================================
       2. LOAD STUDENT PROFILE
       ===================================================== */

    user = await loadStudentProfile(user);

    const studentName = user?.full_name || "Student";
    const department = user?.department || "";
    const careerDirection =
        user?.career_direction || user?.careerDirection || "";

    setText("studentName", studentName);
    setText("profileName", studentName);
    setText("profileUsername", "@" + (user?.username || "student"));

    setText(
        "profileAvatar",
        studentName.charAt(0).toUpperCase()
    );

    setText(
        "dashboardAvatar",
        studentName.charAt(0).toUpperCase()
    );

    setText("dashboardProfileName", studentName);
    setText("dashboardUsername", user?.username || "username");

    setText(
        "studentDepartment",
        department ? formatDepartment(department) : "Not provided"
    );

    setText(
        "studentCareerDirection",
        careerDirection
            ? formatCareerDirection(careerDirection)
            : "Not provided"
    );

    setText(
        "dashboardIntro",
        getPersonalizedIntroduction(department, careerDirection)
    );

    /* =====================================================
       3. PERSONALIZED CAREER IDEAS
       ===================================================== */

    renderCareerIdeas(department, careerDirection);

    /* =====================================================
       4. LOAD SAVED COSMOS RESULTS
       ===================================================== */

    const assessment =
        readCosmosResult("cosmos_assessment_result") ||
        readCosmosResult("cosmos_assessment");

    const resume = readCosmosResult("cosmos_resume");
    const career = readCosmosResult("cosmos_career");
    const certificate = readCosmosResult("cosmos_certificate");
    const test = readCosmosResult("cosmos_test");

    /* =====================================================
       5. GET JOURNEY STATUS
       ===================================================== */

    const journey = getJourneyStatus({
        assessment,
        resume,
        career,
        certificate,
        test
    });

    /* =====================================================
       6. CAREER ASSESSMENT STATUS
       ===================================================== */

    setText(
        "assessmentStatus",
        journey.assessment ? "Completed ✓" : "Not Started"
    );

    /* =====================================================
       7. RESUME ANALYSIS STATUS
       ===================================================== */

    setText(
        "resumeStatus",
        journey.resume ? "Analyzed ✓" : "Not Analyzed"
    );

    /* =====================================================
       8. TECHNICAL TEST STATUS
       ===================================================== */

    const testStatus = document.getElementById("testStatus");

    if (testStatus) {
        if (!journey.test) {
            testStatus.textContent = "Not Attempted";
        } else {
            const passed =
                test?.passed === true ||
                test?.passed === "true";

            const percentage = numberFrom(
                test?.percentage,
                test?.scorePercentage,
                test?.score
            );

            testStatus.textContent =
                percentage === null
                    ? (
                        passed
                            ? "Completed ✓ — Passed"
                            : "Completed ✓"
                    )
                    : `Completed ✓ — ${
                        passed ? "Passed" : "Score"
                    } (${percentage}%)`;
        }
    }

    /* =====================================================
       9. CAREER MATCH STATUS
       ===================================================== */

    const testPassed =
        journey.test &&
        (
            test?.passed === true ||
            test?.passed === "true"
        );

    const finalCareer =
        career?.career ||
        career?.recommendedCareer ||
        career?.title ||
        (testPassed ? test?.recommendedCareer : null) ||
        (testPassed ? resume?.career : null) ||
        (testPassed ? assessment?.career : null);

    if (journey.career && finalCareer) {
        setText("careerStatus", finalCareer);
    } else if (!journey.test) {
        setText("careerStatus", "Discover");
    } else if (!testPassed) {
        setText(
            "careerStatus",
            "Test Completed — Pass to Unlock"
        );
    } else {
        setText(
            "careerStatus",
            finalCareer || "Career Recommendations Unlocked"
        );
    }

    /* =====================================================
       10. FINAL CAREER RECOMMENDATION
       ===================================================== */

    if (journey.test && !testPassed) {
        setText(
            "recommendedCareer",
            "Career Recommendations Locked"
        );

        setText(
            "recommendationText",
            "Your technical test has been submitted. Final COSMOS career recommendations remain locked until you pass."
        );
    } else if (testPassed && finalCareer) {
        setText("recommendedCareer", finalCareer);

        setText(
            "recommendationText",
            `Based on your COSMOS results, ${finalCareer} may be a suitable career direction for you.`
        );
    }

    /* =====================================================
       11. JOURNEY PROGRESS
       ===================================================== */

    const steps = [
        ["stepAssessment", journey.assessment],
        ["stepDiscover", journey.discover],
        ["stepResume", journey.resume],
        ["stepTest", journey.test],
        ["stepCareer", journey.career],
        ["stepCertificate", journey.certificate]
    ];

    const completed = steps.filter(([, done]) => done).length;

    const percentage = Math.round(
        (completed / steps.length) * 100
    );

    setText("progressPercentage", percentage + "%");

    const progressFill = document.getElementById("progressFill");

    if (progressFill) {
        progressFill.style.width = percentage + "%";
    }

    steps.forEach(([id, done]) => updateStep(id, done));

    /* =====================================================
       12. LOGOUT BUTTON
       ===================================================== */

    document
        .getElementById("logoutButton")
        ?.addEventListener("click", () => {
            if (typeof logoutCosmosUser === "function") {
                logoutCosmosUser();
            }
        });
});


/* =========================================================
   LOAD STUDENT PROFILE THROUGH SUPABASE RPC
   Requires public.get_cosmos_student_profile(TEXT)
   ========================================================= */

async function loadStudentProfile(user) {
    if (!user?.username) return user;

    const hasPreferences =
        Boolean(user.department) &&
        Boolean(user.career_direction || user.careerDirection);

    if (hasPreferences) return user;

    try {
        if (typeof waitForSupabase !== "function") {
            console.warn("COSMOS Supabase helper is unavailable.");
            return user;
        }

        const supabase = await waitForSupabase();

        const { data, error } = await supabase.rpc(
            "get_cosmos_student_profile",
            {
                p_username: user.username
            }
        );

        if (error) {
            throw error;
        }

        if (data && typeof data === "object") {
            return {
                ...user,
                department: data.department ?? user.department,
                career_direction:
                    data.career_direction ?? user.career_direction
            };
        }

        console.warn(
            "No profile details were returned for this username."
        );
    } catch (error) {
        console.warn(
            "Unable to load COSMOS student profile:",
            error.message || error
        );
    }

    return user;
}


/* =========================================================
   FORMAT DEPARTMENT LABEL
   ========================================================= */

function formatDepartment(value) {
    const labels = {
        commerce: "Commerce",
        management: "Management",
        computer_science: "Computer Science / IT",
        engineering: "Engineering",
        science: "Science",
        arts_humanities: "Arts and Humanities",
        other: "Other Departments"
    };

    return labels[value] ||
        String(value)
            .replace(/_/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
}


/* =========================================================
   FORMAT CAREER DIRECTION LABEL
   ========================================================= */

function formatCareerDirection(value) {
    const labels = {
        mnc: "MNC and Corporate Jobs",
        technology: "IT and Technical Careers",
        business: "Business and Entrepreneurship",
        government: "Government Jobs",
        creative: "Creative and Professional Careers",
        explore: "Explore Different Careers"
    };

    return labels[value] ||
        String(value)
            .replace(/_/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
}


/* =========================================================
   PERSONALIZED INTRODUCTION
   ========================================================= */

function getPersonalizedIntroduction(department, direction) {
    if (!department && !direction) {
        return "Your personalized career journey starts here. Explore your strengths, build your skills and discover career opportunities that match your goals.";
    }

    const departmentName = department
        ? formatDepartment(department)
        : "your field";

    const directionName = direction
        ? formatCareerDirection(direction)
        : "your career interests";

    return `Your ${departmentName} background and interest in ${directionName} can guide your next steps. Explore career ideas, build relevant skills and continue your COSMOS journey.`;
}


/* =========================================================
   CAREER IDEAS BY DEPARTMENT AND CAREER DIRECTION
   These are exploration suggestions, not final test results.
   ========================================================= */

function renderCareerIdeas(department, direction) {
    const heading = document.getElementById("recommendedCareer");
    const guidance = document.getElementById("careerGuidance");
    const list = document.getElementById("careerIdeas");

    if (!list) return;

    const departmentIdeas = {
        commerce: [
            "Accountant or Audit Assistant",
            "Financial Analyst",
            "Tax Associate",
            "Banking Associate",
            "Business Operations Executive"
        ],

        management: [
            "Business Development Executive",
            "Marketing Associate",
            "Human Resources Associate",
            "Operations Coordinator",
            "Management Trainee"
        ],

        computer_science: [
            "Software Developer",
            "Web Developer",
            "Data Analyst",
            "Cybersecurity Analyst",
            "Cloud Support Associate"
        ],

        engineering: [
            "Graduate Engineer Trainee",
            "Quality Analyst",
            "Project Coordinator",
            "Technical Support Engineer",
            "Operations Engineer"
        ],

        science: [
            "Research Assistant",
            "Laboratory Analyst",
            "Quality Control Analyst",
            "Data Analyst",
            "Science Educator"
        ],

        arts_humanities: [
            "Content Writer",
            "Communications Associate",
            "Public Relations Assistant",
            "Human Resources Associate",
            "Social Research Assistant"
        ],

        other: [
            "Project Coordinator",
            "Customer Success Associate",
            "Business Operations Executive",
            "Content Associate",
            "Administrative Associate"
        ]
    };

    const directionIdeas = {
        mnc: [
            "Management Trainee",
            "Business Operations Associate",
            "Customer Success Associate"
        ],

        technology: [
            "Data Analyst",
            "IT Support Associate",
            "Software or Technical Trainee"
        ],

        business: [
            "Business Development Executive",
            "Marketing Associate",
            "Entrepreneurship or Startup Operations"
        ],

        government: [
            "Explore eligible public-service examinations",
            "Banking and government recruitment exams",
            "Public administration-related roles"
        ],

        creative: [
            "Content Writer",
            "Digital Marketing Associate",
            "Communications or Design-related roles"
        ],

        explore: [
            "Compare careers across different industries",
            "Try beginner-friendly courses in new fields",
            "Use assessment results to narrow your options"
        ]
    };

    let ideas = departmentIdeas[department] ||
        departmentIdeas.other;

    if (direction && directionIdeas[direction]) {
        const combined = [
            ...directionIdeas[direction],
            ...ideas
        ];

        ideas = [...new Set(combined)].slice(0, 5);
    } else {
        ideas = ideas.slice(0, 5);
    }

    if (heading) {
        heading.textContent = "Career Ideas to Explore";
    }

    if (guidance) {
        guidance.textContent =
            "These are starting points based on your selected department and career direction. Your interests, skills, assessment and qualifications also matter.";
    }

    list.replaceChildren();

    ideas.forEach(idea => {
        const item = document.createElement("li");
        item.textContent = idea;
        list.appendChild(item);
    });
}


/* =========================================================
   SET ELEMENT TEXT SAFELY
   ========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   READ COSMOS RESULT
   ========================================================= */

function readCosmosResult(key) {
    const local = readStoredValue(localStorage, key);
    const session = readStoredValue(sessionStorage, key);

    if (local && typeof local === "object") {
        return local;
    }

    if (session && typeof session === "object") {
        return session;
    }

    if (typeof getCosmosSession === "function") {
        try {
            const savedSession = getCosmosSession(key);

            if (savedSession && typeof savedSession === "object") {
                return savedSession;
            }
        } catch (error) {
            console.warn(
                "Unable to read COSMOS session:",
                key,
                error
            );
        }
    }

    if (local !== null) return local;
    if (session !== null) return session;

    return null;
}


/* =========================================================
   READ STORAGE VALUE
   ========================================================= */

function readStoredValue(storage, key) {
    try {
        const raw = storage.getItem(key);

        if (raw === null) return null;

        try {
            return JSON.parse(raw);
        } catch (error) {
            return raw;
        }
    } catch (error) {
        console.error("Unable to read " + key, error);
        return null;
    }
}


/* =========================================================
   GET NUMERIC VALUE
   ========================================================= */

function numberFrom(...values) {
    for (const value of values) {
        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            Number.isFinite(Number(value))
        ) {
            return Number(value);
        }
    }

    return null;
}


/* =========================================================
   CHECK ASSESSMENT RESULT
   ========================================================= */

function hasAssessmentResult(value) {
    return !!value &&
        typeof value === "object" &&
        (
            value.career ||
            value.recommendedCareer ||
            value.scores ||
            value.answers ||
            value.responses ||
            value.result
        );
}


/* =========================================================
   CHECK RESUME RESULT
   ========================================================= */

function hasResumeResult(value) {
    return !!value &&
        typeof value === "object" &&
        (
            value.analysis ||
            value.analyzedAt ||
            value.career ||
            (
                Array.isArray(value.skills) &&
                value.analyzedAt
            ) ||
            value.wordCount !== undefined ||
            value.actionWords !== undefined
        );
}


/* =========================================================
   CHECK TECHNICAL TEST RESULT
   ========================================================= */

function hasTestResult(value) {
    return !!value &&
        typeof value === "object" &&
        numberFrom(
            value.score,
            value.percentage,
            value.scorePercentage
        ) !== null;
}


/* =========================================================
   CHECK CAREER RESULT
   ========================================================= */

function hasCareerResult(value) {
    return !!value &&
        typeof value === "object" &&
        !!(
            value.career ||
            value.recommendedCareer ||
            value.title ||
            value.recommendation
        );
}


/* =========================================================
   CHECK CERTIFICATE RESULT
   ========================================================= */

function hasCertificateResult(value) {
    return !!value &&
        typeof value === "object" &&
        !!(
            value.number ||
            value.certificateNumber ||
            value.code
        );
}


/* =========================================================
   GET JOURNEY STATUS
   ========================================================= */

function getJourneyStatus(results = {}) {
    const assessment =
        hasAssessmentResult(results.assessment) ||
        localStorage.getItem("cosmos_assessment_completed") === "completed";

    const resume =
        hasResumeResult(results.resume) ||
        localStorage.getItem("cosmos_resume_completed") === "completed" ||
        localStorage.getItem("cosmos_resume_status") === "completed";

    const test =
        hasTestResult(results.test) ||
        localStorage.getItem("cosmos_test_completed") === "completed" ||
        localStorage.getItem("cosmos_test_status") === "completed";

    const career =
        hasCareerResult(results.career) ||
        localStorage.getItem("cosmos_career_completed") === "completed";

    const certificate =
        hasCertificateResult(results.certificate) ||
        localStorage.getItem("cosmos_certificate_completed") === "completed";

    const discover =
        localStorage.getItem("cosmos_discover_completed") === "completed" ||
        localStorage.getItem("cosmos_discover_completed") === "true" ||
        localStorage.getItem("cosmos_discover") === "completed" ||
        localStorage.getItem("cosmos_discover") === "true";

    return {
        assessment,
        discover,
        resume,
        test,
        career,
        certificate
    };
}


/* =========================================================
   UPDATE JOURNEY STEP APPEARANCE
   ========================================================= */

function updateStep(id, completed) {
    const element = document.getElementById(id);

    if (!element) return;

    element.classList.toggle("completed", completed);

    if (completed) {
        const number = element.querySelector("span");

        if (number) {
            number.textContent = "✓";
        }
    }
}
