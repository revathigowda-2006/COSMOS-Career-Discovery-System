
/* =========================================================
   COSMOS CAREER ASSESSMENT
   Complete Updated Version
   ========================================================= */


/* =========================================================
   1. ASSESSMENT QUESTIONS
   ========================================================= */

const assessmentQuestions = [

    {
        category: "TECHNICAL",
        question: "I enjoy solving programming or technical problems.",
        type: "technical"
    },

    {
        category: "ANALYTICAL",
        question: "I enjoy studying information and finding patterns.",
        type: "analytical"
    },

    {
        category: "CREATIVE",
        question: "I enjoy creating new designs, ideas or digital experiences.",
        type: "creative"
    },

    {
        category: "COMMUNICATION",
        question: "I enjoy explaining ideas to other people.",
        type: "communication"
    },

    {
        category: "LEADERSHIP",
        question: "I enjoy taking responsibility for a team or project.",
        type: "leadership"
    },

    {
        category: "TECHNICAL",
        question: "I like learning new programming languages and technologies.",
        type: "technical"
    },

    {
        category: "ANALYTICAL",
        question: "I enjoy working with numbers, data and logical reasoning.",
        type: "analytical"
    },

    {
        category: "CREATIVE",
        question: "I like designing websites or improving how applications look.",
        type: "creative"
    },

    {
        category: "COMMUNICATION",
        question: "I am comfortable presenting information to a group.",
        type: "communication"
    },

    {
        category: "LEADERSHIP",
        question: "I like organizing activities and helping people work together.",
        type: "leadership"
    }

];


/* =========================================================
   2. ASSESSMENT OPTIONS
   ========================================================= */

const assessmentOptions = [

    {
        text: "Strongly Agree",
        value: 5
    },

    {
        text: "Agree",
        value: 4
    },

    {
        text: "Neutral",
        value: 3
    },

    {
        text: "Disagree",
        value: 2
    },

    {
        text: "Strongly Disagree",
        value: 1
    }

];


/* =========================================================
   3. ASSESSMENT STATE
   ========================================================= */

let assessmentIndex = 0;

let assessmentAnswers =
    new Array(assessmentQuestions.length).fill(null);

let assessmentFinished = false;


/* =========================================================
   4. INITIALIZE ASSESSMENT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Check student login
    if (
        typeof requireCosmosStudent === "function" &&
        !requireCosmosStudent()
    ) {
        return;
    }

    // Check assessment access
    if (
        typeof canOpenStep === "function" &&
        !canOpenStep("assessment")
    ) {
        alert("You cannot access the assessment at this time.");

        window.location.href = "dashboard.html";

        return;
    }

    // Previous button
    const previousBtn =
        document.getElementById("previousBtn");

    if (previousBtn) {
        previousBtn.addEventListener(
            "click",
            previousQuestion
        );
    }

    // Next button
    const nextBtn =
        document.getElementById("nextBtn");

    if (nextBtn) {
        nextBtn.addEventListener(
            "click",
            nextQuestion
        );
    }

    // Total questions
    const totalQuestions =
        document.getElementById("totalQuestions");

    if (totalQuestions) {
        totalQuestions.textContent =
            assessmentQuestions.length;
    }

    // Display first question
    showAssessmentQuestion();

});


/* =========================================================
   5. SHOW QUESTION
   ========================================================= */

