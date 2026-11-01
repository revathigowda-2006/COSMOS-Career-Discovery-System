
/* =========================================================
   COSMOS - CERTIFICATE GENERATION
   STEP 06
   Supports ALL registered departments
   Requires completed journey + passed test (>= 60%)
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeCertificate);


/* =========================================================
   MAIN INITIALIZATION
   ========================================================= */

async function initializeCertificate() {
    const loading = document.getElementById("certificateLoading");
    const notEligible = document.getElementById("notEligible");
    const certificateArea = document.getElementById("certificateArea");

    if (!loading || !notEligible || !certificateArea) {
        console.error("COSMOS: Certificate HTML elements are missing.");
        alert("The certificate page could not load correctly. Please check certificate.html.");
        return;
    }

    loading.style.display = "block";
    notEligible.style.display = "none";
    certificateArea.style.display = "none";

    try {
        if (typeof requireCosmosStudent === "function") {
            const allowed = requireCosmosStudent();

            if (allowed === false) {
                loading.style.display = "none";
                return;
            }
        }

        const user = safeCall(() => {
            return typeof getCurrentCosmosUser === "function"
                ? getCurrentCosmosUser()
                : null;
        }, null);

        if (!user) {
            showCertificateMessage(
                "Please log in to your COSMOS student account.",
                "login.html",
                "Student Login →"
            );
            return;
        }

        const test = getSavedTestResult();
        const careerResult = getSavedCareerResult();
        const existingCertificate = getSavedCertificate();

        const journey = safeCall(() => {
            return typeof getJourneyStatus === "function"
                ? getJourneyStatus() || {}
                : {};
        }, {});

        /* -----------------------------------------------
           REQUIRED JOURNEY STAGES
           ----------------------------------------------- */

        const requiredStages = [
            {
                key: "assessment",
                label: "Career Assessment",
                url: "assessment.html"
            },
            {
                key: "discover",
                label: "Discover",
                url: "discover.html"
            },
            {
                key: "resume",
                label: "Resume Analysis",
                url: "dashboard.html"
            },
            {
                key: "test",
                label: "Department Test",
                url: "test.html"
            },
            {
                key: "career",
                label: "Career Recommendation",
                url: "careers.html"
            }
        ];

        const missingStage = requiredStages.find(stage => {
            return !isStageCompleted(
                stage.key,
                journey,
                test,
                careerResult
            );
        });

        if (missingStage) {
            showCertificateMessage(
                `Please complete the ${missingStage.label} stage before generating your certificate.`,
                missingStage.url,
                `Complete ${missingStage.label} →`
            );
            return;
        }

        /* -----------------------------------------------
           TEST PASS VALIDATION
           ----------------------------------------------- */

        if (!hasPassedTechnicalTest(test)) {
            showCertificateMessage(
                "You must score at least 60% in your department-specific test to receive your certificate.",
                "test.html",
                "Take Department Test →"
            );
            return;
        }

        /* -----------------------------------------------
           STUDENT DETAILS
           ----------------------------------------------- */

        const studentName =
            user.full_name ||
            user.fullName ||
            user.name ||
            existingCertificate?.studentName ||
            "Student";

        const department = getStudentDepartment(user);

        const career =
            careerResult?.career ||
            careerResult?.recommendedCareer ||
            careerResult?.title ||
            careerResult?.recommendation ||
            test?.recommendedCareer ||
            existingCertificate?.career ||
            "Career Recommendation";

        const score = getTestPercentage(test);

        const certificateId =
            existingCertificate?.certificateId ||
            createCertificateId(user);

        const savedDate = existingCertificate?.issueDate
            ? new Date(existingCertificate.issueDate)
            : new Date();

        const issueDate = Number.isNaN(savedDate.getTime())
            ? new Date()
            : savedDate;

        const certificateData = {
            certificateId,
            studentName,
            department,
            career,
            score,
            issueDate: issueDate.toISOString(),
            status: "VALID"
        };

        /* -----------------------------------------------
           DISPLAY CERTIFICATE
           ----------------------------------------------- */

        setText("studentName", studentName);
        setText("certificateCareer", career);
        setText("certificateScore", `${score}%`);
        setText("certificateNumber", certificateId);
        setText("certificateDepartment", department);

        setText(
            "issueDate",
            issueDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })
        );

        /* -----------------------------------------------
           SAVE CERTIFICATE LOCALLY
           ----------------------------------------------- */

        try {
            if (typeof saveCosmosSession === "function") {
                saveCosmosSession("cosmos_certificate", certificateData);
            } else {
                localStorage.setItem(
                    "cosmos_certificate",
                    JSON.stringify(certificateData)
                );
            }
        } catch (error) {
            console.warn("Could not save certificate locally:", error);
        }

        /* -----------------------------------------------
           COMPLETE CERTIFICATE JOURNEY
           ----------------------------------------------- */

        safeCall(() => {
            if (typeof completeCertificateJourney === "function") {
                completeCertificateJourney();
            }

            if (typeof completeJourneyStep === "function") {
                completeJourneyStep("certificate");
            }
        }, null);

        /* -----------------------------------------------
           PRINT AND PDF BUTTONS
           ----------------------------------------------- */

        const printButton = document.getElementById("printButton");
        const downloadButton = document.getElementById("downloadButton");

        if (printButton) {
            printButton.onclick = () => window.print();
        }

        if (downloadButton) {
            downloadButton.onclick = downloadCertificate;
        }

        loading.style.display = "none";
        notEligible.style.display = "none";
        certificateArea.style.display = "block";

        /* -----------------------------------------------
           SAVE TO SUPABASE
           ----------------------------------------------- */

        try {
            await saveCertificateToDatabase(certificateData);
        } catch (error) {
            console.warn("Certificate database save failed:", error);
        }

    } catch (error) {
        console.error("COSMOS certificate initialization error:", error);

        showCertificateMessage(
            "The certificate page encountered an error. Please refresh the page and try again.",
            "certificate.html",
            "Reload Certificate ↻"
        );

        const link = document.querySelector("#notEligible a");

        if (link) {
            link.onclick = event => {
                event.preventDefault();
                window.location.reload();
            };
        }
    }
}


