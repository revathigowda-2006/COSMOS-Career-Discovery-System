
/* =========================================================
   COSMOS RESUME ANALYZER
   Improved analysis: skills, strengths, weaknesses,
   missing keywords and career recommendations.
   Preserves existing COSMOS session and journey logic.
   ========================================================= */

const resumeSkills = [
    "python", "java", "javascript", "html", "css", "sql", "c", "c++",
    "react", "node.js", "node", "php", "mysql", "postgresql", "mongodb",
    "machine learning", "artificial intelligence", "ai", "data analysis",
    "excel", "power bi", "tableau", "figma", "ui", "ux", "cloud",
    "aws", "azure", "linux", "cybersecurity", "networking", "git",
    "github", "typescript", "bootstrap", "django", "flask", "pandas",
    "numpy", "statistics", "communication", "leadership", "teamwork",
    "problem solving", "critical thinking", "time management",
    "data visualization", "deep learning", "nlp", "api", "rest api",
    "wordpress", "testing", "agile", "scrum", "powerpoint",
    "ms office", "accounting", "financial analysis", "marketing",
    "sales", "project management", "business analysis", "canva"
];

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof requireCosmosStudent !== "function") {
        console.error("COSMOS login helper is missing.");
        return;
    }

    if (!requireCosmosStudent()) return;

    if (
        typeof canOpenStep === "function" &&
        !canOpenStep("resume")
    ) {
        alert("Please complete the Discover step first.");
        window.location.href = "discover.html";
        return;
    }

    const user =
        typeof getCurrentCosmosUser === "function"
            ? getCurrentCosmosUser()
            : null;

    const nameInput = document.getElementById("resumeName");

    if (nameInput && user?.full_name) {
        nameInput.value = user.full_name;
    }

    const form = document.getElementById("resumeForm");

    if (form) {
        form.addEventListener("submit", analyzeResume);
    }

    const testButton =
        document.getElementById("takeTechnicalTestBtn");

    if (testButton) {
        testButton.addEventListener(
            "click",
            handleTechnicalTestNavigation
        );
    }

    ensureResumeResultUI();

    let savedResume =
        typeof getCosmosSession === "function"
            ? getCosmosSession("cosmos_resume")
            : null;

    if (!savedResume) {
        try {
            const storedResume =
                localStorage.getItem("cosmos_resume");

            savedResume = storedResume
                ? JSON.parse(storedResume)
                : null;
        } catch (error) {
            console.warn(
                "Could not restore saved resume analysis:",
                error
            );
        }
    }

    if (
        savedResume &&
        typeof savedResume === "object" &&
        savedResume.analyzedAt
    ) {
        displayResumeResult(savedResume);
        markResumeAsCompleted();
    }
});

/* =========================================================
   RESULT UI
   Creates result elements only when they do not exist.
   Existing HTML and CSS are not replaced.
   ========================================================= */

function ensureResumeResultUI() {
    const form = document.getElementById("resumeForm");

    if (!form) return;

    let result = document.getElementById("resumeResult");

    if (!result) {
        result = document.createElement("section");
        result.id = "resumeResult";
        result.className = "resume-result glass-card";
        result.hidden = true;

        result.innerHTML = `
            <h2>Resume Analysis Results</h2>

            <div class="resume-score">
                <h3>Resume Readiness Score</h3>
                <p id="skillScore">0%</p>
            </div>

            <div class="resume-analysis-block">
                <h3>Overview</h3>
                <p id="analysisText"></p>
            </div>

            <div class="resume-analysis-block">
                <h3>Detected Skills</h3>
                <div id="detectedSkills"></div>
            </div>

            <div class="resume-analysis-block">
                <h3>Your Strengths</h3>
                <ul id="resumeStrengths"></ul>
            </div>

            <div class="resume-analysis-block">
                <h3>Areas to Improve</h3>
                <ul id="resumeWeaknesses"></ul>
            </div>

            <div class="resume-analysis-block">
                <h3>Suggested Missing Keywords</h3>
                <p>
                    These are useful keywords for your suggested career
                    that were not detected in your information.
                </p>
                <div id="resumeMissingKeywords"></div>
            </div>

            <div class="resume-analysis-block">
                <h3>Recommended Career</h3>
                <h4 id="resumeCareer"></h4>
                <p id="resumeCareerDescription"></p>
            </div>
        `;

        form.insertAdjacentElement("afterend", result);
    }

    const elements = [
        ["skillScore", "p"],
        ["analysisText", "p"],
        ["detectedSkills", "div"],
        ["resumeStrengths", "ul"],
        ["resumeWeaknesses", "ul"],
        ["resumeMissingKeywords", "div"],
        ["resumeCareer", "h4"],
        ["resumeCareerDescription", "p"]
    ];

    elements.forEach(([id, tagName]) => {
        if (document.getElementById(id)) return;

        const element = document.createElement(tagName);
        element.id = id;
        element.hidden = true;
        result.appendChild(element);
    });
}