function showAssessmentQuestion() {

    const question =
        assessmentQuestions[assessmentIndex];

    if (!question) {
        return;
    }

    // Current question number
    const currentQuestion =
        document.getElementById("currentQuestion");

    if (currentQuestion) {
        currentQuestion.textContent =
            assessmentIndex + 1;
    }

    // Category
    const questionCategory =
        document.getElementById("questionCategory");

    if (questionCategory) {
        questionCategory.textContent =
            question.category;
    }

    // Question text
    const questionText =
        document.getElementById("questionText");

    if (questionText) {
        questionText.textContent =
            question.question;
    }

    // Progress percentage
    const percentage = Math.round(
        ((assessmentIndex + 1) /
            assessmentQuestions.length) * 100
    );

    const progressPercent =
        document.getElementById("progressPercent");

    if (progressPercent) {
        progressPercent.textContent =
            percentage + "%";
    }

    // Progress bar
    const progressFill =
        document.getElementById("assessmentProgressFill");

    if (progressFill) {
        progressFill.style.width =
            percentage + "%";
    }

    // Options container
    const optionsContainer =
        document.getElementById("optionsContainer");

    if (!optionsContainer) {
        console.error("Assessment options container not found.");
        return;
    }

    optionsContainer.innerHTML = "";

    // Create answer options
    assessmentOptions.forEach(function (option, index) {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "assessment-option";

        button.setAttribute(
            "aria-pressed",
            String(
                assessmentAnswers[assessmentIndex] === option.value
            )
        );

        if (assessmentAnswers[assessmentIndex] === option.value) {
            button.classList.add("selected");
        }

        button.innerHTML = `
            <span class="option-number">${index + 1}</span>
            <span>${option.text}</span>
        `;

        button.addEventListener("click", function () {

            assessmentAnswers[assessmentIndex] =
                option.value;

            // Update selected answer styling
            optionsContainer
                .querySelectorAll(".assessment-option")
                .forEach(function (item) {
                    item.classList.remove("selected");
                    item.setAttribute("aria-pressed", "false");
                });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");

        });

        optionsContainer.appendChild(button);

    });

    // Previous button state
    const previousBtn =
        document.getElementById("previousBtn");

    if (previousBtn) {
        previousBtn.disabled =
            assessmentIndex === 0;
    }

    // Next button text
    const nextBtn =
        document.getElementById("nextBtn");

    if (nextBtn) {
        nextBtn.textContent =
            assessmentIndex === assessmentQuestions.length - 1
                ? "Finish Assessment ✓"
                : "Next →";
    }

}


/* =========================================================
   6. PREVIOUS QUESTION
   ========================================================= */

function previousQuestion() {

    if (assessmentFinished) {
        return;
    }

    if (assessmentIndex > 0) {
        assessmentIndex--;
        showAssessmentQuestion();
    }

}


/* =========================================================
   7. NEXT QUESTION
   ========================================================= */

function nextQuestion() {

    if (assessmentFinished) {
        return;
    }

    // Ensure an answer is selected
    if (assessmentAnswers[assessmentIndex] === null) {

        alert(
            "Please select an answer before continuing."
        );

        return;
    }

    // Go to next question
    if (assessmentIndex < assessmentQuestions.length - 1) {

        assessmentIndex++;
        showAssessmentQuestion();

        return;
    }

    // All questions answered
    finishAssessment();

}


/* =========================================================
   8. FINISH ASSESSMENT
   ========================================================= */

function finishAssessment() {

    // Prevent accidental double submission
    if (assessmentFinished) {
        return;
    }

    // Validate all answers
    if (assessmentAnswers.some(function (answer) {
        return answer === null;
    })) {

        alert(
            "Please answer all questions before finishing."
        );

        return;
    }

    assessmentFinished = true;

    // Calculate category scores
    const scores = {

        technical: 0,
        analytical: 0,
        creative: 0,
        communication: 0,
        leadership: 0

    };

    assessmentQuestions.forEach(function (question, index) {

        scores[question.type] +=
            assessmentAnswers[index];

    });

    // Determine career recommendation
    const career =
        determineAssessmentCareer(scores);

    // Build result object
    const result = {

        technical: scores.technical,
        analytical: scores.analytical,
        creative: scores.creative,
        communication: scores.communication,
        leadership: scores.leadership,

        technicalScore: scores.technical,
        analyticalScore: scores.analytical,
        creativeScore: scores.creative,
        communicationScore: scores.communication,
        leadershipScore: scores.leadership,

        career: career.name,
        description: career.description,

        completedAt: new Date().toISOString()

    };

    /* -----------------------------------------------------
       SAVE RESULT LOCALLY
       Keep the result separate from the completion flag.
       ----------------------------------------------------- */

    try {

        localStorage.setItem(
            "cosmos_assessment_result",
            JSON.stringify(result)
        );

    } catch (error) {

        console.error(
            "Could not save assessment result:",
            error
        );

        assessmentFinished = false;

        alert(
            "Your result could not be saved. Please try again."
        );

        return;

    }

    /* -----------------------------------------------------
       MARK ASSESSMENT COMPLETED
       ----------------------------------------------------- */

    try {

        if (typeof completeAssessmentJourney === "function") {

            completeAssessmentJourney();

        } else if (typeof completeJourneyStep === "function") {

            completeJourneyStep("assessment");

        } else {

            localStorage.setItem(
                "cosmos_assessment",
                "completed"
            );

            localStorage.setItem(
                "cosmos_assessment_completed",
                "completed"
            );

        }

    } catch (error) {

        console.error(
            "Could not update assessment journey:",
            error
        );

    }

    /* -----------------------------------------------------
       DISPLAY RESULT
       ----------------------------------------------------- */

    showResult(result);

    /* -----------------------------------------------------
       SAVE TO SUPABASE
       ----------------------------------------------------- */

    saveAssessmentToDatabase(result);

}


