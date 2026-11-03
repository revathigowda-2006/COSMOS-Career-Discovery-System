
/* =========================================================
   COSMOS - FREE COURSES AND LEARNING RECORDS
   Technology + Commerce + Business + Finance
   Course progress | Certificate tracking
   ========================================================= */

const FREE_COURSES = [

    /* =====================================================
       TECHNOLOGY AND NETWORKING
       ===================================================== */

    {
        id: "cisco-networking",
        title: "Free Networking Academy Courses",
        provider: "Cisco Networking Academy",
        category: "networking",
        icon: "🌐",
        level: "Beginner",
        duration: "Varies by course",
        description:
            "Learn networking, cybersecurity, programming basics and digital skills through free learning resources.",
        url: "https://www.netacad.com/",
        accessLabel: "Free learning",
        freeNote:
            "Course availability and certificate conditions vary. Check the individual course details."
    },

    {
        id: "microsoft-learn",
        title: "Microsoft Learn Training",
        provider: "Microsoft",
        category: "cloud",
        icon: "☁️",
        level: "Beginner to Advanced",
        duration: "Self-paced",
        description:
            "Develop skills in cloud computing, Azure, Microsoft 365, data, AI and business technology.",
        url: "https://learn.microsoft.com/training/",
        accessLabel: "Free learning",
        freeNote:
            "Learning modules are free. Some professional certification exams may require payment."
    },

    {
        id: "google-career",
        title: "Google Career Certificates and Learning",
        provider: "Google",
        category: "career",
        icon: "🎓",
        level: "Beginner",
        duration: "Varies by program",
        description:
            "Explore career learning in data analytics, project management, digital marketing, IT support and other fields.",
        url: "https://grow.google/intl/en_in/",
        accessLabel: "Explore courses",
        freeNote:
            "Not every program is free. Check the course page for current fees, scholarships and certificate conditions."
    },

    {
        id: "khan-computing",
        title: "Khan Academy Computing",
        provider: "Khan Academy",
        category: "cloud",
        icon: "💻",
        level: "Beginner",
        duration: "Self-paced",
        description:
            "Explore computing concepts and develop foundational knowledge through guided lessons.",
        url: "https://www.khanacademy.org/computing",
        accessLabel: "Free learning",
        freeNote:
            "Learning resources are free. A professional completion certificate is not guaranteed."
    },

    /* =====================================================
       COMMERCE, ACCOUNTING AND FINANCE
       ===================================================== */

    {
        id: "shiksha-commerce",
        title: "Commerce Certificate Courses",
        provider: "Shiksha",
        category: "career",
        icon: "📚",
        level: "Beginner to Advanced",
        duration: "Varies by course",
        description:
            "Explore commerce-related online courses, including accounting, finance, banking, taxation and business subjects.",
        url: "https://www.shiksha.com/online-courses",
        accessLabel: "Explore courses",
        freeNote:
            "This is a course directory. Fees and certificate availability depend on the individual course provider."
    },

    {
        id: "collegedunia-commerce",
        title: "Commerce Certificate Course Directory",
        provider: "CollegeDunia",
        category: "career",
        icon: "📊",
        level: "Beginner to Advanced",
        duration: "Varies by course",
        description:
            "Discover commerce certificate courses and explore options related to accounting, finance, banking and business.",
        url: "https://collegedunia.com/courses/commerce/commerce-certificate-courses",
        accessLabel: "Explore courses",
        freeNote:
            "Check the individual course page for fees, eligibility, enrollment and certificate details."
    },

    {
        id: "khan-accounting",
        title: "Accounting and Financial Statements",
        provider: "Khan Academy",
        category: "career",
        icon: "🧾",
        level: "Beginner",
        duration: "Self-paced",
        description:
            "Understand accounting basics, financial statements and how businesses record and report financial information.",
        url: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme",
        accessLabel: "Free learning",
        freeNote:
            "Learning resources are free. A professional certificate may not be available."
    },

    {
        id: "nptel-accounting",
        title: "Foundations of Accounting and Finance",
        provider: "NPTEL",
        category: "career",
        icon: "📈",
        level: "Beginner",
        duration: "Check course schedule",
        description:
            "Build a foundation in accounting and finance concepts useful for commerce students and aspiring business professionals.",
        url: "https://onlinecourses.nptel.ac.in/noc26_ec06/preview",
        accessLabel: "View course",
        freeNote:
            "Check the current enrollment window. Learning access and optional certification exam fees may differ."
    },

    {
        id: "khan-economics",
        title: "Economics and Finance",
        provider: "Khan Academy",
        category: "career",
        icon: "💰",
        level: "Beginner",
        duration: "Self-paced",
        description:
            "Learn economics, financial concepts, markets and the principles behind personal and business finance.",
        url: "https://www.khanacademy.org/economics-finance-domain",
        accessLabel: "Free learning",
        freeNote:
            "Learning resources are free. A professional certificate is not guaranteed."
    },

    {
        id: "swayam-banking",
        title: "Banking and Financial Education",
        provider: "SWAYAM Plus",
        category: "career",
        icon: "🏦",
        level: "Beginner to Intermediate",
        duration: "Varies by course",
        description:
            "Explore learning opportunities in banking, finance and financial services relevant to commerce students.",
        url: "https://swayamplus.education.gov.in/catalog?free=1",
        accessLabel: "Explore free courses",
        freeNote:
            "Use the free-course filter and check the individual course for its current enrollment and certificate terms."
    },

    {
        id: "swayam-management",
        title: "Business and Management Courses",
        provider: "SWAYAM",
        category: "career",
        icon: "📋",
        level: "Beginner to Advanced",
        duration: "Varies by course",
        description:
            "Explore business management, marketing, economics, entrepreneurship and related academic subjects.",
        url: "https://www.swayam.gov.in/",
        accessLabel: "Explore courses",
        freeNote:
            "Many courses offer free learning. Certification exams or other course requirements may involve fees."
    },

    {
        id: "nptel-business",
        title: "Business and Management Learning",
        provider: "NPTEL",
        category: "career",
        icon: "🏢",
        level: "Beginner to Advanced",
        duration: "Varies by course",
        description:
            "Explore courses related to management, business, finance, economics and professional development.",
        url: "https://nptel.ac.in/courses",
        accessLabel: "Explore courses",
        freeNote:
            "Check the individual course for enrollment dates, learning access and certification exam fees."
    },

    {
        id: "swayam-digital-marketing",
        title: "Digital Marketing Courses",
        provider: "SWAYAM",
        category: "career",
        icon: "📱",
        level: "Beginner",
        duration: "Varies by course",
        description:
            "Explore digital marketing, online business, marketing strategy and related skills useful for commerce students.",
        url: "https://swayam.gov.in/search_courses?searchText=digital+marketing",
        accessLabel: "Explore courses",
        freeNote:
            "Course availability changes. Check the individual listing for fees and certificate conditions."
    },

    {
        id: "google-digital-skills",
        title: "Digital Skills and Career Learning",
        provider: "Google",
        category: "career",
        icon: "📣",
        level: "Beginner",
        duration: "Varies by learning resource",
        description:
            "Explore digital marketing, online business, career development and other digital skills.",
        url: "https://grow.google/intl/en_in/",
        accessLabel: "Explore learning",
        freeNote:
            "Some learning resources are free; not all programs or certificates are free."
    }

];