/* =========================================================
   SAFE FUNCTION CALL
   ========================================================= */

function safeCall(callback, fallback) {
    try {
        return callback();
    } catch (error) {
        console.warn("COSMOS helper function error:", error);
        return fallback;
    }
}


/* =========================================================
   READ A STORAGE VALUE
   ========================================================= */

function readStoredValue(key) {
    for (const storage of [localStorage, sessionStorage]) {
        try {
            const raw = storage.getItem(key);

            if (raw === null) {
                continue;
            }

            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        } catch (error) {
            console.warn(`Could not read ${key}:`, error);
        }
    }

    return null;
}


/* =========================================================
   CHECK COMPLETION VALUE
   ========================================================= */

function isCompleted(value) {
    return value === true ||
        value === "true" ||
        value === "completed" ||
        (
            value &&
            typeof value === "object" &&
            (
                value.completed === true ||
                value.completed === "true" ||
                value.completed === "completed" ||
                value.status === "completed"
            )
        );
}


/* =========================================================
   CHECK EACH JOURNEY STAGE
   ========================================================= */

function isStageCompleted(key, journey, test, careerResult) {
    // Check the status returned by journey.js first.
    if (isCompleted(journey?.[key])) {
        return true;
    }

    const flagKeys = {
        assessment: [
            "cosmos_assessment",
            "cosmos_assessment_completed"
        ],
        discover: [
            "cosmos_discover",
            "cosmos_discover_completed"
        ],
        resume: [
            "cosmos_resume_status",
            "cosmos_resume_completed"
        ],
        test: [
            "cosmos_test_completed",
            "cosmos_test_status"
        ],
        career: [
            "cosmos_career_completed"
        ]
    };

    const keys = flagKeys[key] || [];

    for (const flag of keys) {
        if (isCompleted(readStoredValue(flag))) {
            return true;
        }
    }

    /* Resume analysis */

    if (key === "resume") {
        const resume = readStoredValue("cosmos_resume");

        if (
            resume &&
            typeof resume === "object" &&
            (
                resume.analysis != null ||
                resume.analyzedAt != null ||
                resume.career != null ||
                resume.skills != null
            )
        ) {
            return true;
        }

        if (typeof getCosmosSession === "function") {
            const savedResume = safeCall(
                () => getCosmosSession("cosmos_resume"),
                null
            );

            if (savedResume && typeof savedResume === "object") {
                return Boolean(
                    savedResume.analysis != null ||
                    savedResume.analyzedAt != null ||
                    savedResume.career != null ||
                    savedResume.skills != null
                );
            }
        }

        return false;
    }

    /* Department test */

    if (key === "test") {
        return hasPassedTechnicalTest(test);
    }

    /* Career recommendation */

    if (key === "career") {
        return Boolean(
            careerResult &&
            typeof careerResult === "object" &&
            (
                careerResult.career ||
                careerResult.recommendedCareer ||
                careerResult.title ||
                careerResult.recommendation
            )
        );
    }

    // Assessment and Discover require their completion flags.
    return false;
}