/* =========================================================
   JOURNEY COMPLETION
   ========================================================= */

function markResumeAsCompleted() {
    if (typeof completeResumeJourney === "function") {
        completeResumeJourney();
    } else {
        localStorage.setItem(
            "cosmos_resume_completed",
            "completed"
        );

        localStorage.setItem(
            "cosmos_resume_status",
            "completed"
        );
    }
}

/* =========================================================
   ANALYZE RESUME
   ========================================================= */

function analyzeResume(event) {
    event.preventDefault();

    const name =
        document.getElementById("resumeName")?.value.trim() || "";

    const education =
        document.getElementById("education")?.value.trim() || "";

    const skillsText =
        document.getElementById("skills")?.value.trim() || "";

    const experience =
        document.getElementById("experience")?.value.trim() || "";

    const projects =
        document.getElementById("projects")?.value.trim() || "";

    const certifications =
        document.getElementById("certifications")?.value.trim() || "";

    const message = document.getElementById("resumeMessage");
    const button = document.getElementById("analyzeResumeButton");

    if (!name || !education || !skillsText) {
        if (message) {
            message.className = "form-message error-message";
            message.textContent =
                "Please enter your name, education and skills.";
        }

        return;
    }

    const completeText = [
        education,
        skillsText,
        experience,
        projects,
        certifications
    ].join(" ").toLowerCase();

    const uniqueSkills = detectResumeSkills(completeText);

    const career = determineResumeCareer(uniqueSkills);

    const strengths = generateStrengths(
        uniqueSkills,
        experience,
        projects,
        certifications,
        education
    );

    const weaknesses = generateWeaknesses(
        uniqueSkills,
        experience,
        projects,
        certifications
    );

    const missingKeywords = generateMissingKeywords(
        uniqueSkills,
        career.name
    );

    const score = calculateResumeScore({
        skills: uniqueSkills,
        experience,
        projects,
        certifications,
        education
    });

    const analysisText = generateAnalysis(
        uniqueSkills,
        score,
        experience,
        projects,
        certifications
    );

    const result = {
        name,
        education,
        skills: uniqueSkills,
        experience,
        projects,
        certifications,
        score,
        analysis: analysisText,
        strengths,
        weaknesses,
        missingKeywords,
        career: career.name,
        careerDescription: career.description,
        analyzedAt: new Date().toISOString()
    };

    if (typeof saveCosmosSession !== "function") {
        if (message) {
            message.className = "form-message error-message";
            message.textContent =
                "Unable to save your result. Please check the COSMOS session script.";
        }

        return;
    }

    try {
        saveCosmosSession("cosmos_resume", result);

        localStorage.setItem(
            "cosmos_resume",
            JSON.stringify(result)
        );

        markResumeAsCompleted();
    } catch (error) {
        console.error("Unable to save resume result:", error);

        if (message) {
            message.className = "form-message error-message";
            message.textContent =
                "Your resume result could not be saved. Please try again.";
        }

        return;
    }

    displayResumeResult(result);

    if (typeof completeJourneyStep === "function") {
        completeJourneyStep("resume");
    }

    if (message) {
        message.className = "form-message success-message";
        message.textContent =
            "Resume analysis completed successfully. Review your strengths and improvement suggestions below.";
    }

    if (button) button.blur();
}

/* =========================================================
   SKILL DETECTION
   Uses word boundaries to reduce partial-word matches.
   ========================================================= */