/* =========================================================
   CATEGORY LABELS
   ========================================================= */

const categoryLabels = {
    networking: "Networking",
    career: "Commerce & Career Skills",
    cloud: "Cloud & Technology"
};


/* =========================================================
   INITIALIZE FREE COURSES PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeFreeCourses);

function initializeFreeCourses() {

    /* -----------------------------------------------
       REQUIRE STUDENT LOGIN WHEN AUTH HELPERS EXIST
       ----------------------------------------------- */

    if (
        typeof requireCosmosStudent === "function" &&
        !requireCosmosStudent()
    ) {
        return;
    }

    const user =
        typeof getCurrentCosmosUser === "function"
            ? getCurrentCosmosUser()
            : null;

    /* -----------------------------------------------
       LOGOUT HANDLING
       ----------------------------------------------- */

    const logoutButton =
        document.getElementById("logoutBtn") ||
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            if (typeof logoutCosmosUser === "function") {
                logoutCosmosUser();
            } else if (typeof cosmosLogout === "function") {
                cosmosLogout();
            } else {
                window.location.href = "login.html";
            }
        });
    }

    /* -----------------------------------------------
       COURSE FILTER
       ----------------------------------------------- */

    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {
        categoryFilter.addEventListener("change", renderCourses);
    }

    /* -----------------------------------------------
       PROGRESS RANGE
       ----------------------------------------------- */

    const progressRange =
        document.getElementById("progressRange");

    if (progressRange) {
        progressRange.addEventListener("input", function () {
            const progressValue =
                document.getElementById("progressValue");

            if (progressValue) {
                progressValue.textContent =
                    `${progressRange.value}%`;
            }
        });
    }

    /* -----------------------------------------------
       COURSE FORM
       ----------------------------------------------- */

    const courseForm =
        document.getElementById("courseForm");

    if (courseForm) {
        courseForm.addEventListener("submit", saveCourseProgress);
    }

    /* -----------------------------------------------
       CLOSE DIALOG
       ----------------------------------------------- */

    const closeDialog =
        document.getElementById("closeDialog");

    const cancelDialog =
        document.getElementById("cancelDialog");

    if (closeDialog) {
        closeDialog.addEventListener("click", closeProgressDialog);
    }

    if (cancelDialog) {
        cancelDialog.addEventListener("click", closeProgressDialog);
    }

    const courseDialog =
        document.getElementById("courseDialog");

    if (courseDialog) {
        courseDialog.addEventListener("click", function (event) {
            if (event.target === courseDialog) {
                closeProgressDialog();
            }
        });
    }

    /* -----------------------------------------------
       COMPLETION AND CERTIFICATE FIELDS
       ----------------------------------------------- */

    const courseCompleted =
        document.getElementById("courseCompleted");

    if (courseCompleted) {
        courseCompleted.addEventListener("change", toggleCertificateFields);
    }

    toggleCertificateFields();

    /* -----------------------------------------------
       WELCOME STUDENT
       ----------------------------------------------- */

    const studentName =
        user?.full_name ||
        user?.fullName ||
        user?.username;

    const welcomeElement =
        document.getElementById("studentName") ||
        document.getElementById("welcomeName");

    if (welcomeElement && studentName) {
        welcomeElement.textContent = studentName;
    }

    /* -----------------------------------------------
       INITIAL RENDER
       ----------------------------------------------- */

    renderCourses();
    renderLearningRecords();
}


