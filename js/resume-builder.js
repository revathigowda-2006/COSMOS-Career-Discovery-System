document.addEventListener("DOMContentLoaded", initializeResumeBuilder);

function initializeResumeBuilder() {
    if (typeof requireCosmosStudent === "function" && !requireCosmosStudent()) return;

    const saved = readResumeData();
    const user = typeof getCurrentCosmosUser === "function" ? getCurrentCosmosUser() : null;
    const message = document.getElementById("builderMessage");

    if ((!saved || typeof saved !== "object") && message) {
        message.textContent = "Analyze your resume first. Your saved analysis will appear here.";
    }

    setField("fullName", saved?.name || user?.full_name || user?.fullName || "");
    setField("headline", saved?.career || "");
    setField("email", saved?.email || user?.email || "");
    setField("phone", saved?.phone || "");
    setField("location", saved?.location || "");
    setField("summary", saved?.analysis || "");
    setField("education", saved?.education || "");
    setField(
        "skills",
        Array.isArray(saved?.skills)
            ? saved.skills.join(", ")
            : (saved?.skills || "")
    );
    setField("experience", saved?.experience || "");
    setField("projects", saved?.projects || "");
    setField("certifications", saved?.certifications || "");

    // Keep the signature field empty unless the user enters a name.
    setField("signatureName", saved?.signatureName || "");

    document
        .querySelectorAll(".builder-panel input, .builder-panel textarea")
        .forEach(field => {
            field.addEventListener("input", renderResumePreview);
        });

    document
        .getElementById("downloadResumeButton")
        ?.addEventListener("click", downloadResumePdf);

    document
        .getElementById("linkedinJobsButton")
        ?.addEventListener("click", openLinkedInJobs);

    renderResumePreview();
}

function readResumeData() {
    if (typeof getCosmosSession === "function") {
        try {
            const sessionValue = getCosmosSession("cosmos_resume");
            if (sessionValue && typeof sessionValue === "object") {
                return sessionValue;
            }
        } catch (error) {
            console.warn("Could not read resume session:", error);
        }
    }

    try {
        const raw = localStorage.getItem("cosmos_resume");
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn("Could not read saved resume:", error);
        return null;
    }
}

function setField(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value || "";
}

function fieldValue(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function setPreview(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
}

function toggleSection(id, hasContent) {
    const section = document.getElementById(id);
    if (section) section.hidden = !hasContent;
}

function renderResumePreview() {
    const name = fieldValue("fullName") || "Your Name";
    const headline = fieldValue("headline");

    const contact = [
        fieldValue("email"),
        fieldValue("phone"),
        fieldValue("location")
    ]
        .filter(Boolean)
        .join("  •  ");

    const summary = fieldValue("summary");
    const education = fieldValue("education");
    const experience = fieldValue("experience");
    const projects = fieldValue("projects");
    const certifications = fieldValue("certifications");
    const signature = fieldValue("signatureName");

    const skills = fieldValue("skills")
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(Boolean);

    setPreview("previewName", name);
    setPreview("previewHeadline", headline);
    setPreview("previewContact", contact);
    setPreview("previewSummary", summary);
    setPreview("previewEducation", education);
    setPreview("previewExperience", experience);
    setPreview("previewProjects", projects);
    setPreview("previewCertifications", certifications);
    setPreview("previewSignature", signature);

    toggleSection("summarySection", Boolean(summary));
    toggleSection("educationSection", Boolean(education));
    toggleSection("experienceSection", Boolean(experience));
    toggleSection("projectsSection", Boolean(projects));
    toggleSection("certificationsSection", Boolean(certifications));
    toggleSection("skillsSection", skills.length > 0);
    toggleSection("signatureSection", Boolean(signature));

    const skillList = document.getElementById("previewSkills");

    if (skillList) {
        skillList.replaceChildren();

        skills.forEach(skill => {
            const chip = document.createElement("span");
            chip.className = "preview-skill";
            chip.textContent = skill;
            skillList.appendChild(chip);
        });
    }
}

async function downloadResumePdf() {
    const preview = document.getElementById("resumePreview");
    const button = document.getElementById("downloadResumeButton");
    const message = document.getElementById("builderMessage");

    if (!preview) return;

    const printStyle = document.createElement("style");
    printStyle.id = "cosmosResumePrintStyle";
    printStyle.textContent = `
        @page {
            size: A4 portrait;
            margin: 12mm;
        }

        @media print {
            html,
            body {
                width: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                overflow: visible !important;
            }

            body * {
                visibility: hidden !important;
            }

            .main-header,
            .builder-intro,
            .builder-panel {
                display: none !important;
            }

            .builder-layout,
            .builder-columns,
            .resume-preview-wrap {
                display: contents !important;
            }

            #resumePreview,
            #resumePreview * {
                visibility: visible !important;
            }

            #resumePreview {
                position: static !important;
                display: block !important;
                width: 100% !important;
                min-height: 0 !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #202a3a !important;
                box-sizing: border-box !important;
            }

            #resumePreview [hidden] {
                display: none !important;
            }

            #resumePreview .preview-section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    `;

    document.head.appendChild(printStyle);

    if (message) {
        message.textContent =
            "In the print window, choose Save as PDF to save your resume.";
    }

    const cleanup = () => printStyle.remove();
    window.addEventListener("afterprint", cleanup, { once: true });

    try {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        window.print();
    } catch (error) {
        console.error("Resume print failed:", error);

        if (message) {
            message.textContent =
                "Could not open print preview. Please try again.";
        }

        cleanup();
    } finally {
        if (button) button.blur();
        setTimeout(cleanup, 1500);
    }
}

function openLinkedInJobs() {
    const keywords = fieldValue("headline") || "jobs";

    const url =
        "https://www.linkedin.com/jobs/search/?keywords=" +
        encodeURIComponent(keywords);

    window.open(url, "_blank", "noopener,noreferrer");
}