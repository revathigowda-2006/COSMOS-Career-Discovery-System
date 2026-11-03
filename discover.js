
/* =========================================================
   COSMOS CAREER DISCOVERY
   STEP 02
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =================================================
       LOGIN CHECK
       ================================================= */

    if (
        typeof requireCosmosStudent === "function" &&
        !requireCosmosStudent()
    ) {
        return;
    }


    /* =================================================
       JOURNEY PROTECTION
       Assessment must be completed first.
       ================================================= */

    if (typeof protectJourneyPage === "function") {

        if (!protectJourneyPage("discover", "assessment.html")) {
            return;
        }

    } else {

        const assessmentCompleted =
            localStorage.getItem("cosmos_assessment") === "completed" ||
            localStorage.getItem("cosmos_assessment_completed") === "completed";

        if (!assessmentCompleted) {
            alert("Please complete the Career Assessment first.");
            window.location.href = "assessment.html";
            return;
        }
    }


    /* =================================================
       GET ASSESSMENT RESULT
       ================================================= */

    let assessment = null;

    try {
        const savedResult = localStorage.getItem(
            "cosmos_assessment_result"
        );

        if (savedResult) {
            assessment = JSON.parse(savedResult);
        }

        // Backward compatibility with the existing session helper.
        if (
            !assessment &&
            typeof getCosmosSession === "function"
        ) {
            const oldResult = getCosmosSession("cosmos_assessment");

            if (oldResult && typeof oldResult === "object") {
                assessment = oldResult;
            }
        }

    } catch (error) {
        console.error("Could not read assessment result:", error);
    }


    if (
        !assessment ||
        typeof assessment !== "object" ||
        !assessment.career
    ) {
        alert(
            "Assessment result not found. Please complete the assessment first."
        );

        window.location.href = "assessment.html";
        return;
    }


    /* =================================================
       GET SCORES
       Supports both result formats.
       ================================================= */

    const scores = assessment.scores || {
        technical:
            assessment.technical ??
            assessment.technicalScore ??
            0,

        analytical:
            assessment.analytical ??
            assessment.analyticalScore ??
            0,

        creative:
            assessment.creative ??
            assessment.creativeScore ??
            0,

        communication:
            assessment.communication ??
            assessment.communicationScore ??
            0,

        leadership:
            assessment.leadership ??
            assessment.leadershipScore ??
            0
    };


    /* =================================================
       CAREER
       ================================================= */

    const career =
        assessment.career || "Software Developer";

    const description =
        assessment.description ||
        assessment.careerDescription ||
        "Your COSMOS assessment shows strong potential for this career direction.";


    /* =================================================
       DISPLAY CAREER AND DESCRIPTION
       ================================================= */

    setDiscoverText("discoverCareer", career);
    setDiscoverText("discoverDescription", description);


    /* =================================================
       DISPLAY SCORES
       ================================================= */

    setDiscoverText("discoverTechnical", scores.technical ?? 0);
    setDiscoverText("discoverAnalytical", scores.analytical ?? 0);
    setDiscoverText("discoverCreative", scores.creative ?? 0);
    setDiscoverText("discoverCommunication", scores.communication ?? 0);
    setDiscoverText("discoverLeadership", scores.leadership ?? 0);


    /* =================================================
       CAREER EXPLANATION
       ================================================= */

    setDiscoverText(
        "careerExplanation",
        generateCareerExplanation(career, scores)
    );


    /* =================================================
       SAVE DISCOVER RESULT
       Keep result data separate from completion flags.
       ================================================= */

    const discoverResult = {
        career: career,
        description: description,
        technical: scores.technical ?? 0,
        analytical: scores.analytical ?? 0,
        creative: scores.creative ?? 0,
        communication: scores.communication ?? 0,
        leadership: scores.leadership ?? 0,
        completedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem(
            "cosmos_discover_result",
            JSON.stringify(discoverResult)
        );
    } catch (error) {
        console.error("Could not save Discover result:", error);
    }


    /* =================================================
       CONTINUE TO RESUME
       Save and verify Discover completion before
       navigating to the next page.
       ================================================= */

    const continueButton = document.getElementById(
        "continueResumeButton"
    );

    console.log("Discover button found:", !!continueButton);

    if (continueButton) {

        continueButton.addEventListener("click", function (event) {

            event.preventDefault();

            try {

                /* -----------------------------------------
                   1. SAVE DISCOVER COMPLETION
                   ----------------------------------------- */

                localStorage.setItem(
                    "cosmos_discover",
                    "completed"
                );

                localStorage.setItem(
                    "cosmos_discover_completed",
                    "completed"
                );


                /* -----------------------------------------
                   2. CALL THE SHARED JOURNEY FUNCTION
                   ----------------------------------------- */

                if (typeof completeDiscoverJourney === "function") {
                    completeDiscoverJourney();
                }


                /* -----------------------------------------
                   3. ENSURE BOTH FLAGS ARE SAVED
                   ----------------------------------------- */

                localStorage.setItem(
                    "cosmos_discover",
                    "completed"
                );

                localStorage.setItem(
                    "cosmos_discover_completed",
                    "completed"
                );


                /* -----------------------------------------
                   4. VERIFY DISCOVER COMPLETION
                   ----------------------------------------- */

                const discoverStatus =
                    localStorage.getItem("cosmos_discover");

                const discoverCompleted =
                    localStorage.getItem(
                        "cosmos_discover_completed"
                    );

                if (
                    discoverStatus !== "completed" ||
                    discoverCompleted !== "completed"
                ) {
                    throw new Error(
                        "Discover completion could not be verified."
                    );
                }

                console.log(
                    "COSMOS Discover completed successfully."
                );

                console.log("Discover status:", discoverStatus);

                console.log(
                    "Discover completed flag:",
                    discoverCompleted
                );


                /* -----------------------------------------
                   5. NAVIGATE TO RESUME ANALYSIS
                   ----------------------------------------- */

                window.location.href = "resume.html";

            } catch (error) {

                console.error(
                    "Discover saving error:",
                    error
                );

                alert(
                    "Could not save Discover progress. " +
                    "Please try again."
                );
            }

        });

    } else {

        console.error(
            "Continue to Resume button was not found. " +
            "Check that its HTML id is continueResumeButton."
        );

    }

});


/* =========================================================
   HELPER: DISPLAY TEXT
   ========================================================= */

function setDiscoverText(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   CAREER EXPLANATION
   ========================================================= */

function generateCareerExplanation(career, scores) {

    switch (career) {

        case "Software Developer":

            return "Your results suggest an interest in programming, technology and problem-solving. Software development allows you to build applications, websites and technology solutions.";

        case "Data Analyst":

            return "Your analytical profile suggests that you may enjoy working with data, finding patterns and using logical reasoning to solve problems.";

        case "UI/UX Designer":

            return "Your creative strengths suggest an interest in design and digital experiences. UI/UX design combines creativity, problem-solving and understanding how people interact with technology.";

        case "Project Manager":

            return "Your leadership profile suggests that you may enjoy organizing people, managing responsibilities and helping teams achieve their goals.";

        case "Business Analyst":
  
            return "Your communication and problem-solving abilities suggest that you may enjoy understanding business requirements and helping organizations make informed decisions.";

        default:

            return "Your COSMOS assessment has identified " +
                career +
                " as a potential career direction based on your current strengths and interests.";

    }

}