/* =========================================================
   9. DETERMINE CAREER
   ========================================================= */

function determineAssessmentCareer(scores) {

    if (
        scores.technical >= Math.max(
            scores.analytical,
            scores.creative,
            scores.communication,
            scores.leadership
        )
    ) {

        return {

            name: "Software Developer",

            description:
                "Your results show strong interest in technology, programming and problem solving. Software development could be a strong career direction."

        };

    }

    if (
        scores.analytical >= Math.max(
            scores.technical,
            scores.creative,
            scores.communication,
            scores.leadership
        )
    ) {

        return {

            name: "Data Analyst",

            description:
                "Your analytical profile suggests that you may enjoy working with data, patterns, logical reasoning and business insights."

        };

    }

    if (
        scores.creative >= Math.max(
            scores.technical,
            scores.analytical,
            scores.communication,
            scores.leadership
        )
    ) {

        return {

            name: "UI/UX Designer",

            description:
                "Your creative profile suggests that design, user experience and digital product development may suit you."

        };

    }

    if (scores.leadership >= scores.communication) {

        return {

            name: "Project Manager",

            description:
                "Your leadership profile suggests that organizing people, projects and responsibilities may be a good fit."

        };

    }

    return {

        name: "Business Analyst",

        description:
            "Your communication and problem-solving abilities suggest that business analysis could be a suitable career path."

    };

}


/* =========================================================
   10. SHOW ASSESSMENT RESULT
   ========================================================= */

function showResult(result) {

    // Score elements
    const scoreElements = {

        technical: document.getElementById("technicalScore"),

        analytical: document.getElementById("analyticalScore"),

        creative: document.getElementById("creativeScore"),

        communication: document.getElementById("communicationScore"),

        leadership: document.getElementById("leadershipScore")

    };

    // Display scores
    Object.keys(scoreElements).forEach(function (category) {

        const element = scoreElements[category];

        if (element) {
            element.textContent = result[category];
        }

    });

    // Recommended career
    const assessmentCareer =
        document.getElementById("assessmentCareer");

    if (assessmentCareer) {
        assessmentCareer.textContent = result.career;
    }

    // Career description
    const assessmentCareerDescription =
        document.getElementById("assessmentCareerDescription");

    if (assessmentCareerDescription) {
        assessmentCareerDescription.textContent =
            result.description;
    }

    // Hide question card
    const questionCard =
        document.querySelector(".question-card");

    if (questionCard) {
        questionCard.style.display = "none";
    }

    // Hide navigation
    const navigation =
        document.querySelector(".assessment-navigation");

    if (navigation) {
        navigation.style.display = "none";
    }

    // Hide progress section
    const progress =
        document.querySelector(".assessment-progress");

    if (progress) {
        progress.style.display = "none";
    }

    // Show result section
    const resultSection =
        document.getElementById("assessmentResult");

    if (resultSection) {
        resultSection.classList.add("show");
        resultSection.style.display = "block";
    }

    // Continue button
    const continueButton =
        document.getElementById("continueDiscoverBtn");

    if (continueButton) {
        continueButton.href = "discover.html";
        continueButton.textContent = "Continue to Discover →";
    }

}


/* =========================================================
   11. SAVE ASSESSMENT TO SUPABASE
   ========================================================= */

async function saveAssessmentToDatabase(result) {

    try {

        if (typeof getCurrentCosmosUser !== "function") {
            return;
        }

        const user = getCurrentCosmosUser();

        if (!user || !user.id) {
            return;
        }

        if (typeof waitForSupabase !== "function") {
            console.warn(
                "COSMOS Supabase helper is unavailable."
            );
            return;
        }

        const supabase = await waitForSupabase();

        const { error } = await supabase
            .from("assessments")
            .upsert({

                user_id: user.id,

                technical_score: result.technical,

                analytical_score: result.analytical,

                creative_score: result.creative,

                communication_score: result.communication,

                leadership_score: result.leadership,

                recommended_career: result.career

            });

        if (error) {

            console.warn(
                "Assessment database save failed:",
                error.message
            );

        }

    } catch (error) {

        console.warn(
            "Assessment database unavailable:",
            error
        );

    }

}