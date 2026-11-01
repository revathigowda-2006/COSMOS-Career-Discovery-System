
/* =========================================================
   COSMOS JOURNEY
   CONSISTENT COMPLETION STATUS
   ========================================================= */


/* =========================================================
   CAREER ASSESSMENT
   ========================================================= */

function completeAssessmentJourney() {
    localStorage.setItem("cosmos_assessment_completed", "completed");
    localStorage.setItem("cosmos_assessment", "completed");
}


/* =========================================================
   DISCOVER
   ========================================================= */

function completeDiscoverJourney() {
    localStorage.setItem("cosmos_discover_completed", "completed");
    localStorage.setItem("cosmos_discover", "completed");
}


/* =========================================================
   RESUME ANALYSIS
   ========================================================= */

function completeResumeJourney() {
    localStorage.setItem("cosmos_resume_completed", "completed");
    localStorage.setItem("cosmos_resume_status", "completed");
    
}


/* =========================================================
   TECHNICAL TEST
   ========================================================= */

function completeTestJourney() {
    localStorage.setItem("cosmos_test_completed", "completed");
    localStorage.setItem("cosmos_test_status", "completed");

    // IMPORTANT:
    // Do not overwrite cosmos_test.
    // It must preserve the full technical test result.
}


/* =========================================================
   CAREER RECOMMENDATION
   ========================================================= */

function completeCareerJourney() {
    localStorage.setItem("cosmos_career_completed", "completed");

    // IMPORTANT:
    // Do not overwrite cosmos_career.
    // It must preserve the saved career recommendation.
}


/* =========================================================
   CERTIFICATE
   ========================================================= */

function completeCertificateJourney() {
    localStorage.setItem("cosmos_certificate_completed", "completed");
    localStorage.setItem("cosmos_certificate", "completed");
}


/* =========================================================
   READ STORED VALUE
   Supports JSON and plain text.
   ========================================================= */

function getJourneyStoredValue(key) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }

    } catch (error) {
        console.error(
            "COSMOS storage read error:",
            key,
            error
        );

        return null;
    }
}


/* =========================================================
   CHECK COMPLETION VALUE
   ========================================================= */

function isJourneyCompleted(value) {
    return (
        value === true ||
        value === "true" ||
        value === "completed" ||
        (
            value !== null &&
            typeof value === "object" &&
            (
                value.completed === true ||
                value.completed === "true" ||
                value.completed === "completed" ||
                value.status === "completed"
            )
        )
    );
}


/* =========================================================
   GET JOURNEY COMPLETION STATUS
   ========================================================= */

function getJourneyStatus() {

    /* -----------------------------------------------
       READ TEST RESULT
       ----------------------------------------------- */

    const testResult = getJourneyStoredValue("cosmos_test");


    /* -----------------------------------------------
       READ RESUME RESULT
       ----------------------------------------------- */

    const resumeResult = getJourneyStoredValue("cosmos_resume");


    /* -----------------------------------------------
       ASSESSMENT STATUS
       ----------------------------------------------- */

    const assessmentCompleted =
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_assessment")
        ) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_assessment_completed")
        );


    /* -----------------------------------------------
       DISCOVER STATUS
       ----------------------------------------------- */

    const discoverCompleted =
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_discover")
        ) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_discover_completed")
        );


    /* -----------------------------------------------
       RESUME ANALYSIS STATUS
       ----------------------------------------------- */

    let resumeCompleted =
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_resume_status")
        ) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_resume_completed")
        ) ||
        isJourneyCompleted(resumeResult);


    if (
        !resumeCompleted &&
        resumeResult &&
        typeof resumeResult === "object"
    ) {
        resumeCompleted = (
            resumeResult.analysis != null ||
            resumeResult.analyzedAt != null ||
            resumeResult.career != null ||
            resumeResult.skills != null
        );
    }


    /* -----------------------------------------------
       BACKWARD COMPATIBILITY FOR RESUME SESSION
       ----------------------------------------------- */

    if (
        !resumeCompleted &&
        typeof getCosmosSession === "function"
    ) {
        try {
            const savedResume = getCosmosSession("cosmos_resume");

            resumeCompleted = Boolean(savedResume);

        } catch (error) {
            console.warn(
                "COSMOS resume session read error:",
                error
            );
        }
    }


    /* -----------------------------------------------
       TECHNICAL TEST STATUS
       ----------------------------------------------- */

    let testCompleted =
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_test_completed")
        ) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_test_status")
        );


    if (
        !testCompleted &&
        testResult &&
        typeof testResult === "object"
    ) {
        testCompleted = (
            testResult.score !== undefined ||
            testResult.percentage !== undefined ||
            testResult.scorePercentage !== undefined ||
            testResult.completed === true
        );
    }


    /* -----------------------------------------------
       CAREER RECOMMENDATION STATUS
       ----------------------------------------------- */

    const careerResult = getJourneyStoredValue("cosmos_career");

    const careerCompleted =
        isJourneyCompleted(careerResult) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_career_completed")
        ) ||
        (
            careerResult !== null &&
            typeof careerResult === "object" &&
            Boolean(
                careerResult.career ||
                careerResult.recommendedCareer ||
                careerResult.title ||
                careerResult.recommendation
            )
        );


    /* -----------------------------------------------
       CERTIFICATE STATUS
       ----------------------------------------------- */

    const certificateCompleted =
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_certificate")
        ) ||
        isJourneyCompleted(
            getJourneyStoredValue("cosmos_certificate_completed")
        );


    /* -----------------------------------------------
       RETURN ALL JOURNEY STATUSES
       ----------------------------------------------- */

    return {
        assessment: assessmentCompleted,
        discover: discoverCompleted,
        resume: resumeCompleted,
        test: testCompleted,
        career: careerCompleted,
        certificate: certificateCompleted
    };
}