function detectResumeSkills(text) {
    const normalizedText = text.toLowerCase();

    return [
        ...new Set(
            resumeSkills.filter(skill => {
                const escaped = skill.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                const pattern = new RegExp(
                    "(^|[^a-z0-9+#.])" +
                    escaped +
                    "($|[^a-z0-9+#.])",
                    "i"
                );

                return pattern.test(normalizedText);
            })
        )
    ];
}

/* =========================================================
   SCORE
   A heuristic indicator, not a professional hiring score.
   ========================================================= */

function calculateResumeScore(data) {
    let score = 20;

    const skillCount = data.skills.length;

    score += Math.min(skillCount * 4, 32);

    if (data.experience) score += 12;
    if (data.projects) score += 14;
    if (data.certifications) score += 8;

    if (data.education) score += 8;

    return Math.min(100, score);
}

/* =========================================================
   CAREER RECOMMENDATION
   ========================================================= */

function determineResumeCareer(skills) {
    const has = (...names) =>
        names.some(name => skills.includes(name));

    if (
        has(
            "machine learning",
            "artificial intelligence",
            "deep learning",
            "nlp"
        )
    ) {
        return {
            name: "AI / ML Engineer",
            description:
                "Your listed skills connect with AI and machine learning. Build practical projects using Python, data preparation, model evaluation and machine-learning libraries."
        };
    }

    if (
        has(
            "data analysis",
            "power bi",
            "tableau",
            "excel",
            "data visualization",
            "statistics",
            "pandas"
        )
    ) {
        return {
            name: "Data Analyst",
            description:
                "Your profile includes data-related skills. Practise SQL queries, spreadsheet analysis, statistics and dashboards using real datasets."
        };
    }

    if (
        has(
            "cybersecurity",
            "networking",
            "linux"
        )
    ) {
        return {
            name: "Cybersecurity Analyst",
            description:
                "Your listed skills can support a cybersecurity learning path. Develop networking fundamentals, Linux skills, security awareness and hands-on lab experience."
        };
    }

    if (
        has(
            "html",
            "css",
            "javascript",
            "react",
            "node",
            "node.js",
            "php",
            "bootstrap",
            "typescript"
        )
    ) {
        return {
            name: "Web Developer",
            description:
                "Your profile includes web-development skills. Build responsive websites and practise JavaScript, accessibility, APIs and suitable backend technologies."
        };
    }

    if (
        has(
            "accounting",
            "financial analysis",
            "excel"
        )
    ) {
        return {
            name: "Finance / Business Analyst",
            description:
                "Your profile includes finance or spreadsheet-related skills. Develop reporting, analytical thinking, spreadsheet modelling and business communication."
        };
    }

    if (
        has(
            "marketing",
            "sales",
            "canva"
        )
    ) {
        return {
            name: "Digital Marketing Associate",
            description:
                "Your profile includes skills relevant to marketing or content work. Build practical campaigns and learn analytics, content strategy and audience research."
        };
    }

    if (
        has(
            "figma",
            "ui",
            "ux"
        )
    ) {
        return {
            name: "UI/UX Designer",
            description:
                "Your listed skills connect with interface and user-experience design. Practise wireframes, prototypes, accessibility and user testing."
        };
    }

    if (
        has(
            "sql",
            "mysql",
            "postgresql",
            "mongodb"
        )
    ) {
        return {
            name: "Database Developer",
            description:
                "Your profile includes database-related skills. Strengthen data modelling, SQL queries, database design and secure data handling."
        };
    }

    if (
        has(
            "python",
            "java",
            "javascript",
            "c",
            "c++"
        )
    ) {
        return {
            name: "Software Developer",
            description:
                "Your listed programming skills can support a software-development path. Practise problem-solving, debugging, data structures and building complete applications."
        };
    }

    return {
        name: "Software / Business Professional",
        description:
            "Your profile needs more detail to suggest a specific career confidently. Add relevant skills, practical examples and career interests to improve the recommendation."
    };
}

/* =========================================================
   STRENGTHS
   ========================================================= */