/* =========================================================
   READ TEST RESULT
   ========================================================= */

function getSavedTestResult() {
    if (typeof getCosmosSession === "function") {
        const result = safeCall(
            () => getCosmosSession("cosmos_test"),
            null
        );

        if (result && typeof result === "object") {
            return result;
        }
    }

    const possibleKeys = [
        "cosmos_test",
        "cosmos_test_result",
        "cosmosTestResult",
        "technicalTestResult"
    ];

    for (const key of possibleKeys) {
        const result = readStoredValue(key);

        if (result && typeof result === "object") {
            return result;
        }
    }

    return null;
}


/* =========================================================
   GET TEST PERCENTAGE
   ========================================================= */

function getTestPercentage(test) {
    if (!test || typeof test !== "object") {
        return 0;
    }

    const percentageFields = [
        "percentage",
        "scorePercentage",
        "percent",
        "resultPercentage",
        "finalPercentage",
        "percentageScore"
    ];

    for (const field of percentageFields) {
        const value = test[field];

        if (value !== undefined && value !== null && value !== "") {
            const percentage = Number(value);

            if (Number.isFinite(percentage)) {
                return Math.max(0, Math.min(100, percentage));
            }
        }
    }

    const score = Number(
        test.score ??
        test.marksObtained ??
        test.correctAnswers ??
        test.correctCount
    );

    const total = Number(
        test.totalQuestions ??
        test.total ??
        test.maxScore ??
        test.totalMarks ??
        test.questionCount
    );

    if (
        Number.isFinite(score) &&
        Number.isFinite(total) &&
        total > 0
    ) {
        return Math.max(
            0,
            Math.min(100, Math.round((score / total) * 100))
        );
    }

    if (
        test.score !== undefined &&
        test.score !== null &&
        test.score !== ""
    ) {
        const numericScore = Number(test.score);

        if (
            Number.isFinite(numericScore) &&
            numericScore >= 0 &&
            numericScore <= 100
        ) {
            return numericScore;
        }
    }

    return 0;
}


/* =========================================================
   PASS VALIDATION — ALL DEPARTMENTS
   Requires an actual score of at least 60%.
   ========================================================= */

function hasPassedTechnicalTest(test) {
    if (!test || typeof test !== "object") {
        return false;
    }

    if (test.passed === false || test.passed === "false") {
        return false;
    }

    return getTestPercentage(test) >= 60;
}


/* =========================================================
   GET SAVED CAREER RECOMMENDATION
   ========================================================= */

function getSavedCareerResult() {
    if (typeof getCosmosSession === "function") {
        const result = safeCall(
            () => getCosmosSession("cosmos_career"),
            null
        );

        if (result && typeof result === "object") {
            return result;
        }
    }

    const result = readStoredValue("cosmos_career");

    return result && typeof result === "object"
        ? result
        : null;
}


/* =========================================================
   GET STUDENT DEPARTMENT
   No hard-coded department restriction
   ========================================================= */

function getStudentDepartment(user) {
    const profile = readStoredValue("cosmosUser");

    const department =
        user?.department ||
        user?.department_name ||
        user?.departmentName ||
        user?.field ||
        user?.course ||
        profile?.department ||
        profile?.department_name ||
        profile?.departmentName ||
        profile?.field ||
        profile?.course ||
        "Not specified";

    return String(department).trim() || "Not specified";
}


/* =========================================================
   GET EXISTING CERTIFICATE
   ========================================================= */

function getSavedCertificate() {
    if (typeof getCosmosSession === "function") {
        const result = safeCall(
            () => getCosmosSession("cosmos_certificate"),
            null
        );

        if (result && typeof result === "object") {
            return result;
        }
    }

    const result = readStoredValue("cosmos_certificate");

    return result && typeof result === "object"
        ? result
        : null;
}


