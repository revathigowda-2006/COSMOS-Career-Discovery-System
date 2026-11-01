/* =========================================================
   COSMOS - JOB OPPORTUNITIES
   Live Job Search Using Supabase Edge Functions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // 1. GET HTML ELEMENTS
    // -----------------------------------------------------

    const keywordInput = document.getElementById("jobKeyword");
    const locationInput = document.getElementById("jobLocation");
    const searchButton = document.getElementById("searchJobsBtn");
    const statusBox = document.getElementById("jobSearchStatus");
    const resultsBox = document.getElementById("jobResults");
    const careerElement = document.getElementById("recommendedCareer");

    // Stop if this page does not contain the job search section.
    if (
        !keywordInput ||
        !locationInput ||
        !searchButton ||
        !statusBox ||
        !resultsBox
    ) {
        return;
    }

    // -----------------------------------------------------
    // 2. LOAD RECOMMENDED CAREER
    // -----------------------------------------------------

    let recommendedCareer = "";

    try {
        if (typeof getCosmosSession === "function") {
            const savedCareer = getCosmosSession("cosmos_career");

            recommendedCareer =
                savedCareer?.recommendedCareer ||
                savedCareer?.career ||
                "";
        }
    } catch (error) {
        console.warn("Could not load saved career:", error);
    }

    // Also check the career recommendation displayed on the page.
    if (!recommendedCareer && careerElement) {
        const displayedCareer = careerElement.textContent.trim();

        if (
            displayedCareer &&
            !/analysing|loading|not available/i.test(displayedCareer)
        ) {
            recommendedCareer = displayedCareer;
        }
    }

    // Use the recommended career as the default search keyword.
    keywordInput.value = recommendedCareer || "Software Developer";

    // -----------------------------------------------------
    // 3. HELPER FUNCTIONS
    // -----------------------------------------------------

    function setStatus(message, type = "") {
        statusBox.textContent = message;
        statusBox.className = "job-search-status";

        if (type) {
            statusBox.classList.add(type);
        }
    }

    function createElement(tag, className, text = "") {
        const element = document.createElement(tag);

        element.className = className;
        element.textContent = text;

        return element;
    }

    function formatDate(dateValue) {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    async function explainFunctionError(error) {
        const status = error?.context?.status;
        let responseMessage = "";

        if (error?.context && typeof error.context.clone === "function") {
            try {
                const response = error.context.clone();
                const contentType = response.headers.get("content-type") || "";

                if (contentType.includes("application/json")) {
                    const body = await response.json();
                    responseMessage = body?.error || body?.message || "";
                } else {
                    responseMessage = (await response.text()).slice(0, 300);
                }
            } catch (readError) {
                console.warn(
                    "Could not read the job service error response.",
                    readError
                );
            }
        }

        if (status === 404) {
            return "The smart-processor Edge Function was not found. Check that it is deployed to the same Supabase project used by config.js.";
        }

        if (status === 401 || status === 403) {
            return "Supabase rejected the request. For COSMOS username/password login, set Verify JWT off for smart-processor and save the change.";
        }

        if (
            status === 503 ||
            /ADZUNA_APP_ID|ADZUNA_APP_KEY|not configured/i.test(responseMessage)
        ) {
            return "The job-search function is deployed, but its Adzuna API settings are missing. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to Supabase secrets.";
        }

        if (status) {
            return `The smart-processor function returned HTTP ${status}${
                responseMessage
                    ? ": " + responseMessage
                    : ". Check its Supabase logs."
            }`;
        }

        return "Could not contact the smart-processor function. Check its URL, deployment, and your browser network connection.";
    }

    // -----------------------------------------------------
    // 4. DISPLAY JOB RESULTS
    // -----------------------------------------------------

    function displayJobs(jobs) {
        resultsBox.replaceChildren();

        if (!Array.isArray(jobs) || jobs.length === 0) {
            setStatus(
                "No matching jobs were found. Try another career or location.",
                "job-status-empty"
            );

            return;
        }

        jobs.forEach((job) => {
            const card = createElement("article", "job-card");

            const badge = createElement(
                "span",
                "job-card-badge",
                "JOB OPPORTUNITY"
            );

            const title = createElement(
                "h3",
                "job-card-title",
                job.title || "Job title unavailable"
            );

            const company = createElement(
                "p",
                "job-card-company",
                job.company || "Company not specified"
            );

            const location = createElement(
                "p",
                "job-card-location",
                "📍 " + (job.location || "Location not specified")
            );

            card.append(badge, title, company, location);

            if (job.postedAt) {
                card.appendChild(
                    createElement(
                        "p",
                        "job-card-date",
                        "Posted: " + formatDate(job.postedAt)
                    )
                );
            }

            if (job.description) {
                card.appendChild(
                    createElement(
                        "p",
                        "job-card-description",
                        job.description
                    )
                );
            }

            // Only allow normal HTTP or HTTPS application links.
            if (job.url) {
                try {
                    const applicationURL = new URL(job.url);

                    if (
                        applicationURL.protocol === "https:" ||
                        applicationURL.protocol === "http:"
                    ) {
                        const applyLink = createElement(
                            "a",
                            "job-apply-link",
                            "View & Apply ↗"
                        );

                        applyLink.href = applicationURL.href;
                        applyLink.target = "_blank";
                        applyLink.rel = "noopener noreferrer";

                        card.appendChild(applyLink);
                    }
                } catch (error) {
                    console.warn("Invalid job application URL.");
                }
            }

            resultsBox.appendChild(card);
        });

        setStatus(
            `Found ${jobs.length} job listing(s). Check each listing before applying.`,
            "job-status-success"
        );
    }

    // -----------------------------------------------------
    // 5. SEARCH JOBS THROUGH SUPABASE
    // -----------------------------------------------------

    let latestRequest = 0;

    async function searchJobs() {
        const requestId = ++latestRequest;

        const keyword = keywordInput.value.trim();
        const location = locationInput.value.trim();

        if (!keyword) {
            setStatus(
                "Please enter a career or job title.",
                "job-status-error"
            );

            keywordInput.focus();
            return;
        }

        if (!location) {
            setStatus(
                "Please enter your preferred location.",
                "job-status-error"
            );

            locationInput.focus();
            return;
        }

        searchButton.disabled = true;
        searchButton.textContent = "Searching...";

        resultsBox.replaceChildren();

        const loading = createElement("div", "job-loading");
        const spinner = createElement("span", "job-spinner");

        const loadingText = createElement(
            "span",
            "job-loading-text",
            "Searching job opportunities..."
        );

        loading.append(spinner, loadingText);
        resultsBox.appendChild(loading);

        setStatus("Connecting to the job-search service...");

        try {
            // config.js may still be loading Supabase from its CDN.
            const supabaseClient = window.cosmosSupabase ||
                (typeof waitForSupabase === "function"
                    ? await waitForSupabase()
                    : null);

            if (!supabaseClient?.functions) {
                throw new Error(
                    "Supabase is unavailable. Check config.js and its Supabase library."
                );
            }

            const { data, error } =
                await supabaseClient.functions.invoke(
                    "smart-processor",
                    {
                        body: {
                            keyword: keyword,
                            location: location
                        }
                    }
                );

            // Ignore an older search if a newer one has started.
            if (requestId !== latestRequest) {
                return;
            }

            if (error) {
                console.error("COSMOS job search error:", error);
                throw new Error(await explainFunctionError(error));
            }

            if (!data || !Array.isArray(data.jobs)) {
                throw new Error(
                    data?.error ||
                    "Unexpected response from the job-search service."
                );
            }

            displayJobs(data.jobs);

        } catch (error) {
            if (requestId !== latestRequest) {
                return;
            }

            console.error("COSMOS job search failed:", error);
            resultsBox.replaceChildren();

            setStatus(
                error.message ||
                "Unable to load jobs. Please try again.",
                "job-status-error"
            );

        } finally {
            if (requestId === latestRequest) {
                searchButton.disabled = false;
                searchButton.textContent = "Find Jobs →";
            }
        }
    }

    // -----------------------------------------------------
    // 6. BUTTON CLICK
    // -----------------------------------------------------

    searchButton.addEventListener("click", searchJobs);

    // -----------------------------------------------------
    // 7. PRESS ENTER TO SEARCH
    // -----------------------------------------------------

    [keywordInput, locationInput].forEach((input) => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchJobs();
            }
        });
    });

    // -----------------------------------------------------
    // 8. INITIAL MESSAGE
    // -----------------------------------------------------

    setStatus(
        "Enter a location and select Find Jobs to search."
    );

});