function generateStrengths(
    skills,
    experience,
    projects,
    certifications,
    education
) {
    const strengths = [];

    if (skills.length >= 8) {
        strengths.push(
            "Broad range of listed skills across multiple technical or professional areas."
        );
    } else if (skills.length >= 4) {
        strengths.push(
            "A useful foundation of relevant skills to build on."
        );
    } else if (skills.length > 0) {
        strengths.push(
            "An initial set of skills has been identified in your profile."
        );
    } else {
        strengths.push(
            "Your profile is started, but more specific skills are needed for a useful assessment."
        );
    }

    if (projects) {
        strengths.push(
            "Projects are included, giving you an opportunity to demonstrate practical work."
        );
    }

    if (experience) {
        strengths.push(
            "Experience details are provided and may help explain how you have applied your skills."
        );
    }

    if (certifications) {
        strengths.push(
            "Certifications are listed, which can help document completed learning."
        );
    }

    if (education) {
        strengths.push(
            "Your education details provide context for your current learning path."
        );
    }

    return strengths;
}

/* =========================================================
   AREAS TO IMPROVE
   ========================================================= */

function generateWeaknesses(
    skills,
    experience,
    projects,
    certifications
) {
    const weaknesses = [];

    if (skills.length < 4) {
        weaknesses.push(
            "Add more relevant skills that you can confidently explain or demonstrate."
        );
    }

    if (!projects) {
        weaknesses.push(
            "Add one or two projects with their purpose, tools used and your contribution."
        );
    } else {
        const projectWords = projects.trim().split(/\s+/).length;

        if (projectWords < 12) {
            weaknesses.push(
                "Expand your project description with the problem, tools used, your role and the result."
            );
        }
    }

    if (!experience) {
        weaknesses.push(
            "Experience is not described. If you are a fresher, include internships, volunteering, coursework or practical projects where relevant."
        );
    }

    if (!certifications) {
        weaknesses.push(
            "No certifications are listed. Consider relevant courses if they support your career goal."
        );
    }

    if (skills.length > 0 && skills.length < 8) {
        weaknesses.push(
            "Compare your skills with job descriptions for your target role and add relevant skills you genuinely possess."
        );
    }

    if (weaknesses.length === 0) {
        weaknesses.push(
            "Continue improving your project descriptions with measurable results, links to work and details of your individual contribution."
        );
    }

    return weaknesses;
}

/* =========================================================
   MISSING CAREER KEYWORDS
   These are suggestions, not claims that the user has them.
   ========================================================= */

function generateMissingKeywords(skills, careerName) {
    const keywordMap = {
        "AI / ML Engineer": [
            "Python",
            "Pandas",
            "NumPy",
            "Statistics",
            "Data preprocessing",
            "Model evaluation",
            "Scikit-learn"
        ],

        "Data Analyst": [
            "SQL",
            "Excel",
            "Python",
            "Statistics",
            "Data cleaning",
            "Data visualization",
            "Power BI"
        ],

        "Cybersecurity Analyst": [
            "Networking",
            "Linux",
            "Security fundamentals",
            "Log analysis",
            "Incident response",
            "Risk assessment"
        ],

        "Web Developer": [
            "JavaScript",
            "Responsive design",
            "Git",
            "REST API",
            "Web accessibility",
            "Testing",
            "Deployment"
        ],

        "Finance / Business Analyst": [
            "Excel",
            "Financial analysis",
            "Data analysis",
            "Reporting",
            "Forecasting",
            "Business communication"
        ],

        "Digital Marketing Associate": [
            "SEO",
            "Content strategy",
            "Social media",
            "Campaign analytics",
            "Market research",
            "Communication"
        ],

        "UI/UX Designer": [
            "Figma",
            "Wireframing",
            "Prototyping",
            "User research",
            "Usability testing",
            "Accessibility"
        ],

        "Database Developer": [
            "SQL",
            "Database design",
            "Query optimization",
            "Data modelling",
            "Database security",
            "Backup and recovery"
        ],

        "Software Developer": [
            "Data structures",
            "Algorithms",
            "Git",
            "Debugging",
            "Testing",
            "Problem solving",
            "API development"
        ],

        "Software / Business Professional": [
            "Communication",
            "Problem solving",
            "Teamwork",
            "Digital skills",
            "Project experience"
        ]
    };

    const suggestions = keywordMap[careerName] || [];

    const normalizedSkills = new Set(
        skills.map(skill => skill.toLowerCase())
    );

    return suggestions.filter(keyword => {
        return !normalizedSkills.has(keyword.toLowerCase());
    });
}

/* =========================================================
   ANALYSIS SUMMARY
   ========================================================= */