/* =========================================================
   RENDER COURSE CARDS
   ========================================================= */

function renderCourses() {

    const courseGrid =
        document.getElementById("courseGrid");

    if (!courseGrid) {
        console.warn("COSMOS: courseGrid element was not found.");
        return;
    }

    const categoryFilter =
        document.getElementById("categoryFilter");

    const selectedCategory =
        categoryFilter?.value || "all";

    const filteredCourses = FREE_COURSES.filter(course => {
        return (
            selectedCategory === "all" ||
            selectedCategory === course.category
        );
    });

    const records = getCourseRecords();

    if (filteredCourses.length === 0) {
        courseGrid.innerHTML = `
            <p class="empty-courses">
                No courses were found in this category.
            </p>
        `;
        return;
    }

    courseGrid.innerHTML = filteredCourses.map(course => {

        const record = records[course.id] || {};

        const progress = Math.max(
            0,
            Math.min(100, Number(record.progress) || 0)
        );

        const completed = Boolean(record.completed);

        const categoryName =
            categoryLabels[course.category] || "Career Learning";

        return `
            <article class="course-card">

                <div class="course-card-icon" aria-hidden="true">
                    ${escapeHtml(course.icon)}
                </div>

                <div class="course-card-content">

                    <span class="course-category">
                        ${escapeHtml(categoryName)}
                    </span>

                    <h3>${escapeHtml(course.title)}</h3>

                    <p class="course-provider">
                        ${escapeHtml(course.provider)}
                    </p>

                    <p class="course-description">
                        ${escapeHtml(course.description)}
                    </p>

                    <div class="course-meta">
                        <span>${escapeHtml(course.level)}</span>
                        <span>${escapeHtml(course.duration)}</span>
                    </div>

                    <div class="course-access-label">
                        ${escapeHtml(course.accessLabel)}
                    </div>

                    <div class="course-progress-area">

                        <div class="course-progress-heading">
                            <span>Your progress</span>
                            <strong>${progress}%</strong>
                        </div>

                        <div
                            class="course-progress-track"
                            role="progressbar"
                            aria-label="Course progress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="${progress}"
                        >
                            <div
                                class="course-progress-fill"
                                style="width: ${progress}%"
                            ></div>
                        </div>

                    </div>

                    ${
                        completed
                            ? `<p class="course-completed-status">
                                   ✓ Completed
                               </p>`
                            : ""
                    }

                    <p class="course-free-note">
                        ${escapeHtml(course.freeNote)}
                    </p>

                    <div class="course-card-actions">

                        <a
                            class="primary-btn course-open-link"
                            href="${escapeHtml(course.url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Course ↗
                        </a>

                        <button
                            type="button"
                            class="secondary-btn course-progress-button"
                            data-course-id="${escapeHtml(course.id)}"
                        >
                            ${
                                completed
                                    ? "Update Record"
                                    : "Track Progress"
                            }
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");

    /* -----------------------------------------------
       TRACK PROGRESS BUTTONS
       ----------------------------------------------- */

    courseGrid
        .querySelectorAll(".course-progress-button")
        .forEach(button => {

            button.addEventListener("click", function () {

                openProgressDialog(
                    button.dataset.courseId
                );

            });

        });

}


/* =========================================================
   OPEN COURSE PROGRESS DIALOG
   ========================================================= */

function openProgressDialog(courseId) {

    const course = FREE_COURSES.find(
        item => item.id === courseId
    );

    if (!course) {
        showToast("Course not found.", "error");
        return;
    }

    const records = getCourseRecords();
    const record = records[courseId] || {};

    const courseDialog =
        document.getElementById("courseDialog");

    const dialogCourseId =
        document.getElementById("dialogCourseId");

    const dialogTitle =
        document.getElementById("dialogTitle");

    const dialogProvider =
        document.getElementById("dialogProvider");

    const progressRange =
        document.getElementById("progressRange");

    const progressValue =
        document.getElementById("progressValue");

    const courseCompleted =
        document.getElementById("courseCompleted");

    const certificateTitle =
        document.getElementById("certificateTitle");

    const certificateUrl =
        document.getElementById("certificateUrl");

    const certificateDate =
        document.getElementById("certificateDate");

    const courseForm =
        document.getElementById("courseForm");

    if (!courseDialog) {
        showToast("The course progress dialog was not found.", "error");
        return;
    }

    if (dialogCourseId) {
        dialogCourseId.value = course.id;
    }

    if (dialogTitle) {
        dialogTitle.textContent = course.title;
    }

    if (dialogProvider) {
        dialogProvider.textContent = course.provider;
    }

    if (progressRange) {
        progressRange.value =
            Math.max(0, Math.min(100, Number(record.progress) || 0));
    }

    if (progressValue) {
        progressValue.textContent =
            `${progressRange?.value || 0}%`;
    }

    if (courseCompleted) {
        courseCompleted.checked = Boolean(record.completed);
    }

    if (certificateTitle) {
        certificateTitle.value = record.certificateTitle || "";
    }

    if (certificateUrl) {
        certificateUrl.value = record.certificateUrl || "";
    }

    if (certificateDate) {
        certificateDate.value = record.certificateDate || "";
    }

    if (courseForm) {
        courseForm.dataset.courseId = course.id;
    }

    toggleCertificateFields();

    if (typeof courseDialog.showModal === "function") {
        if (!courseDialog.open) {
            courseDialog.showModal();
        }
    } else {
        courseDialog.style.display = "block";
        courseDialog.setAttribute("open", "");
    }

}


/* =========================================================
   CLOSE PROGRESS DIALOG
   ========================================================= */

function closeProgressDialog() {

    const courseDialog =
        document.getElementById("courseDialog");

    if (!courseDialog) {
        return;
    }

    if (typeof courseDialog.close === "function") {
        if (courseDialog.open) {
            courseDialog.close();
        }
    } else {
        courseDialog.style.display = "none";
        courseDialog.removeAttribute("open");
    }

}


/* =========================================================
   SHOW OR HIDE CERTIFICATE FIELDS
   ========================================================= */

function toggleCertificateFields() {

    const courseCompleted =
        document.getElementById("courseCompleted");

    const certificateFields =
        document.getElementById("certificateFields");

    if (!certificateFields) {
        return;
    }

    const showFields = Boolean(courseCompleted?.checked);

    certificateFields.style.display =
        showFields ? "" : "none";

}


/* =========================================================
   SAVE COURSE PROGRESS
   ========================================================= */

function saveCourseProgress(event) {

    if (event) {
        event.preventDefault();
    }

    const dialogCourseId =
        document.getElementById("dialogCourseId");

    const courseForm =
        document.getElementById("courseForm");

    const progressRange =
        document.getElementById("progressRange");

    const courseCompleted =
        document.getElementById("courseCompleted");

    const certificateTitle =
        document.getElementById("certificateTitle");

    const certificateUrl =
        document.getElementById("certificateUrl");

    const certificateDate =
        document.getElementById("certificateDate");

    const courseId =
        dialogCourseId?.value ||
        courseForm?.dataset.courseId;

    const course = FREE_COURSES.find(
        item => item.id === courseId
    );

    if (!course) {
        showToast("Unable to identify this course.", "error");
        return;
    }

    const progress = Math.max(
        0,
        Math.min(100, Number(progressRange?.value) || 0)
    );

    const completed = Boolean(courseCompleted?.checked);

    if (completed && progress < 100) {
        showToast(
            "Set progress to 100% before marking a course completed.",
            "error"
        );
        return;
    }

    const title = certificateTitle?.value.trim() || "";
    const url = certificateUrl?.value.trim() || "";
    const date = certificateDate?.value || "";

    if (completed && url) {

        try {
            const parsedUrl = new URL(url);

            if (
                parsedUrl.protocol !== "https:" &&
                parsedUrl.protocol !== "http:"
            ) {
                showToast(
                    "Please enter a valid certificate link.",
                    "error"
                );
                return;
            }

        } catch (error) {
            showToast(
                "Please enter a valid certificate link.",
                "error"
            );
            return;
        }

    }

    const records = getCourseRecords();

    records[courseId] = {
        courseId: courseId,
        courseTitle: course.title,
        provider: course.provider,
        progress: completed ? 100 : progress,
        completed: completed,
        certificateTitle: completed ? title : "",
        certificateUrl: completed ? url : "",
        certificateDate: completed ? date : "",
        updatedAt: new Date().toISOString()
    };

    if (!saveCourseRecords(records)) {
        showToast(
            "Could not save your learning record. Please check browser storage.",
            "error"
        );
        return;
    }

    closeProgressDialog();
    renderCourses();
    renderLearningRecords();

    showToast(
        completed
            ? "Course completion record saved successfully."
            : "Course progress saved successfully.",
        "success"
    );

}


/* =========================================================
   GET COURSE RECORDS
   ========================================================= */

function getCourseRecords() {

    const storageKey = "cosmos_free_course_progress";

    try {

        const savedRecords = localStorage.getItem(storageKey);

        if (!savedRecords) {
            return {};
        }

        const parsedRecords = JSON.parse(savedRecords);

        if (
            !parsedRecords ||
            typeof parsedRecords !== "object" ||
            Array.isArray(parsedRecords)
        ) {
            return {};
        }

        return parsedRecords;

    } catch (error) {

        console.error(
            "COSMOS: Could not read course records.",
            error
        );

        return {};

    }

}


/* =========================================================
   SAVE COURSE RECORDS
   ========================================================= */

function saveCourseRecords(records) {

    try {

        localStorage.setItem(
            "cosmos_free_course_progress",
            JSON.stringify(records)
        );

        return true;

    } catch (error) {

        console.error(
            "COSMOS: Could not save course records.",
            error
        );

        return false;

    }

}


/* =========================================================
   ENSURE COURSE RECORD EXISTS
   ========================================================= */

function ensureCourseRecord(courseId) {

    const course = FREE_COURSES.find(
        item => item.id === courseId
    );

    if (!course) {
        return null;
    }

    const records = getCourseRecords();

    if (!records[courseId]) {

        records[courseId] = {
            courseId: courseId,
            courseTitle: course.title,
            provider: course.provider,
            progress: 0,
            completed: false,
            certificateTitle: "",
            certificateUrl: "",
            certificateDate: "",
            updatedAt: new Date().toISOString()
        };

        saveCourseRecords(records);

    }

    return records[courseId];

}


/* =========================================================
   RENDER STUDENT LEARNING RECORDS
   ========================================================= */

function renderLearningRecords() {

    const records = getCourseRecords();

    const recordEntries = Object.values(records);

    const startedRecords = recordEntries.filter(record =>
        Number(record.progress) > 0 || record.completed
    );

    const completedRecords = recordEntries.filter(record =>
        Boolean(record.completed)
    );

    const certificateRecords = completedRecords.filter(record =>
        Boolean(record.certificateUrl || record.certificateTitle)
    );

    /* -----------------------------------------------
       UPDATE SUMMARY COUNTS
       ----------------------------------------------- */

    const startedCount =
        document.getElementById("startedCount");

    const completedCount =
        document.getElementById("completedCount");

    const certificateCount =
        document.getElementById("certificateCount");

    if (startedCount) {
        startedCount.textContent = startedRecords.length;
    }

    if (completedCount) {
        completedCount.textContent = completedRecords.length;
    }

    if (certificateCount) {
        certificateCount.textContent = certificateRecords.length;
    }

    /* -----------------------------------------------
       LEARNING RECORD LIST
       ----------------------------------------------- */

    const myLearningList =
        document.getElementById("myLearningList");

    const emptyLearning =
        document.getElementById("emptyLearning");

    if (!myLearningList) {
        return;
    }

    if (emptyLearning) {
        emptyLearning.style.display =
            startedRecords.length === 0 ? "" : "none";
    }

    if (startedRecords.length === 0) {

        myLearningList.innerHTML = "";

        if (emptyLearning) {
            emptyLearning.style.display = "";
        }

        return;
    }

    myLearningList.innerHTML = startedRecords
        .sort((a, b) => {
            return new Date(b.updatedAt || 0) -
                   new Date(a.updatedAt || 0);
        })
        .map(record => {

            const progress = Math.max(
                0,
                Math.min(100, Number(record.progress) || 0)
            );

            const course = FREE_COURSES.find(
                item => item.id === record.courseId
            );

            const courseUrl = course?.url || "#";

            return `
                <article class="learning-record">

                    <div class="learning-record-info">

                        <h4>
                            ${escapeHtml(
                                record.courseTitle || "Course"
                            )}
                        </h4>

                        <p>
                            ${escapeHtml(
                                record.provider || "Course provider"
                            )}
                        </p>

                        <div class="course-progress-heading">
                            <span>
                                ${record.completed
                                    ? "Completed"
                                    : "In progress"}
                            </span>

                            <strong>${progress}%</strong>
                        </div>

                        <div
                            class="course-progress-track"
                            role="progressbar"
                            aria-label="Saved learning progress"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="${progress}"
                        >
                            <div
                                class="course-progress-fill"
                                style="width: ${progress}%"
                            ></div>
                        </div>

                        ${
                            record.certificateTitle
                                ? `<p class="certificate-record-title">
                                    Certificate:
                                    ${escapeHtml(record.certificateTitle)}
                                   </p>`
                                : ""
                        }

                        ${
                            record.certificateDate
                                ? `<p class="certificate-record-date">
                                    Earned on:
                                    ${escapeHtml(record.certificateDate)}
                                   </p>`
                                : ""
                        }

                        ${
                            record.certificateUrl
                                ? `<p class="certificate-record-link">
                                    <a
                                        href="${escapeHtml(record.certificateUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Certificate ↗
                                    </a>
                                   </p>`
                                : ""
                        }

                    </div>

                    <div class="learning-record-actions">

                        <a
                            href="${escapeHtml(courseUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Course ↗
                        </a>

                        <button
                            type="button"
                            class="secondary-btn edit-learning-record"
                            data-course-id="${escapeHtml(record.courseId || "")}"
                        >
                            Edit Progress
                        </button>

                    </div>

                </article>
            `;

        }).join("");

    /* -----------------------------------------------
       EDIT SAVED RECORDS
       ----------------------------------------------- */

    myLearningList
        .querySelectorAll(".edit-learning-record")
        .forEach(button => {

            button.addEventListener("click", function () {
                openProgressDialog(button.dataset.courseId);
            });

        });

}


/* =========================================================
   SHOW TOAST MESSAGE
   ========================================================= */

function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        console.log(`COSMOS: ${message}`);
        return;
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";

    if (toast.dataset.hideTimer) {
        clearTimeout(Number(toast.dataset.hideTimer));
    }

    const timerId = setTimeout(() => {
        toast.style.display = "none";
    }, 3500);

    toast.dataset.hideTimer = String(timerId);

}


/* =========================================================
   ESCAPE HTML
   Avoid inserting user-entered text as HTML.
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];

    });

}