/* =========================================================
   SHOW ELIGIBILITY MESSAGE
   ========================================================= */

function showCertificateMessage(messageText, url, buttonText) {
    const loading = document.getElementById("certificateLoading");
    const notEligible = document.getElementById("notEligible");
    const message = document.getElementById("notEligibleMessage");
    const certificateArea = document.getElementById("certificateArea");

    if (loading) {
        loading.style.display = "none";
    }

    if (certificateArea) {
        certificateArea.style.display = "none";
    }

    if (notEligible) {
        notEligible.style.display = "block";
    }

    if (message) {
        message.textContent = messageText;
    }

    const link = notEligible?.querySelector("a");

    if (link) {
        link.href = url;
        link.textContent = buttonText;
    }

    console.info("COSMOS certificate:", messageText);
}


/* =========================================================
   DISPLAY TEXT SAFELY
   ========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = String(value ?? "");
    }
}


/* =========================================================
   CREATE UNIQUE CERTIFICATE ID
   ========================================================= */

function createCertificateId(user) {
    const username =
        user?.username ||
        user?.email ||
        user?.id ||
        user?.name ||
        "STUDENT";

    const namePart = String(username)
        .replace(/[^A-Za-z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase() || "STUD";

    const randomPart = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `COSMOS-${namePart}-${randomPart}`;
}


/* =========================================================
   DOWNLOAD CERTIFICATE AS PDF
   Requires html2pdf and a downloadButton element.
   ========================================================= */

async function downloadCertificate() {
    const certificateCard = document.querySelector(".certificate-card");
    const downloadButton = document.getElementById("downloadButton");

    if (!certificateCard) {
        alert("The certificate could not be found on this page.");
        return;
    }

    if (typeof html2pdf !== "function") {
        alert("The PDF tool did not load. Check your internet connection and refresh the page.");
        return;
    }

    const studentName =
        document.getElementById("studentName")?.textContent.trim() ||
        "Student";

    const certificateId =
        document.getElementById("certificateNumber")?.textContent.trim() ||
        "Certificate";

    const safeName = `${studentName}-${certificateId}`
        .replace(/[^A-Za-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const filename = `COSMOS-Certificate-${safeName}.pdf`;

    const originalText =
        downloadButton?.textContent || "Download / Save PDF";

    if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.textContent = "Preparing PDF...";
    }

    try {
        const options = {
            margin: 6,
            image: {
                type: "jpeg",
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#ffffff"
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "landscape"
            },
            pagebreak: {
                mode: ["avoid-all", "css", "legacy"]
            }
        };

        const pdfBlob = await html2pdf()
            .set(options)
            .from(certificateCard)
            .outputPdf("blob");

        if (!(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
            throw new Error("The PDF file was empty.");
        }

        const downloadUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
        }, 2000);

    } catch (error) {
        console.error("Certificate PDF download failed:", error);

        alert("The PDF could not be created. Refresh the page and try again.");
    } finally {
        if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.textContent = originalText;
        }
    }
}


/* =========================================================
   SAVE CERTIFICATE TO SUPABASE
   ========================================================= */

async function saveCertificateToDatabase(certificate) {
    try {
        const user = typeof getCurrentCosmosUser === "function"
            ? getCurrentCosmosUser()
            : null;

        if (!user?.id || typeof waitForSupabase !== "function") {
            console.warn("Certificate database save skipped.");
            return;
        }

        const supabase = await waitForSupabase();

        if (!supabase) {
            console.warn("Supabase client unavailable.");
            return;
        }

        const { error } = await supabase
            .from("certificates")
            .upsert(
                {
                    certificate_id: certificate.certificateId,
                    user_id: user.id,
                    student_name: certificate.studentName,
                    career: certificate.career,
                    score: certificate.score,
                    issue_date: certificate.issueDate,
                    status: certificate.status
                },
                {
                    onConflict: "certificate_id"
                }
            );

        if (error) {
            console.warn(
                "Certificate database save failed:",
                error.message
            );
        } else {
            console.log("Certificate saved successfully.");
        }

    } catch (error) {
        console.warn("Certificate database unavailable:", error);
    }
}