function generateAnalysis(
    skills,
    score,
    experience,
    projects,
    certifications
) {
    let text =
        `COSMOS identified ${skills.length} relevant skill(s) in the information you provided. `;

    if (score >= 75) {
        text +=
            "Your profile contains several useful elements. Keep improving the evidence that demonstrates your abilities. ";
    } else if (score >= 50) {
        text +=
            "Your profile has a foundation to build on. More practical examples and relevant skills may strengthen it. ";
    } else {
        text +=
            "Your profile could benefit from more specific skills and practical examples. ";
    }

    if (projects) {
        text +=
            "You have included project information. Describe your contribution and results clearly. ";
    } else {
        text +=
            "Consider adding practical projects to demonstrate what you can do. ";
    }

    if (!experience) {
        text +=
            "If you are a fresher, coursework, internships and personal projects can help demonstrate your experience. ";
    }

    if (!certifications) {
        text +=
            "Relevant certifications may help document additional learning.";
    }

    return text.trim();
}

/* =========================================================
   DISPLAY RESULTS
   ========================================================= */

function displayResumeResult(result) {
    if (!result) return;

    ensureResumeResultUI();

    setText("skillScore", `${result.score ?? 0}%`);
    setText(
        "analysisText",
        result.analysis || "No analysis available."
    );

    setText(
        "resumeCareer",
        result.career || "Not determined"
    );

    setText(
        "resumeCareerDescription",
        result.careerDescription || ""
    );

    renderTags(
        "detectedSkills",
        result.skills || [],
        "No specific skills detected."
    );

    renderList(
        "resumeStrengths",
        result.strengths || [
            "Review your listed skills and practical experience."
        ]
    );

    renderList(
        "resumeWeaknesses",
        result.weaknesses || [
            "Add more details to strengthen your resume."
        ]
    );

    renderTags(
        "resumeMissingKeywords",
        result.missingKeywords || [],
        "No suggested keywords available."
    );

    const resultContainer =
        document.getElementById("resumeResult");

    if (resultContainer) {
        resultContainer.hidden = false;
        resultContainer.classList.add("show");

        let createResumeButton =
            document.getElementById("createResumeButton");

        if (!createResumeButton) {
            createResumeButton =
                document.createElement("button");

            createResumeButton.id = "createResumeButton";
            createResumeButton.type = "button";
            createResumeButton.className = "primary-btn";
            createResumeButton.textContent =
                "Create My Resume →";

            createResumeButton.addEventListener("click", () => {
                window.location.href = "resume-builder.html";
            });

            resultContainer.appendChild(createResumeButton);
        }
    }
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value;
    element.hidden = false;
}

function renderTags(id, items, emptyMessage) {
    const container = document.getElementById(id);

    if (!container) return;

    container.replaceChildren();
    container.hidden = false;

    if (!items.length) {
        container.textContent = emptyMessage;
        return;
    }

    items.forEach(item => {
        const tag = document.createElement("span");

        tag.textContent = item;
        tag.style.display = "inline-block";
        tag.style.margin = "4px 6px 4px 0";
        tag.style.padding = "6px 10px";
        tag.style.borderRadius = "6px";

        container.appendChild(tag);
    });
}


function renderList(id, items) {
    const list = document.getElementById(id);

    if (!list) return;

    list.replaceChildren();
    list.hidden = false;

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}

/* =========================================================
   TECHNICAL TEST NAVIGATION
   Existing COSMOS journey behavior retained.
   ========================================================= */

function handleTechnicalTestNavigation(event) {
    event.preventDefault();

    const resumeResult =
        typeof getCosmosSession === "function"
            ? getCosmosSession("cosmos_resume")
            : null;

    if (!resumeResult) {
        alert(
            "Please analyze your resume before taking the Technical Test."
        );
        return;
    }

    const existingTest =
        typeof getCosmosSession === "function"
            ? getCosmosSession("cosmos_test")
            : null;

    if (existingTest) {
        alert("You have already completed the Technical Test.");
        window.location.href = "dashboard.html";
        return;
    }

    if (
        typeof canOpenStep === "function" &&
        !canOpenStep("test")
    ) {
        alert("Please complete the Resume Analysis first.");
        return;
    }

    window.location.href = "test.html";
}
