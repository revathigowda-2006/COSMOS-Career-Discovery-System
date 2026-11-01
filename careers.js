
/* =========================================================
   COSMOS - CAREER RECOMMENDATION
   STEP 05
   Department-Based Career Recommendation
   Technical test required | 60% pass mark
   Existing HTML and CSS remain unchanged
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. REQUIRE STUDENT LOGIN
       ===================================================== */

    if (
        typeof requireCosmosStudent === "function" &&
        !requireCosmosStudent()
    ) {
        return;
    }

    /* =====================================================
       2. READ SAVED DATA SAFELY
       ===================================================== */

    function readStoredValue(key) {
        for (const storage of [localStorage, sessionStorage]) {
            try {
                const value = storage.getItem(key);

                if (value === null) {
                    continue;
                }

                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            } catch (error) {
                console.warn(
                    "COSMOS storage read error:",
                    key,
                    error
                );
            }
        }

        return null;
    }

    function saveStoredValue(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn(
                "COSMOS localStorage save error:",
                key,
                error
            );
        }

        try {
            sessionStorage.setItem(
                key,
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn(
                "COSMOS sessionStorage save error:",
                key,
                error
            );
        }
    }

    /* =====================================================
       3. READ TECHNICAL TEST RESULT
       ===================================================== */

    function readTestResult() {
        const keys = [
            "cosmos_test",
            "cosmos_test_result",
            "cosmos_test_results",
            "cosmos_technical_test_result"
        ];

        for (const key of keys) {
            const result = readStoredValue(key);

            if (
                result &&
                typeof result === "object" &&
                !Array.isArray(result)
            ) {
                return result;
            }
        }

        if (typeof getCosmosSession === "function") {
            try {
                const result = getCosmosSession("cosmos_test");

                if (
                    result &&
                    typeof result === "object" &&
                    !Array.isArray(result)
                ) {
                    return result;
                }
            } catch (error) {
                console.warn(
                    "COSMOS test session read error:",
                    error
                );
            }
        }

        return null;
    }

    const test = readTestResult();

    /* =====================================================
       4. CALCULATE TEST PERCENTAGE
       ===================================================== */

    function getTestPercentage(result) {
        if (!result || typeof result !== "object") {
            return null;
        }

        const savedPercentage =
            result.percentage ??
            result.scorePercentage;

        if (
            savedPercentage !== undefined &&
            savedPercentage !== null &&
            savedPercentage !== "" &&
            Number.isFinite(Number(savedPercentage))
        ) {
            const value = Number(savedPercentage);

            if (value >= 0 && value <= 100) {
                return Math.round(value);
            }
        }

        const score = Number(result.score);

        const total = Number(
            result.totalQuestions ??
            result.total ??
            result.maxScore
        );

        if (
            Number.isFinite(score) &&
            Number.isFinite(total) &&
            total > 0 &&
            score >= 0 &&
            score <= total
        ) {
            return Math.round((score / total) * 100);
        }

        return null;
    }

    /* =====================================================
       5. CHECK PASS STATUS
       Required passing score: 60%
       ===================================================== */

    function hasPassedTest(result) {
        if (!result || typeof result !== "object") {
            return false;
        }

        // An explicit failed result must not unlock careers.
        if (
            result.passed === false ||
            result.passed === "false"
        ) {
            return false;
        }

        const percentage = getTestPercentage(result);

        if (percentage !== null) {
            return percentage >= 60;
        }

        // Use the saved passed flag only if a score
        // percentage cannot be calculated.
        return (
            result.passed === true ||
            result.passed === "true"
        );
    }

    const passed = hasPassedTest(test);
    const percentage = getTestPercentage(test);

    /* =====================================================
       6. CREATE CAREER ACCESS MESSAGE
       ===================================================== */

    let accessMessage =
        document.getElementById("careerAccessMessage");

    if (!accessMessage) {
        accessMessage = document.createElement("section");
        accessMessage.id = "careerAccessMessage";

        const main = document.querySelector("main");

        if (main) {
            main.prepend(accessMessage);
        } else {
            document.body.prepend(accessMessage);
        }
    }

    accessMessage.className = "career-access-message";
    accessMessage.setAttribute("role", "status");

    accessMessage.style.cssText = `
        max-width: 850px;
        margin: 35px auto;
        padding: 28px 24px;
        text-align: center;
        border-radius: 18px;
        background: #fff0e8;
        color: #332044;
        border: 1px solid #f4c5ad;
        font-family: 'Plus Jakarta Sans', sans-serif;
        line-height: 1.7;
        box-sizing: border-box;
    `;

    /* =====================================================
       7. IDENTIFY PROTECTED SECTIONS
       ===================================================== */

    const protectedSections = [
        document.querySelector(".career-recommendation-section"),
        document.querySelector(".careers-section"),
        document.querySelector(".career-completion-section"),
        document.querySelector(".job-opportunities-section")
    ].filter(Boolean);

    /* =====================================================
       8. LOCK CAREERS IF THE TEST WAS NOT PASSED
       ===================================================== */

    if (!passed) {

        protectedSections.forEach(section => {
            section.style.display = "none";
        });

        accessMessage.style.display = "block";

        const hasCompletedTest =
            Boolean(test) ||
            readStoredValue("cosmos_test_completed") === "completed" ||
            readStoredValue("cosmos_test_status") === "completed";

        let message;

        if (!hasCompletedTest) {
            message =
                "Please complete and pass the Technical Test first to unlock your career recommendations.";
        } else if (percentage !== null) {
            message =
                `Your technical test score is ${percentage}%. You need at least 60% to unlock career recommendations.`;
        } else {
            message =
                "Your technical test result could not be verified. Please check your saved test result.";
        }

        accessMessage.innerHTML = `
            <div style="font-size: 38px; margin-bottom: 12px;">
                🔒
            </div>

            <h2 style="margin: 0 0 12px; font-size: 25px;">
                Career Options Locked
            </h2>

            <p style="margin: 0 0 20px;">
                ${message}
            </p>

            <a
                href="test.html"
                style="
                    display: inline-block;
                    padding: 12px 24px;
                    border-radius: 10px;
                    background: #332044;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 700;
                "
            >
                ${
                    hasCompletedTest
                        ? "View Test Status"
                        : "Go to Technical Test"
                } →
            </a>
        `;

        console.log("COSMOS career access:", {
            unlocked: false,
            testFound: Boolean(test),
            percentage: percentage,
            passed: passed
        });

        return;
    }

    /* =====================================================
       9. UNLOCK CAREER SECTIONS
       ===================================================== */

    accessMessage.style.display = "none";

    protectedSections.forEach(section => {
        section.style.display = "";
    });

    /* =====================================================
       10. GET EXISTING HTML ELEMENTS
       ===================================================== */

    const recommendedCareer =
        document.getElementById("recommendedCareer");

    const recommendationDescription =
        document.getElementById("recommendationDescription");

    const technicalScore =
        document.getElementById("careerTechnicalScore");

    const assessmentStatus =
        document.getElementById("careerAssessmentStatus");

    const testStatus =
        document.getElementById("careerTestStatus");

    const continueButton =
        document.getElementById("continueCertificateBtn");

    /* =====================================================
       11. DEPARTMENT-WISE CAREER DATABASE
       ===================================================== */

    const departmentCareers = {

        commerce: {
            label: "Commerce",
            careers: [
                "Accountant",
                "Financial Analyst",
                "Banking Associate",
                "Tax Consultant",
                "Business Analyst",
                "Investment Analyst"
            ]
        },

        management: {
            label: "Management / Business Administration",
            careers: [
                "HR Executive",
                "Marketing Executive",
                "Business Development Associate",
                "Operations Manager",
                "Project Coordinator",
                "Business Analyst"
            ]
        },

        computer: {
            label: "Computer Science / IT",
            careers: [
                "Software Developer",
                "Data Analyst",
                "AI / ML Engineer",
                "Web Developer",
                "Cybersecurity Analyst",
                "Cloud Engineer",
                "Database Administrator",
                "UI/UX Designer"
            ]
        },

        arts: {
            label: "Arts / Humanities",
            careers: [
                "Content Writer",
                "Journalism Professional",
                "Digital Marketing Specialist",
                "Social Media Executive",
                "Research Assistant",
                "Public Relations Executive"
            ]
        },

        science: {
            label: "Science",
            careers: [
                "Research Assistant",
                "Laboratory Analyst",
                "Data Analyst",
                "Scientific Content Writer",
                "Quality Control Analyst",
                "Environmental Analyst"
            ]
        },

        design: {
            label: "Design / Creative Studies",
            careers: [
                "UI/UX Designer",
                "Graphic Designer",
                "Web Designer",
                "Video Editor",
                "Content Creator",
                "Digital Marketing Specialist"
            ]
        },

        healthcare: {
            label: "Healthcare / Life Sciences",
            careers: [
                "Healthcare Administrator",
                "Medical Laboratory Technologist",
                "Clinical Research Assistant",
                "Public Health Assistant",
                "Medical Records Specialist",
                "Healthcare Data Analyst"
            ]
        },

        engineering: {
            label: "Engineering",
            careers: [
                "Graduate Engineer Trainee",
                "Quality Assurance Engineer",
                "Project Engineer",
                "CAD Design Engineer",
                "Data Analyst",
                "Technical Support Engineer"
            ]
        },

        general: {
            label: "General / Other Departments",
            careers: [
                "Business Analyst",
                "Digital Marketing Specialist",
                "HR Executive",
                "Content Writer",
                "Project Coordinator",
                "Data Analyst"
            ]
        }
    };

    /* =====================================================
       12. CAREER DESCRIPTIONS
       ===================================================== */

    const careerDescriptions = {
        "Software Developer":
            "Design and develop software applications. Learn programming, data structures, databases and software engineering.",

        "Data Analyst":
            "Analyze data to discover useful insights. Develop skills in Excel, SQL, statistics, Python and data visualization.",

        "AI / ML Engineer":
            "Develop intelligent systems using data and machine learning. Build foundations in Python, mathematics and AI.",

        "Web Developer":
            "Create and maintain websites and web applications. Learn HTML, CSS, JavaScript and modern web technologies.",

        "Cybersecurity Analyst":
            "Help protect computer systems and information. Learn networking, Linux, security fundamentals and threat analysis.",

        "Cloud Engineer":
            "Work with cloud infrastructure and services. Learn networking, Linux, cloud platforms and deployment.",

        "Database Administrator":
            "Manage databases, data security and backups. Learn SQL, database design and performance optimization.",

        "UI/UX Designer":
            "Design useful and user-friendly digital experiences. Learn wireframing, prototyping, user research and Figma.",

        "Accountant":
            "Maintain financial records and prepare financial statements. Learn accounting, taxation, spreadsheets and accounting software.",

        "Financial Analyst":
            "Study financial performance and support business decisions. Develop skills in Excel, financial modelling and analysis.",

        "Banking Associate":
            "Support banking operations and customer financial services. Learn banking procedures, financial products and communication.",

        "Tax Consultant":
            "Assist individuals and businesses with tax compliance. Learn taxation rules, accounting and financial documentation.",

        "Investment Analyst":
            "Research investments and financial markets. Develop financial analysis, valuation and research skills.",

        "Business Analyst":
            "Understand business needs and recommend improvements using data, communication and problem-solving skills.",

        "HR Executive":
            "Support recruitment, employee relations and HR operations. Develop communication, organization and HR management skills.",

        "Marketing Executive":
            "Promote products and services through campaigns, market research and customer engagement.",

        "Business Development Associate":
            "Identify business opportunities, build client relationships and support company growth.",

        "Operations Manager":
            "Improve business processes, resource planning and operational efficiency.",

        "Project Coordinator":
            "Help teams manage project schedules, tasks, documentation and communication.",

        "Content Writer":
            "Create clear and engaging content for websites, blogs and digital platforms.",

        "Journalism Professional":
            "Research, verify and communicate news and information through different media.",

        "Digital Marketing Specialist":
            "Promote brands online using content, search optimization, social media and campaign analytics.",

        "Social Media Executive":
            "Manage social media content, audience engagement and brand communication.",

        "Research Assistant":
            "Support research projects through data collection, literature review and documentation.",

        "Public Relations Executive":
            "Help organizations communicate with the public and maintain their professional reputation.",

        "Laboratory Analyst":
            "Perform laboratory tests, document findings and follow quality and safety procedures.",

        "Scientific Content Writer":
            "Explain scientific topics accurately through educational and informational content.",

        "Quality Control Analyst":
            "Check products or processes against quality standards and document results.",

        "Environmental Analyst":
            "Help assess environmental data, compliance and sustainability practices.",

        "Graphic Designer":
            "Create visual materials using design principles, typography and graphic design software.",

        "Web Designer":
            "Design website layouts, visual elements and accessible user interfaces.",

        "Video Editor":
            "Edit video content for educational, promotional and digital media projects.",

        "Content Creator":
            "Plan and create digital content for websites, social media and other platforms.",

        "Healthcare Administrator":
            "Support healthcare operations, scheduling, records and administrative processes.",

        "Medical Laboratory Technologist":
            "Perform clinical laboratory procedures appropriate to the person's qualification and training.",

        "Clinical Research Assistant":
            "Support clinical research documentation, data collection and study coordination with appropriate training.",

        "Public Health Assistant":
            "Support public health projects, community programs and health data activities.",

        "Medical Records Specialist":
            "Organize healthcare documentation while maintaining privacy and accuracy.",

        "Healthcare Data Analyst":
            "Analyze healthcare information to support reporting and operational decisions.",

        "Graduate Engineer Trainee":
            "Build practical engineering experience through supervised projects and technical training.",

        "Quality Assurance Engineer":
            "Test products, systems or processes and help improve reliability and quality.",

        "Project Engineer":
            "Support engineering project planning, implementation and technical coordination.",

        "CAD Design Engineer":
            "Create technical drawings and designs using computer-aided design tools appropriate to the discipline.",

        "Technical Support Engineer":
            "Troubleshoot technical problems and help users maintain reliable systems."
    };

    /* =====================================================
       13. IDENTIFY THE REGISTERED STUDENT DEPARTMENT
       ===================================================== */

    function getStudentDepartment() {
        const possibleKeys = [
            "cosmosUser",
            "cosmos_user",
            "cosmosStudent",
            "cosmos_student",
            "studentProfile",
            "cosmos_profile",
            "profile",
            "currentUser"
        ];

        const departmentFields = [
            "department",
            "studentDepartment",
            "course",
            "stream",
            "fieldOfStudy",
            "academicDepartment",
            "careerDirection"
        ];

        function findDepartmentInObject(saved) {
            if (!saved || typeof saved !== "object") {
                return "";
            }

            const candidates = [
                saved,
                saved.user,
                saved.student,
                saved.profile,
                saved.data
            ].filter(
                item => item && typeof item === "object"
            );

            for (const candidate of candidates) {
                for (const field of departmentFields) {
                    const value = candidate[field];

                    if (
                        typeof value === "string" &&
                        value.trim() &&
                        value.toLowerCase() !== "null" &&
                        value.toLowerCase() !== "undefined"
                    ) {
                        return value.trim();
                    }
                }
            }

            return "";
        }

        for (const key of possibleKeys) {
            const saved = readStoredValue(key);
            const department = findDepartmentInObject(saved);

            if (department) {
                return department;
            }
        }

        // Also support a department stored separately.
        const separateDepartmentKeys = [
            "cosmos_department",
            "cosmosDepartment",
            "studentDepartment",
            "department"
        ];

        for (const key of separateDepartmentKeys) {
            const saved = readStoredValue(key);

            if (
                typeof saved === "string" &&
                saved.trim() &&
                saved.toLowerCase() !== "null" &&
                saved.toLowerCase() !== "undefined"
            ) {
                return saved.trim();
            }

            if (saved && typeof saved === "object") {
                const department = findDepartmentInObject(saved);

                if (department) {
                    return department;
                }
            }
        }

        return "";
    }

    function identifyDepartment(rawDepartment) {
        const value = String(rawDepartment || "")
            .toLowerCase()
            .replace(/[_-]/g, " ")
            .trim();

        if (
            /commerce|b\.?com|accounting|finance|banking|taxation/.test(value)
        ) {
            return "commerce";
        }

        if (
            /management|bba|mba|business administration|human resources|\bhr\b/.test(value)
        ) {
            return "management";
        }

        if (
            /computer science|information technology|\bit\b|bca|mca|software|computer applications|computing/.test(value)
        ) {
            return "computer";
        }

        if (
            /design|graphic|animation|visual arts|fine arts|multimedia/.test(value)
        ) {
            return "design";
        }

        if (
            /health|medical|nursing|pharmacy|biomedical|public health|life science/.test(value)
        ) {
            return "healthcare";
        }

        if (
            /engineering|mechanical|civil engineering|electrical|electronics|industrial engineering/.test(value)
        ) {
            return "engineering";
        }

        if (
            /science|physics|chemistry|biology|biotechnology|mathematics|statistics/.test(value)
        ) {
            return "science";
        }

        if (
            /arts|humanities|journalism|literature|language|history|political science|sociology|psychology/.test(value)
        ) {
            return "arts";
        }

        return "general";
    }

    /* =====================================================
       14. SELECT A DEPARTMENT-RELEVANT CAREER
       ===================================================== */

    const rawDepartment = getStudentDepartment();

    const departmentKey = identifyDepartment(rawDepartment);

    const departmentInfo =
        departmentCareers[departmentKey] ||
        departmentCareers.general;

    const savedCareerResult =
        readStoredValue("cosmos_career");

    const savedCareer =
        savedCareerResult &&
        typeof savedCareerResult === "object"
            ? (
                savedCareerResult.recommendedCareer ||
                savedCareerResult.career ||
                savedCareerResult.title
            )
            : null;

    const candidateCareer =
        (
            test &&
            (
                test.recommendedCareer ||
                test.career
            )
        ) ||
        savedCareer;

    // Retain a recommendation only if it belongs
    // to the student's selected department.
    const career = departmentInfo.careers.includes(candidateCareer)
        ? candidateCareer
        : departmentInfo.careers[0];

    /* =====================================================
       15. DISPLAY THE RECOMMENDATION
       ===================================================== */

    if (recommendedCareer) {
        recommendedCareer.textContent = career;
    }

    if (recommendationDescription) {
        recommendationDescription.textContent =
            careerDescriptions[career] ||
            "Explore this career, check its qualification requirements and develop the skills needed for entry-level opportunities.";
    }

    // Show the department without modifying the HTML file.
    let departmentDisplay =
        document.getElementById("careerDepartmentName");

    if (!departmentDisplay && recommendationDescription) {
        departmentDisplay = document.createElement("p");
        departmentDisplay.id = "careerDepartmentName";

        recommendationDescription.insertAdjacentElement(
            "afterend",
            departmentDisplay
        );
    }

    if (departmentDisplay) {
        departmentDisplay.textContent =
            "Department: " + departmentInfo.label;

        departmentDisplay.style.cssText = `
            margin: 12px 0;
            font-weight: 600;
        `;
    }

    /* =====================================================
       16. DISPLAY DEPARTMENT CAREER OPTIONS
       Reuse the existing career grid where available.
       This prevents the original static cards from
       appearing alongside a duplicate dynamic list.
       ===================================================== */

    const careersSection =
        document.querySelector(".careers-section");

    let careerList =
        document.getElementById("departmentCareerOptions");

    if (!careerList) {
        careerList = document.createElement("section");
        careerList.id = "departmentCareerOptions";

        careerList.style.cssText = `
            margin: 24px 0;
            width: 100%;
            box-sizing: border-box;
        `;
    }

    const existingCareerGrid = careersSection
        ? careersSection.querySelector(".career-grid")
        : null;

    if (careersSection) {
        if (!careerList.parentElement) {
            if (existingCareerGrid) {
                existingCareerGrid.insertAdjacentElement(
                    "beforebegin",
                    careerList
                );
            } else {
                careersSection.appendChild(careerList);
            }
        }
    } else if (!careerList.parentElement) {
        const main =
            document.querySelector("main") ||
            document.body;

        main.appendChild(careerList);
    }

    careerList.replaceChildren();

    const careerHeading = document.createElement("h3");

    careerHeading.textContent =
        "Career options for " + departmentInfo.label;

    const careerIntro = document.createElement("p");

    careerIntro.textContent =
        "Explore career paths related to your department. Your interests, skills, qualifications and experience will help determine the best fit.";

    careerList.appendChild(careerHeading);
    careerList.appendChild(careerIntro);

    // Prefer the existing HTML grid to preserve its CSS.
    let careerItems = existingCareerGrid;

    if (careerItems) {
        careerItems.replaceChildren();
    } else {
        careerItems = document.createElement("div");
        careerItems.className = "career-grid";

        careerItems.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            margin-top: 18px;
        `;

        careerList.appendChild(careerItems);
    }

    departmentInfo.careers.forEach(careerName => {
        const card = document.createElement("article");

        // Reuse common career card class names where possible.
        card.className = "career-card";

        card.style.cssText = `
            padding: 18px;
            border: 1px solid rgba(128,128,128,0.35);
            border-radius: 12px;
            line-height: 1.6;
            box-sizing: border-box;
        `;

        const heading = document.createElement("h4");

        heading.textContent = careerName;

        heading.style.marginTop = "0";

        const description = document.createElement("p");

        description.textContent =
            careerDescriptions[careerName] ||
            "Explore the qualifications, practical skills and experience needed for this career.";

        const tag = document.createElement("span");

        tag.textContent =
            careerName === career
                ? "Recommended career"
                : "Career option";

        tag.style.cssText = `
            display: inline-block;
            margin-top: 8px;
            font-size: 12px;
            font-weight: 700;
        `;

        card.appendChild(heading);
        card.appendChild(description);
        card.appendChild(tag);

        careerItems.appendChild(card);
    });

    // When the existing grid is used, the heading and
    // introduction remain immediately before that grid.
    if (existingCareerGrid) {
        careerList.insertAdjacentElement(
            "afterend",
            existingCareerGrid
        );
    }

    /* =====================================================
       17. DISPLAY TEST AND ASSESSMENT STATUS
       ===================================================== */

    if (technicalScore) {
        technicalScore.textContent =
            percentage !== null
                ? `${percentage}%`
                : "--";
    }

    if (assessmentStatus) {
        const assessmentValue =
            readStoredValue("cosmos_assessment_completed");

        const assessmentResult =
            readStoredValue("cosmos_assessment_result");

        const assessmentData =
            readStoredValue("cosmos_assessment");

        const assessmentDone =
            assessmentValue === "completed" ||
            Boolean(assessmentResult) ||
            assessmentData === "completed" ||
            (
                assessmentData &&
                typeof assessmentData === "object" &&
                (
                    assessmentData.completed === true ||
                    assessmentData.status === "completed"
                )
            );

        assessmentStatus.textContent =
            assessmentDone
                ? "Completed ✓"
                : "Result verified";
    }

    if (testStatus) {
        testStatus.textContent = "Passed ✓";
    }

    /* =====================================================
       18. SAVE CAREER RECOMMENDATION
       Include the registered department.
       ===================================================== */

    const careerResult = {
        career: career,
        recommendedCareer: career,
        department: rawDepartment || "",
        departmentKey: departmentKey,
        departmentLabel: departmentInfo.label,
        percentage: percentage,
        completed: true,
        status: "completed",
        completedAt: new Date().toISOString()
    };

    function saveCareerRecommendation() {
        saveStoredValue("cosmos_career", careerResult);

        try {
            localStorage.setItem(
                "cosmos_career_completed",
                "completed"
            );

            sessionStorage.setItem(
                "cosmos_career_completed",
                "completed"
            );
        } catch (error) {
            console.warn(
                "COSMOS career completion save error:",
                error
            );
        }

        if (typeof saveCosmosSession === "function") {
            try {
                saveCosmosSession(
                    "cosmos_career",
                    careerResult
                );
            } catch (error) {
                console.warn(
                    "COSMOS career session save error:",
                    error
                );
            }
        }

        if (typeof completeCareerJourney === "function") {
            try {
                completeCareerJourney();
            } catch (error) {
                console.warn(
                    "COSMOS journey completion error:",
                    error
                );
            }
        }
    }

    saveCareerRecommendation();

    /* =====================================================
       19. CONTINUE TO CERTIFICATE
       ===================================================== */

    if (continueButton) {
        continueButton.addEventListener("click", () => {
            try {
                saveCareerRecommendation();

                if (typeof completeJourneyStep === "function") {
                    completeJourneyStep("career");
                }

                if (typeof completeCareerJourney === "function") {
                    completeCareerJourney();
                }

                if (typeof completeCosmosStep === "function") {
                    completeCosmosStep("career");
                }

                window.location.href = "certificate.html";

            } catch (error) {
                console.error(
                    "COSMOS certificate navigation error:",
                    error
                );

                alert(
                    "Unable to continue right now. Please check the browser console."
                );
            }
        });
    }

    /* =====================================================
       20. DEBUG INFORMATION
       ===================================================== */

    console.log("COSMOS career recommendation:", {
        unlocked: true,
        career: career,
        rawDepartment: rawDepartment,
        departmentKey: departmentKey,
        departmentLabel: departmentInfo.label,
        percentage: percentage,
        passed: passed,
        testResult: test
    });

});
