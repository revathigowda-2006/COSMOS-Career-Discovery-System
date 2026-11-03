/* =========================================================
   COSMOS AI CAREER ASSISTANT
   Personalized Rule-Based Career Assistant
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const chatForm =
        document.getElementById("chatForm");

    const chatInput =
        document.getElementById("chatInput");

    const chatMessages =
        document.getElementById("chatMessages");

    const typingIndicator =
        document.getElementById("typingIndicator");

    const suggestionButtons =
        document.querySelectorAll(".suggestion-button");


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (
        !chatForm ||
        !chatInput ||
        !chatMessages ||
        !typingIndicator
    ) {
        console.error(
            "COSMOS AI chat elements could not be found."
        );

        return;
    }


    /* =====================================================
       INITIAL GREETING
       ===================================================== */

    setTimeout(() => {

        addAIMessage(`
            <p>
                Choose one of the questions below, or type
                your own question. I'll guide you through
                your COSMOS career journey.
            </p>
        `);

    }, 700);


    /* =====================================================
       SUGGESTED QUESTIONS
       ===================================================== */

    suggestionButtons.forEach(button => {

        button.addEventListener("click", () => {

            const question =
                button.dataset.question;

            if (!question) return;

            handleUserQuestion(question);

        });

    });


    /* =====================================================
       CHAT FORM
       ===================================================== */

    chatForm.addEventListener("submit", event => {

        event.preventDefault();

        const question =
            chatInput.value.trim();

        if (!question) return;

        chatInput.value = "";

        handleUserQuestion(question);

    });


    /* =====================================================
       HANDLE USER QUESTION
       ===================================================== */

    async function handleUserQuestion(question) {

        addUserMessage(question);

        typingIndicator.classList.add("show");

        await delay(900);

        typingIndicator.classList.remove("show");

        const answer =
            generateAIResponse(question);

        addAIMessage(answer);

    }


    /* =====================================================
       GENERATE AI RESPONSE
       ===================================================== */

    function generateAIResponse(question) {

        const q =
            question
                .toLowerCase()
                .trim();


        /* =================================================
           GET COSMOS DATA
           ================================================= */

        let assessment = null;
        let resume = null;
        let test = null;
        let user = null;


        try {

            assessment =
                getCosmosSession(
                    "cosmos_assessment"
                );

            resume =
                getCosmosSession(
                    "cosmos_resume"
                );

            test =
                getCosmosSession(
                    "cosmos_test"
                );

            user =
                getCurrentCosmosUser();

        } catch (error) {

            console.warn(
                "COSMOS session data unavailable.",
                error
            );

        }


        const studentName =
            user?.full_name ||
            "there";


        const recommendedCareer =
            test?.recommendedCareer ||
            resume?.career ||
            assessment?.career ||
            null;


        /* =================================================
           GREETING
           ================================================= */

        if (
            q === "hi" ||
            q === "hello" ||
            q === "hey" ||
            q.includes("good morning") ||
            q.includes("good afternoon") ||
            q.includes("good evening")
        ) {

            return `
                <p>
                    Hi <strong>${escapeHTML(studentName)}</strong>! 👋
                </p>

                <p>
                    I'm COSMOS AI, your personal career
                    assistant.
                </p>

                <p>
                    You can ask me about careers, skills,
                    resumes, technical tests, certificates,
                    or your COSMOS results.
                </p>
            `;

        }


        /* =================================================
           WHICH CAREER SUITS ME?
           ================================================= */

        if (
            (
                q.includes("which career") ||
                q.includes("what career") ||
                q.includes("career suits") ||
                q.includes("career suit") ||
                q.includes("best career") ||
                q.includes("right career") ||
                q.includes("suitable career")
            )
        ) {

            if (recommendedCareer) {

                return `
                    <p>
                        Based on your current COSMOS results,
                        your strongest career direction is:
                    </p>

                    <div class="ai-career-highlight">
                        ✦ ${escapeHTML(recommendedCareer)}
                    </div>

                    <p>
                        This recommendation is based on the
                        information available from your
                        assessment, resume analysis and
                        technical test.
                    </p>
                `;

            }


            return `
                <p>
                    I can help you find a suitable career.
                </p>

                <p>
                    Start with the
                    <strong>Career Assessment</strong>,
                    continue with
                    <strong>Resume Analysis</strong>,
                    and then complete the
                    <strong>Technical Test</strong>.
                </p>

                <p>
                    COSMOS will use those results to identify
                    a suitable career direction.
                </p>
            `;

        }


        /* =================================================
           SKILLS / IMPROVEMENT
           ================================================= */

        if (
            q.includes("improve") ||
            q.includes("improve my skills") ||
            q.includes("skill development") ||
            q.includes("develop my skills") ||
            q.includes("learn") ||
            q.includes("what should i learn")
        ) {

            return `
                <p>
                    A strong career-development plan should
                    combine technical and soft skills.
                </p>

                <p>
                    For IT careers, focus on:
                </p>

                <ul>
                    <li>Programming fundamentals</li>
                    <li>Problem solving</li>
                    <li>SQL and databases</li>
                    <li>Web technologies</li>
                    <li>Git and GitHub</li>
                    <li>Communication</li>
                    <li>Practical project development</li>
                </ul>

                <p>
                    Choose one area first, build practical
                    projects, and then gradually move to
                    advanced technologies.
                </p>
            `;

        }


        /* =================================================
           IT SKILLS
           ================================================= */

        if (
            (
                q.includes("skills") &&
                (
                    q.includes("it") ||
                    q.includes("technology") ||
                    q.includes("software")
                )
            ) ||
            q.includes("skills required for it") ||
            q.includes("it skills")
        ) {

            return `
                <p>
                    Important skills for IT careers include:
                </p>

                <ul>
                    <li>Programming</li>
                    <li>Data structures</li>
                    <li>SQL and databases</li>
                    <li>HTML, CSS and JavaScript</li>
                    <li>Git and GitHub</li>
                    <li>Problem solving</li>
                    <li>Communication</li>
                    <li>Cloud and cybersecurity basics</li>
                </ul>

                <p>
                    You don't need to learn everything at once.
                    Choose skills according to your target career.
                </p>
            `;

        }


        /* =================================================
           COSMOS RECOMMENDATION
           ================================================= */

        if (
            q.includes("how does cosmos") ||
            (
                q.includes("how") &&
                q.includes("recommend")
            ) ||
            q.includes("how cosmos works") ||
            q.includes("how are careers recommended")
        ) {

            return `
                <p>
                    COSMOS combines information from several
                    stages of your career journey.
                </p>

                <p>
                    <strong>1. Career Assessment</strong><br>
                    Identifies your interests, strengths and
                    preferred working areas.
                </p>

                <p>
                    <strong>2. Resume Analysis</strong><br>
                    Identifies your education, technical skills,
                    projects and experience.
                </p>

                <p>
                    <strong>3. Technical Test</strong><br>
                    Measures your programming and technical
                    knowledge.
                </p>

                <p>
                    These results are combined to identify
                    suitable career directions.
                </p>
            `;

        }


        /* =================================================
           ASSESSMENT
           ================================================= */

        if (
            q.includes("assessment") ||
            q.includes("career assessment") ||
            q.includes("assessment result") ||
            q.includes("assessment score")
        ) {

            if (assessment) {

                return `
                    <p>
                        You have completed your COSMOS
                        career assessment.
                    </p>

                    <p>
                        Your current recommended career is
                        <strong>
                            ${escapeHTML(
                                assessment.career ||
                                "being determined"
                            )}
                        </strong>.
                    </p>

                    <p>
                        Continue through the COSMOS journey
                        to make your career recommendation
                        more accurate.
                    </p>
                `;

            }


            return `
                <p>
                    Your career assessment helps COSMOS
                    understand your interests, strengths and
                    preferred working style.
                </p>

                <p>
                    Complete the assessment to receive your
                    initial career profile.
                </p>
            `;

        }


        /* =================================================
           TECHNICAL TEST
           ================================================= */

        if (
            q.includes("technical test") ||
            q.includes("test") ||
            q.includes("exam") ||
            q.includes("technical exam")
        ) {

            if (test) {

                const status =
                    test.passed
                        ? "PASSED"
                        : "NOT PASSED";

                return `
                    <p>
                        Your latest COSMOS technical-test result
                        is:
                    </p>

                    <div class="ai-career-highlight">
                        ${status} •
                        ${test.percentage || 0}%
                    </div>

                    <p>
                        You answered
                        <strong>
                            ${test.correct || 0}
                        </strong>
                        questions correctly out of
                        <strong>
                            ${test.total || 30}
                        </strong>.
                    </p>

                    ${
                        test.passed
                        ? `
                            <p>
                                Congratulations! 🎉
                                You have reached the 60% passing
                                requirement.
                            </p>
                        `
                        : `
                            <p>
                                Keep learning and retry the test.
                                You need at least
                                <strong>60%</strong> to pass.
                            </p>
                        `
                    }
                `;

            }


            return `
                <p>
                    The COSMOS Technical Test contains
                    <strong>30 questions</strong>.
                </p>

                <p>
                    You have <strong>30 minutes</strong>
                    to complete the test.
                </p>

                <p>
                    The passing requirement is
                    <strong>60%</strong>.
                </p>

                <p>
                    If you don't pass, you can retry the test.
                </p>
            `;

        }


        /* =================================================
           RESUME
           ================================================= */

        if (
            q.includes("resume") ||
            q.includes("cv") ||
            q.includes("resume analysis")
        ) {

            if (resume) {

                return `
                    <p>
                        Your COSMOS resume analysis has been
                        completed.
                    </p>

                    <p>
                        Your current skill-match score is
                        <strong>
                            ${resume.score || 0}%
                        </strong>.
                    </p>

                    <p>
                        Your detected career direction is
                        <strong>
                            ${escapeHTML(
                                resume.career ||
                                "Software Developer"
                            )}
                        </strong>.
                    </p>

                    <p>
                        Continue improving your projects,
                        certifications and practical skills
                        to strengthen your profile.
                    </p>
                `;

            }


            return `
                <p>
                    A strong student resume should include:
                </p>

                <ul>
                    <li>Education</li>
                    <li>Technical skills</li>
                    <li>Academic projects</li>
                    <li>Internships</li>
                    <li>Certifications</li>
                    <li>Relevant achievements</li>
                </ul>

                <p>
                    Practical projects are especially useful
                    because they demonstrate what you can build.
                </p>
            `;

        }


        /* =================================================
           CERTIFICATE
           ================================================= */

        if (
            q.includes("certificate") ||
            q.includes("certification")
        ) {

            if (test?.passed) {

                return `
                    <p>
                        Congratulations! 🎉
                    </p>

                    <p>
                        Your technical test result is
                        <strong>
                            ${test.percentage}%
                        </strong>,
                        which meets the 60% passing requirement.
                    </p>

                    <p>
                        You are eligible to continue to the
                        COSMOS certificate stage.
                    </p>
                `;

            }


            return `
                <p>
                    COSMOS provides a certificate after you
                    successfully pass the technical assessment.
                </p>

                <p>
                    You need at least
                    <strong>60%</strong>
                    to pass the technical test.
                </p>

                <p>
                    The certificate contains a unique
                    certificate ID that can be verified
                    through the COSMOS verification page.
                </p>
            `;

        }


        /* =================================================
           PYTHON
           ================================================= */

        if (
            q.includes("python")
        ) {

            return `
                <p>
                    Python is one of the most useful programming
                    languages for students and beginners.
                </p>

                <p>
                    It can be used for:
                </p>

                <ul>
                    <li>Software development</li>
                    <li>Data analysis</li>
                    <li>Artificial intelligence</li>
                    <li>Machine learning</li>
                    <li>Automation</li>
                    <li>Web development</li>
                </ul>

                <p>
                    Start with variables, conditions, loops,
                    functions and data structures before moving
                    into advanced topics.
                </p>
            `;

        }


        /* =================================================
           WEB DEVELOPMENT
           ================================================= */

        if (
            q.includes("web development") ||
            q.includes("web developer") ||
            q.includes("website")
        ) {

            return `
                <p>
                    For web development, start with:
                </p>

                <ul>
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                </ul>

                <p>
                    After learning the fundamentals, you can
                    explore technologies such as React,
                    Node.js, PHP and databases.
                </p>

                <p>
                    Building real websites is one of the best
                    ways to improve your web-development skills.
                </p>
            `;

        }


        /* =================================================
           AI / MACHINE LEARNING
           ================================================= */

        if (
            q === "ai" ||
            q.includes("artificial intelligence") ||
            q.includes("machine learning") ||
            q.includes("machine-learning")
        ) {

            return `
                <p>
                    AI and Machine Learning are excellent
                    technology career areas.
                </p>

                <p>
                    Start with:
                </p>

                <ul>
                    <li>Python</li>
                    <li>Mathematics basics</li>
                    <li>Statistics</li>
                    <li>Data handling</li>
                    <li>Machine-learning concepts</li>
                </ul>

                <p>
                    Once your fundamentals are strong, build
                    small AI projects to gain practical experience.
                </p>
            `;

        }


        /* =================================================
           DATA ANALYTICS
           ================================================= */

        if (
            q.includes("data analyst") ||
            q.includes("data analysis") ||
            q.includes("analytics")
        ) {

            return `
                <p>
                    A Data Analyst works with data to discover
                    useful patterns and insights.
                </p>

                <p>
                    Important skills include:
                </p>

                <ul>
                    <li>Excel</li>
                    <li>SQL</li>
                    <li>Python</li>
                    <li>Statistics</li>
                    <li>Power BI or Tableau</li>
                </ul>
            `;

        }


        /* =================================================
           CYBERSECURITY
           ================================================= */

        if (
            q.includes("cybersecurity") ||
            q.includes("cyber security") ||
            q.includes("security career")
        ) {

            return `
                <p>
                    Cybersecurity focuses on protecting systems,
                    networks and information from threats.
                </p>

                <p>
                    Useful skills include:
                </p>

                <ul>
                    <li>Networking</li>
                    <li>Linux</li>
                    <li>Security fundamentals</li>
                    <li>Authentication</li>
                    <li>Threat analysis</li>
                </ul>
            `;

        }


        /* =================================================
           CLOUD
           ================================================= */

        if (
            q.includes("cloud") ||
            q.includes("cloud engineer")
        ) {

            return `
                <p>
                    Cloud Engineers work with cloud infrastructure,
                    deployment and scalable services.
                </p>

                <p>
                    Common areas to learn include AWS, Azure,
                    Linux, networking, databases and cloud security.
                </p>
            `;

        }


        /* =================================================
           GITHUB / PROJECTS
           ================================================= */

        if (
            q.includes("github") ||
            q.includes("project")
        ) {

            return `
                <p>
                    Projects are extremely useful for students
                    because they demonstrate practical skills.
                </p>

                <p>
                    Try building projects that include:
                </p>

                <ul>
                    <li>A clear real-world problem</li>
                    <li>A database</li>
                    <li>A useful user interface</li>
                    <li>Programming logic</li>
                    <li>Documentation</li>
                </ul>

                <p>
                    Uploading your completed projects to GitHub
                    can also help demonstrate your work.
                </p>
            `;

        }


        /* =================================================
           DEFAULT RESPONSE
           ================================================= */

        return `
            <p>
                That's a good career question.
            </p>

            <p>
                I can help you with:
            </p>

            <ul>
                <li>Career recommendations</li>
                <li>IT and programming skills</li>
                <li>Resume improvement</li>
                <li>Technical-test guidance</li>
                <li>Certificates</li>
                <li>Your COSMOS results</li>
            </ul>

            <p>
                Try asking:
                <strong>
                    "Which career suits me?"
                </strong>
            </p>
        `;

    }


    /* =====================================================
       ADD USER MESSAGE
       ===================================================== */

    function addUserMessage(text) {

        const message =
            document.createElement("div");

        message.className =
            "chat-message user-message";

        message.innerHTML = `
            <div class="message-content">
                <p>
                    ${escapeHTML(text)}
                </p>
            </div>
        `;

        chatMessages.appendChild(message);

        scrollChat();

    }


    /* =====================================================
       ADD AI MESSAGE
       ===================================================== */

    function addAIMessage(html) {

        const message =
            document.createElement("div");

        message.className =
            "chat-message ai-message";

        message.innerHTML = `
            <div class="message-avatar">
                ✦
            </div>

            <div class="message-content">
                ${html}
            </div>
        `;

        chatMessages.appendChild(message);

        scrollChat();

    }


    /* =====================================================
       SCROLL CHAT
       ===================================================== */

    function scrollChat() {

        chatMessages.scrollTo({

            top:
                chatMessages.scrollHeight,

            behavior:
                "smooth"

        });

    }


    /* =====================================================
       DELAY
       ===================================================== */

    function delay(ms) {

        return new Promise(resolve => {

            setTimeout(
                resolve,
                ms
            );

        });

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text;

        return div.innerHTML;

    }

});