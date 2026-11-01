/* =========================================================
   COSMOS - DEPARTMENT-BASED TECHNICAL TEST
   30 department-specific questions
   10-minute timer | 60% pass mark
   Retest allowed if the student fails | Supabase integration
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("COSMOS DEPARTMENT TEST LOADED");

    /* =====================================================
       LOGIN AND RETAKE PROTECTION
       ===================================================== */

    if (typeof requireCosmosStudent !== "function") {
        console.error("COSMOS login helper is missing.");
        return;
    }

    const loggedInUser = requireCosmosStudent();
    if (!loggedInUser) return;

    /* RETEST SETTINGS: use Infinity for unlimited retests, or e.g. 3 */
    const MAX_ATTEMPTS = Infinity;

    const attemptsMade =
        Number(localStorage.getItem("cosmos_test_attempts")) || 0;

    let previousResult = null;

    try {
        previousResult = JSON.parse(
            localStorage.getItem("cosmos_test") || "null"
        );
    } catch {
        previousResult = null;
    }

    // Passed students (or students out of attempts) cannot retake.
    if (
        previousResult &&
        (previousResult.passed || attemptsMade >= MAX_ATTEMPTS)
    ) {
        alert(
            previousResult.passed
                ? "You have already passed your Technical Test."
                : "You have used all your test attempts."
        );
        window.location.replace("dashboard.html");
        return;
    }

    // Failed students get a fresh test: clear the old failed result.
    if (previousResult && !previousResult.passed) {
        localStorage.removeItem("cosmos_test");
        localStorage.removeItem("cosmos_test_completed");
        localStorage.removeItem("cosmos_test_status");
    }

    if (typeof protectJourneyPage === "function") {
        if (!protectJourneyPage("test", "resume.html")) return;
    }

    /* =====================================================
       DOM ELEMENTS - EXISTING HTML IDS PRESERVED
       ===================================================== */

    const $ = id => document.getElementById(id);

    const timer = $("timer");
    const progressText = $("progressText");
    const progressFill = $("testProgressFill");
    const questionCategory = $("questionCategory");
    const questionText = $("questionText");
    const optionsContainer = $("optionsContainer");
    const previousButton = $("previousButton");
    const nextButton = $("nextButton");
    const testArea = $("testArea");
    const resultSection = $("resultSection");

    const resultIcon = $("resultIcon");
    const resultTitle = $("resultTitle");
    const resultMessage = $("resultMessage");
    const scoreValue = $("scoreValue");
    const percentageValue = $("percentageValue");
    const correctAnswers = $("correctAnswers");
    const wrongAnswers = $("wrongAnswers");
    const testStatus = $("testStatus");
    const recommendedCareer = $("recommendedCareer");
    const careerDescription = $("careerDescription");
    const certificateMessage = $("certificateMessage");
    const careerButton = $("careerButton");

    const requiredElements = [
        timer, progressText, progressFill, questionCategory,
        questionText, optionsContainer, previousButton,
        nextButton, testArea, resultSection, resultIcon,
        resultTitle, resultMessage, scoreValue,
        percentageValue, correctAnswers, wrongAnswers,
        testStatus, recommendedCareer, careerDescription,
        certificateMessage, careerButton
    ];

    if (requiredElements.some(element => !element)) {
        console.error(
            "COSMOS: Required test.html elements are missing. Check the HTML IDs."
        );
        return;
    }

    /* =====================================================
       LOAD REGISTERED STUDENT PROFILE
       ===================================================== */

    let profile = {};

    try {
        profile = await Promise.race([
            loadStudentProfile(loggedInUser),
            new Promise(resolve => setTimeout(() => resolve({}), 8000))
        ]);
    } catch (error) {
        console.error("COSMOS profile loading failed:", error);
    }

    profile = profile || {};

    const departmentFields = [
        "department",
        "department_name",
        "student_department",
        "selected_department",
        "course",
        "course_name",
        "program",
        "program_name",
        "degree",
        "degree_name",
        "stream",
        "major",
        "branch",
        "specialization",
        "field",
        "study_field",
        "academic_department"
    ];

    const departmentValue = getFirstValue(profile, departmentFields);
    const department = normalizeDepartment(departmentValue);

    const careerDirection = String(
        profile.career_direction ||
        profile.careerDirection ||
        profile.interested_career ||
        profile.career_interest ||
        profile.career_goal ||
        ""
    ).trim();

    console.log("COSMOS profile loaded:", profile);
    console.log("Registered course:", departmentValue);
    console.log("Selected question bank:", department);

    if (!department) {
        console.error(
            "COSMOS: Registered department is missing or unrecognized.",
            departmentValue
        );

        alert(
            "We could not identify your registered department. " +
            "Your test has not started. Please check your student " +
            "profile or contact your administrator."
        );

        return;
    }

    const heroDescription = document.querySelector(".page-hero p");

    if (heroDescription) {
        heroDescription.textContent =
            `Your ${departmentLabel(department)} test contains 30 questions related to your department.`;
    }

    /* =====================================================
       DEPARTMENT QUESTION BANKS
       ===================================================== */

    const questionBanks = createQuestionBanks();
    const departmentQuestions = questionBanks[department];

    if (!departmentQuestions || departmentQuestions.length !== 30) {
        console.error(
            "COSMOS: Invalid question bank for department:",
            department,
            "Question count:",
            departmentQuestions?.length ?? 0
        );

        alert(
            "The question bank for your department must contain " +
            "exactly 30 questions. Your test has not started. " +
            "Please contact your administrator."
        );

        return;
    }

    const questions = shuffle(departmentQuestions);

    console.log(
        `COSMOS: Loaded ${questions.length} questions for ${departmentLabel(department)}.`
    );

    /* =====================================================
       TEST STATE
       ===================================================== */

    const testQuestions = questions.map(prepareQuestion);

    let currentQuestionIndex = 0;
    const userAnswers = new Array(30).fill(null);

    let timeRemaining = 10 * 60;
    let timerInterval = null;
    let testFinished = false;

    resultSection.hidden = true;
    resultSection.style.display = "none";
    careerButton.style.display = "none";

    renderQuestion();
    startTimer();

    /* =====================================================
       QUESTION HELPER
       ===================================================== */

    function q(category, question, options, answer) {
        return { category, question, options, answer };
    }

    function createQuestionBanks() {

        const computer = [
            q("PROGRAMMING", "Which Python keyword defines a function?", ["function", "def", "fun", "define"], 1),
            q("PROGRAMMING", "Which data type stores True or False?", ["String", "Integer", "Boolean", "Float"], 2),
            q("PROGRAMMING", "Which Python function displays output?", ["display()", "write()", "print()", "output()"], 2),
            q("DATA STRUCTURES", "Which data structure follows FIFO?", ["Stack", "Queue", "Tree", "Graph"], 1),
            q("JAVA", "Which keyword declares a class in Java?", ["class", "new", "object", "define"], 0),
            q("C PROGRAMMING", "Which function prints formatted output in C?", ["print()", "printf()", "display()", "write()"], 1),
            q("WEB DEVELOPMENT", "Which HTML tag creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1),
            q("CSS", "Which CSS property changes text colour?", ["font-color", "text-color", "color", "foreground"], 2),
            q("JAVASCRIPT", "Which operator checks strict equality?", ["=", "==", "===", "!="], 2),
            q("SQL", "Which SQL command retrieves records?", ["GET", "SELECT", "READ", "OPEN"], 1),
            q("SQL", "Which SQL clause filters rows?", ["WHERE", "ORDER", "TABLE", "COLUMN"], 0),
            q("DBMS", "What does DBMS stand for?", ["Database Management System", "Data Backup Machine System", "Digital Base Management Software", "Database Model Service"], 0),
            q("NETWORKING", "What does IP stand for?", ["Internet Protocol", "Internal Program", "Information Process", "Internet Program"], 0),
            q("NETWORKING", "Which protocol is commonly used for secure web browsing?", ["HTTP", "FTP", "HTTPS", "SMTP"], 2),
            q("CYBERSECURITY", "What is phishing?", ["A database backup", "A deceptive attempt to steal information", "A programming language", "A monitor"], 1),
            q("AI", "What does AI stand for?", ["Automated Internet", "Artificial Intelligence", "Advanced Interface", "Artificial Integration"], 1),
            q("AI", "Machine learning is a branch of which field?", ["Networking", "Artificial Intelligence", "Accounting", "Web design"], 1),
            q("GIT", "Which command copies a remote repository?", ["git clone", "git copy", "git download", "git start"], 0),
            q("OOP", "Which concept allows different implementations through a common interface?", ["Encapsulation", "Polymorphism", "Compilation", "Iteration"], 1),
            q("SOFTWARE TESTING", "What is software testing primarily used for?", ["Finding defects", "Increasing brightness", "Deleting documentation", "Replacing requirements"], 0),
            q("PROGRAMMING", "Which loop repeats while a condition is true?", ["while", "switch", "class", "import"], 0),
            q("DATA STRUCTURES", "What is an array commonly used for?", ["Storing multiple values", "Connecting a monitor", "Printing a page only", "Creating a password"], 0),
            q("OOP", "Which concept bundles data and methods together?", ["Encapsulation", "Iteration", "Sorting", "Compilation"], 0),
            q("DATA STRUCTURES", "Which structure follows LIFO?", ["Queue", "Stack", "Graph", "Network"], 1),
            q("SQL", "Which command adds a new record?", ["INSERT", "SELECT", "DISPLAY", "FETCH ALL"], 0),
            q("DATABASE", "What is a primary key?", ["A field that uniquely identifies a record", "A duplicate row", "A chart heading", "A password hint"], 0),
            q("NETWORKING", "What does DNS translate?", ["Domain names into IP addresses", "Images into documents", "Passwords into usernames", "HTML into SQL"], 0),
            q("WEB DEVELOPMENT", "Which language adds interactive behaviour to web pages?", ["JavaScript", "SQL", "C only", "XML only"], 0),
            q("CYBERSECURITY", "What does two-factor authentication add?", ["An additional verification step", "A second username for everyone", "A public password", "A database table"], 0),
            q("SOFTWARE ENGINEERING", "What is version control used for?", ["Tracking changes to files and code", "Increasing screen brightness", "Removing all backups", "Replacing testing"], 0)
        ];

        const dataScience = [
            q("DATA SCIENCE", "What is a dataset?", ["A collection of related data", "A keyboard", "A network cable", "A monitor"], 0),
            q("PYTHON", "Which Python library is widely used for tabular data manipulation?", ["Pandas", "Turtle only", "Random only", "Audio"], 0),
            q("STATISTICS", "What does the median represent?", ["The middle value in ordered data", "Always the largest value", "The sum of values", "The number of columns"], 0),
            q("SQL", "Which SQL clause groups rows for aggregate calculations?", ["GROUP BY", "ORDER ONLY", "JOIN ALL", "CREATE ROW"], 0),
            q("VISUALIZATION", "Which chart is often suitable for showing a trend over time?", ["Line chart", "Pie chart for every case", "Word cloud", "Folder tree"], 0),
            q("MACHINE LEARNING", "What is a training dataset used for?", ["Fitting a model", "Displaying a website header", "Creating a password", "Replacing evaluation"], 0),
            q("DATA CLEANING", "Why handle missing values?", ["They can affect analysis and model results", "They always improve accuracy", "They are always zeros", "They never matter"], 0),
            q("STATISTICS", "Correlation measures:", ["Association between variables", "Proof of causation in every case", "Number of files", "Screen size"], 0),
            q("SQL", "Which keyword removes duplicate rows from query results?", ["DISTINCT", "UNIQUEFILE", "DELETE ALL", "REMOVE"], 0),
            q("MACHINE LEARNING", "What is overfitting?", ["A model fits training data too closely and generalizes poorly", "A model has no input", "A dataset contains only text", "A chart has too many colours"], 0),
            q("PYTHON", "Which library is commonly used for numerical arrays in Python?", ["NumPy", "Flask only", "Requests only", "BeautifulSoup only"], 0),
            q("STATISTICS", "Standard deviation describes:", ["Spread of values around the mean", "The first row only", "A database key", "Number of categories only"], 0),
            q("DATA ANALYSIS", "Why explore data before modelling?", ["To understand distributions, quality and patterns", "To guarantee the desired result", "To avoid errors", "To remove all variables"], 0),
            q("DATABASE", "A primary key should uniquely identify:", ["A record in a table", "Every server worldwide", "A chart title", "A file extension"], 0),
            q("VISUALIZATION", "A pie chart is most appropriate for:", ["Showing parts of a whole with limited categories", "Every time series", "Source code", "Thousands of labels"], 0),
            q("MACHINE LEARNING", "Why keep a test dataset separate?", ["To evaluate performance on data not used for training", "To train on answers twice", "To hide errors", "To increase missing values"], 0),
            q("DATA ETHICS", "Why protect personal data?", ["To respect privacy and reduce misuse", "To make all data public", "To avoid access controls", "To share passwords"], 0),
            q("SQL", "Which join returns matching rows from both tables?", ["INNER JOIN", "CROSS DELETE", "DROP JOIN", "ONLY JOIN"], 0),
            q("DATA SCIENCE", "A feature in a machine-learning dataset is:", ["An input variable used by a model", "Always the final prediction", "A password", "A chart border"], 0),
            q("ANALYTICS", "Why document an analysis workflow?", ["To improve reproducibility and understanding", "To prevent verification", "To remove sources", "To guarantee profit"], 0),
            q("PYTHON", "Which Python expression creates a list?", ["[1, 2, 3]", "{list: 1}", "(list) only", "<1, 2, 3>"], 0),
            q("PANDAS", "What does a pandas DataFrame represent?", ["Two-dimensional tabular data", "A network protocol", "A password manager", "A processor"], 0),
            q("STATISTICS", "What is the mode of a dataset?", ["The most frequently occurring value", "The sum of values", "Always the middle value", "The largest value only"], 0),
            q("MACHINE LEARNING", "Classification models commonly predict:", ["Categories or class labels", "Only continuous coordinates", "Database passwords", "File extensions"], 0),
            q("MACHINE LEARNING", "Regression models commonly predict:", ["Numerical values", "Only class names", "Only image formats", "Usernames"], 0),
            q("DATA PREPROCESSING", "Why scale features in some workflows?", ["To place numerical features on comparable scales", "To make every label identical", "To remove every target", "To guarantee perfect predictions"], 0),
            q("STATISTICS", "What does a p-value help assess?", ["Compatibility of data with a specified null hypothesis", "Computer monitor size", "Spreadsheet columns", "Database cost"], 0),
            q("SQL", "Which SQL aggregate function counts rows?", ["COUNT()", "TOTALROWS()", "NUMBEROF()", "ROWSUM()"], 0),
            q("DATA ETHICS", "What is data anonymization intended to do?", ["Reduce the ability to identify individuals", "Publish personal details", "Reveal private passwords", "Guarantee error-free data"], 0),
            q("MODEL EVALUATION", "What does a confusion matrix summarize?", ["Classification prediction outcomes", "Website colours", "Employee attendance", "Storage size"], 0)
        ];

        const commerce = [
            q("ACCOUNTING", "The basic accounting equation is:", ["Assets = Liabilities + Equity", "Assets = Revenue − Cash", "Profit = Assets + Drawings", "Liabilities = Sales + Expenses"], 0),
            q("ACCOUNTING", "Which account records money held in a bank?", ["Bank account", "Depreciation only", "Drawings only", "Purchase returns only"], 0),
            q("ACCOUNTING", "A balance sheet shows:", ["Financial position at a point in time", "Only daily sales calls", "Employee attendance", "Marketing ideas"], 0),
            q("ACCOUNTING", "Which is generally an asset?", ["Bank balance", "Outstanding loan", "Accounts payable", "Unpaid expense"], 0),
            q("FINANCE", "What is simple interest on ₹1,000 at 10% yearly for 2 years?", ["₹100", "₹150", "₹200", "₹300"], 2),
            q("FINANCE", "Revenue minus expenses is generally:", ["Profit or loss", "Share count", "Inventory units", "Tax rate"], 0),
            q("EXCEL", "Which formula adds cells A1 to A5?", ["=ADD(A1:A5)", "=SUM(A1:A5)", "=TOTAL(A1-A5)", "=PLUS(A1:A5)"], 1),
            q("EXCEL", "Which spreadsheet feature arranges data by criteria?", ["Sort", "Zoom", "Spell check only", "Page colour"], 0),
            q("BANKING", "What is the main purpose of a savings account?", ["Hold money and provide banking services", "Prepare advertisements", "Design websites", "Calculate attendance"], 0),
            q("ECONOMICS", "If demand rises and supply stays constant, price generally tends to:", ["Rise", "Become zero", "Fall in every case", "Remain legally fixed"], 0),
            q("TAXATION", "What is the main purpose of taxation?", ["Fund public expenditure", "Increase passwords", "Create software bugs", "Replace businesses"], 0),
            q("BUSINESS", "Which document commonly records a sale and its amount?", ["Invoice", "Resume", "Flowchart", "Attendance sheet"], 0),
            q("COSTING", "Fixed costs generally:", ["Stay constant within a relevant activity range", "Change with every unit in all cases", "Always equal revenue", "Never appear in accounts"], 0),
            q("FINANCIAL ANALYSIS", "A current ratio compares:", ["Current assets with current liabilities", "Sales with employee age", "Profit with office size", "Cash with product colour"], 0),
            q("AUDITING", "The purpose of an audit is to:", ["Examine records and evidence", "Guarantee future profit", "Create advertisements", "Replace accounting records"], 0),
            q("INVESTMENT", "Why is diversification used in investing?", ["To spread risk", "To guarantee profits", "To remove all market risk", "To avoid records"], 0),
            q("ACCOUNTING", "Depreciation generally represents:", ["Allocation of an asset's depreciable cost over its useful life", "A new cash deposit", "An increase in every asset's value", "A sales invoice"], 0),
            q("EXCEL", "Which function calculates the average of a range?", ["AVERAGE", "COUNTWORD", "MERGE", "SORTTEXT"], 0),
            q("BUSINESS LAW", "A contract generally requires:", ["Legally recognised elements such as offer and acceptance", "Only a company logo", "A social media account", "A chart"], 0),
            q("FINANCIAL REPORTING", "Why should financial records be accurate?", ["They support reliable reporting and decisions", "They make errors invisible", "They remove the need for evidence", "They guarantee sales"], 0),
            q("ACCOUNTING", "A trial balance is prepared mainly to check:", ["Arithmetic agreement of ledger balances", "Future share prices", "Employee attendance", "Customer preferences"], 0),
            q("ACCOUNTING", "A journal is used to record:", ["Transactions in chronological order", "Only employee interviews", "Network configurations", "Scientific experiments"], 0),
            q("TAXATION", "Input tax credit generally relates to:", ["Eligible tax paid on business purchases", "Employee birthdays", "Website traffic", "Inventory colour"], 0),
            q("FINANCE", "Liquidity refers to the ability to:", ["Meet short-term financial obligations", "Increase office space", "Write advertisements", "Hire without a budget"], 0),
            q("BANKING", "KYC procedures help financial institutions:", ["Verify customer identity", "Calculate depreciation only", "Design products", "Prepare lesson plans"], 0),
            q("COST ACCOUNTING", "Variable costs generally change with:", ["The level of activity or output", "The company logo", "The calendar font", "Email folders"], 0),
            q("FINANCE", "Compound interest is calculated on:", ["Principal and accumulated interest", "Principal only in every period", "Sales tax only", "Inventory quantities"], 0),
            q("AUDITING", "Audit evidence should be:", ["Relevant and sufficiently reliable", "Based only on rumours", "Always anonymous", "Unrelated to the accounts"], 0),
            q("WORKING CAPITAL", "Working capital is commonly calculated as:", ["Current assets minus current liabilities", "Revenue plus advertising", "Fixed assets minus sales", "Profit multiplied by staff"], 0),
            q("ECONOMICS", "Inflation generally means:", ["A sustained rise in the general price level", "A fall in all prices forever", "An increase in office space", "A reduction in all wages"], 0)
        ];

        const management = [
            q("MANAGEMENT", "Planning primarily involves:", ["Setting objectives and deciding actions", "Ignoring future needs", "Deleting records", "Avoiding decisions"], 0),
            q("MANAGEMENT", "Delegation means:", ["Assigning responsibility and appropriate authority", "Refusing every task", "Removing all accountability", "Avoiding communication"], 0),
            q("MARKETING", "The traditional marketing mix is commonly known as:", ["4 Ps", "4 Ds", "5 Rs", "3 Cs only"], 0),
            q("MARKETING", "Market segmentation means:", ["Dividing a market into groups with shared characteristics", "Selling only to employees", "Removing customer research", "Setting every price to zero"], 0),
            q("HR", "What is a key purpose of recruitment?", ["Attract suitable candidates for vacancies", "Prepare tax returns only", "Repair networks", "Design database tables"], 0),
            q("HR", "A performance review is used to:", ["Discuss performance and development", "Guarantee promotion", "Replace all training", "Avoid feedback"], 0),
            q("BUSINESS ANALYTICS", "A KPI is:", ["A key performance indicator", "A type of invoice", "A programming loop", "A network cable"], 0),
            q("OPERATIONS", "Inventory management helps a business:", ["Track stock and balance availability with demand", "Ignore stock levels", "Eliminate feedback", "Remove product records"], 0),
            q("LEADERSHIP", "An effective leader should:", ["Communicate goals and support the team", "Avoid listening", "Hide expectations", "Discourage questions"], 0),
            q("PROJECT MANAGEMENT", "A project milestone marks:", ["An important stage or achievement", "A random password", "A bank interest rate", "A spreadsheet font"], 0),
            q("CUSTOMER SERVICE", "When a customer complains, first:", ["Listen and clarify the problem", "Interrupt immediately", "Ignore the customer", "Promise an impossible outcome"], 0),
            q("STRATEGY", "SWOT analysis examines:", ["Strengths, Weaknesses, Opportunities and Threats", "Sales, Work, Orders and Tax", "Systems, Websites, Output and Testing", "Staff, Wages, Offices and Time"], 0),
            q("COMMUNICATION", "Active listening includes:", ["Paying attention and checking understanding", "Preparing a reply without listening", "Changing the subject", "Ignoring questions"], 0),
            q("FINANCE", "A budget is mainly used to:", ["Plan and monitor income and expenditure", "Guarantee unlimited revenue", "Remove all risk", "Replace customer research"], 0),
            q("ETHICS", "A conflict of interest should be:", ["Disclosed and managed appropriately", "Hidden at all times", "Encouraged without review", "Recorded as revenue"], 0),
            q("SALES", "A sales conversion rate measures:", ["The proportion of prospects completing a desired action", "Office floor space", "Employee birthdays", "Number of printers"], 0),
            q("OPERATIONS", "A bottleneck is:", ["A step limiting overall process capacity", "The fastest possible process", "A customer invoice", "A job title"], 0),
            q("BUSINESS", "Break-even occurs when:", ["Total revenue equals total costs", "Revenue is always zero", "Fixed costs disappear", "Every product is free"], 0),
            q("ANALYTICS", "Why use customer feedback?", ["To identify needs and improve services", "To avoid learning", "To remove quality checks", "To guarantee agreement"], 0),
            q("TEAMWORK", "A constructive way to resolve disagreement is to:", ["Discuss evidence and seek a workable solution", "Blame someone immediately", "Hide the disagreement", "Stop communicating"], 0),
            q("MANAGEMENT", "Organizing primarily involves:", ["Arranging resources and responsibilities", "Ignoring company objectives", "Removing every team role", "Avoiding planning"], 0),
            q("LEADERSHIP", "A participative leader typically:", ["Involves team members in decisions", "Rejects all suggestions", "Avoids sharing information", "Makes feedback impossible"], 0),
            q("MARKETING", "Market research helps a business understand:", ["Customer needs and market conditions", "Only office furniture", "Employee passwords", "Computer temperatures"], 0),
            q("HUMAN RESOURCES", "Employee onboarding helps new employees:", ["Understand their role and workplace", "Avoid all training", "Skip company policies", "Set product prices independently"], 0),
            q("OPERATIONS", "Quality assurance focuses on:", ["Processes that help prevent defects", "Hiding customer complaints", "Removing specifications", "Avoiding documentation"], 0),
            q("PROJECT MANAGEMENT", "A project deadline specifies:", ["When work is due to be completed", "The colour of a logo", "An employee's birthplace", "Office windows"], 0),
            q("BUSINESS STRATEGY", "Competitive advantage helps a business:", ["Differentiate itself from competitors", "Eliminate every business risk", "Avoid customers", "Guarantee profit in all conditions"], 0),
            q("FINANCE", "Cash-flow forecasting estimates:", ["Expected cash inflows and outflows", "Employee height", "Website font sizes", "Meeting rooms"], 0),
            q("CUSTOMER RELATIONSHIPS", "Customer retention means:", ["Encouraging existing customers to continue using a business", "Removing all customer support", "Avoiding service improvements", "Ending every customer relationship"], 0),
            q("ETHICS", "Confidential business information should be:", ["Shared only with authorized people for valid purposes", "Posted publicly", "Sent to unknown contacts", "Used without permission"], 0)
        ];

        const engineering = [
            q("ENGINEERING", "What is the SI unit of force?", ["Joule", "Newton", "Watt", "Pascal"], 1),
            q("ELECTRICAL", "Ohm's law is:", ["V = IR", "P = mV", "F = ma²", "E = mc"], 0),
            q("ELECTRICAL", "Which device converts AC to DC?", ["Rectifier", "Transformer alone", "Fuse", "Switch"], 0),
            q("MECHANICAL", "Which unit measures power?", ["Watt", "Metre", "Kilogram", "Second"], 0),
            q("CIVIL", "Which material is commonly strong in compression?", ["Concrete", "Paper", "Cotton", "Rubber band"], 0),
            q("ELECTRONICS", "A diode primarily allows current to flow:", ["In one direction", "Equally in every direction", "Only without voltage", "Only through air"], 0),
            q("ENGINEERING", "What is a technical drawing used for?", ["Communicating dimensions and design details", "Recording birthdays", "Replacing calculations", "Storing passwords"], 0),
            q("MECHANICAL", "What does a bearing commonly help reduce?", ["Friction between moving parts", "Electrical resistance in every circuit", "All machine weight", "Room temperature"], 0),
            q("CIVIL", "Which instrument measures horizontal angles in surveying?", ["Theodolite", "Thermometer", "Ammeter", "Microscope"], 0),
            q("ELECTRICAL", "Which safety device interrupts excessive current?", ["Fuse", "LED", "Capacitor only", "Resistor only"], 0),
            q("ENGINEERING", "What is a prototype?", ["An early model used to test a design", "A tax statement", "A type of salary", "A network password"], 0),
            q("ELECTRONICS", "What does LED stand for?", ["Light Emitting Diode", "Low Energy Database", "Linear Electric Drive", "Light Electronic Display"], 0),
            q("MECHANICAL", "Which process removes material using a rotating cutting tool?", ["Milling", "Casting", "Forging only", "Welding"], 0),
            q("CIVIL", "What does a building foundation do?", ["Transfers structural loads to the ground", "Decorates windows only", "Generates electricity", "Measures rainfall only"], 0),
            q("ENGINEERING", "Why is calibration performed?", ["To check or adjust measurement accuracy", "To increase instrument size", "To delete measurements", "To avoid maintenance"], 0),
            q("ELECTRICAL", "Which quantity is measured in amperes?", ["Electric current", "Voltage", "Resistance", "Energy"], 0),
            q("MECHANICAL", "A gear system is commonly used to:", ["Transmit motion and torque", "Measure humidity", "Store files", "Purify water"], 0),
            q("ENGINEERING SAFETY", "Why use personal protective equipment?", ["To reduce exposure to workplace hazards", "To replace all safety procedures", "To guarantee no accident", "To increase machine speed"], 0),
            q("ELECTRONICS", "A capacitor stores energy in an:", ["Electric field", "Optical lens", "Water tank only", "Compass needle"], 0),
            q("ENGINEERING", "What is the purpose of quality control?", ["Check that outputs meet defined requirements", "Remove specifications", "Skip inspections", "Guarantee zero cost"], 0),
            q("INSTRUMENTATION", "What does a multimeter commonly measure?", ["Voltage, current and resistance", "Building height only", "Water purity only", "Sound recordings only"], 0),
            q("ELECTRICAL", "A transformer primarily changes:", ["AC voltage levels", "Water's chemical formula", "A file format", "Material colour"], 0),
            q("MECHANICAL", "Stress is commonly defined as:", ["Force per unit area", "Distance multiplied by time", "Mass per temperature", "Power divided by colour"], 0),
            q("CIVIL", "Which property describes resistance to deformation?", ["Stiffness", "Colour", "Transparency only", "Odour"], 0),
            q("ELECTRONICS", "A transistor can be used as a:", ["Switch or amplifier", "Building foundation", "Liquid filter only", "Mechanical bearing"], 0),
            q("DESIGN", "Why perform a feasibility study?", ["To assess whether a proposed solution is practical", "To skip cost estimates", "To guarantee every design works", "To remove safety checks"], 0),
            q("MECHANICAL", "Which device measures rotational speed?", ["Tachometer", "Barometer", "pH meter", "Hydrometer only"], 0),
            q("CIVIL", "A contour line connects points of equal:", ["Elevation", "Temperature", "Population", "Electrical resistance"], 0),
            q("ELECTRICAL", "Electrical resistance is measured in:", ["Ohms", "Amperes", "Watts", "Joules"], 0),
            q("ENGINEERING SAFETY", "Before maintaining machinery, a worker should:", ["Follow isolation and lockout safety procedures", "Touch moving parts", "Ignore warning labels", "Remove every protective guard"], 0)
        ];

        const science = [
            q("BIOLOGY", "Which structure is commonly called the basic unit of life?", ["Cell", "Atom only", "Organ", "Tissue only"], 0),
            q("CHEMISTRY", "A pH below 7 generally indicates a substance is:", ["Acidic", "Neutral", "Always metallic", "Always gaseous"], 0),
            q("PHYSICS", "What is the SI unit of energy?", ["Joule", "Newton", "Ampere", "Kelvin"], 0),
            q("BIOLOGY", "Photosynthesis uses light energy to produce:", ["Sugars from carbon dioxide and water", "Proteins from rocks", "Oxygen from metal", "Salt from nitrogen"], 0),
            q("CHEMISTRY", "The chemical symbol for oxygen is:", ["Ox", "O", "Og", "Oy"], 1),
            q("PHYSICS", "Speed is calculated as:", ["Distance divided by time", "Time divided by distance", "Mass multiplied by time", "Force divided by temperature"], 0),
            q("BIOLOGY", "DNA carries:", ["Genetic information", "Household electrical current", "Sound waves only", "Atmospheric pressure"], 0),
            q("LAB SAFETY", "When handling an unknown laboratory chemical, you should:", ["Follow safety instructions and use protection", "Taste it", "Mix it with everything", "Ignore its label"], 0),
            q("RESEARCH", "A hypothesis is:", ["A testable proposed explanation", "A proven fact in every case", "A random data file", "A laboratory tool"], 0),
            q("STATISTICS", "The mean is calculated by:", ["Adding values and dividing by their count", "Choosing the largest value only", "Subtracting every value", "Counting letters"], 0),
            q("ECOLOGY", "A food chain describes:", ["Energy transfer between organisms", "A chemical formula only", "A weather forecast", "A computer network"], 0),
            q("CHEMISTRY", "Water has the chemical formula:", ["H2O", "CO2", "NaCl", "O2"], 0),
            q("PHYSICS", "Which instrument measures temperature?", ["Thermometer", "Barometer", "Ammeter", "Voltmeter"], 0),
            q("BIOLOGY", "Which organ pumps blood through the human body?", ["Heart", "Lung", "Kidney", "Stomach"], 0),
            q("RESEARCH", "Why include controlled conditions in an experiment?", ["To help isolate the effect of variables", "To guarantee a preferred result", "To remove observations", "To avoid recording data"], 0),
            q("STATISTICS", "Which measure is the middle value in ordered data?", ["Median", "Range", "Sum", "Mode in every case"], 0),
            q("ENVIRONMENT", "Which is a renewable energy source?", ["Solar energy", "Coal", "Petroleum", "Natural gas"], 0),
            q("CHEMISTRY", "A substance made of only one type of atom is an:", ["Element", "Mixture", "Solution", "Suspension"], 0),
            q("PHYSICS", "Which force pulls objects toward Earth?", ["Gravity", "Friction only", "Buoyancy only", "Magnetism in every case"], 0),
            q("RESEARCH", "Why cite sources in a research report?", ["To acknowledge sources and support verification", "To hide evidence", "To replace analysis", "To increase word count only"], 0),
            q("BIOLOGY", "Which molecule carries hereditary information?", ["DNA", "Starch only", "Water", "Sodium chloride"], 0),
            q("CHEMISTRY", "The atomic number of an element equals its number of:", ["Protons", "Neutrons in every isotope", "Molecules", "Chemical bonds"], 0),
            q("PHYSICS", "What is the SI unit of electric current?", ["Ampere", "Volt", "Ohm", "Joule"], 0),
            q("BIOLOGY", "Which organelle is commonly associated with cellular energy production?", ["Mitochondrion", "Ribosome only", "Cell wall", "Nucleus only"], 0),
            q("CHEMISTRY", "A catalyst generally:", ["Increases reaction rate without being consumed overall", "Always becomes the main product", "Stops every reaction", "Changes every element into gold"], 0),
            q("PHYSICS", "Which law relates force, mass and acceleration?", ["Newton's second law", "Ohm's law", "Boyle's law only", "Mendel's law"], 0),
            q("RESEARCH", "An independent variable is generally the variable that is:", ["Changed or selected to examine its effect", "Always the final conclusion", "Never recorded", "The same as every measured outcome"], 0),
            q("STATISTICS", "A sample is:", ["A subset of a population", "Always the entire population", "A chemical element", "A laboratory instrument"], 0),
            q("ENVIRONMENT", "Biodiversity refers to:", ["The variety of living organisms", "The number of computers", "The speed of a vehicle", "The acidity of every liquid"], 0),
            q("LABORATORY", "Why repeat scientific measurements?", ["To assess consistency and the influence of random error", "To guarantee a preferred conclusion", "To remove the need for records", "To change the hypothesis after every reading"], 0)
        ];

        const arts = [
            q("COMMUNICATION", "Which is the clearest formal sentence?", ["Send it now!!!", "Please send the report by Friday.", "Hey u report", "Do thing"], 1),
            q("RESEARCH", "A reliable research source should be evaluated for:", ["Author, evidence, date and purpose", "Font colour only", "Page length only", "Number of images only"], 0),
            q("HUMANITIES", "A primary source is generally:", ["Direct evidence from the period or event studied", "Always an anonymous summary", "A fictional advertisement only", "Search results"], 0),
            q("PSYCHOLOGY", "Empathy means:", ["Trying to understand another person's perspective", "Agreeing with everyone", "Ignoring emotions", "Avoiding communication"], 0),
            q("SOCIOLOGY", "Which is an example of a social institution?", ["Family or education systems", "A keyboard", "A file format", "A chemical element"], 0),
            q("WRITING", "What is the main purpose of a thesis statement?", ["Present the central argument or claim", "List every reference", "Replace the conclusion", "Provide a page number"], 0),
            q("MEDIA LITERACY", "Before sharing a surprising online claim, you should:", ["Check reliable independent sources", "Share immediately", "Ignore the date", "Assume every post is true"], 0),
            q("ETHICS", "Academic plagiarism means:", ["Presenting others' work as your own without acknowledgment", "Citing a source correctly", "Writing an original argument", "Taking notes"], 0),
            q("COMMUNICATION", "Constructive feedback should be:", ["Specific, respectful and actionable", "Insulting", "Vague and threatening", "Never explained"], 0),
            q("REASONING", "A conclusion should primarily be based on:", ["Evidence and sound reasoning", "Rumours only", "Personal attacks", "Font style"], 0),
            q("RESEARCH", "A survey is commonly used to:", ["Collect responses from participants", "Repair a computer", "Measure voltage", "Compile code"], 0),
            q("CULTURE", "Why is cultural context important when interpreting a text?", ["It can influence meaning and interpretation", "It removes the need to read", "It guarantees one interpretation", "It replaces evidence"], 0),
            q("WRITING", "Which section typically summarizes a report's main findings?", ["Conclusion", "Title page only", "Table border", "File name"], 0),
            q("DIGITAL LITERACY", "Which tool helps organize research references?", ["Reference manager", "Image filter only", "Music player", "Screen brightness control"], 0),
            q("CRITICAL THINKING", "When two sources disagree, you should:", ["Compare their evidence, methods and credibility", "Choose the angriest source", "Ignore both automatically", "Share both without checking"], 0),
            q("COMMUNICATION", "Good group discussion participation includes:", ["Listening and contributing relevant points", "Interrupting constantly", "Ignoring the topic", "Preventing others from speaking"], 0),
            q("CIVICS", "A constitution generally:", ["Establishes fundamental rules and principles of governance", "Lists every invoice", "Replaces scientific methods", "Sets all product prices"], 0),
            q("MEDIA", "Why is a headline alone insufficient?", ["Full context and evidence may change its meaning", "Headlines are always false", "Articles never contain facts", "Dates are irrelevant"], 0),
            q("RESEARCH", "What is a citation?", ["A reference to a source of information", "A survey response", "A spreadsheet formula", "A drawing tool"], 0),
            q("PROBLEM SOLVING", "When researching a complex issue, it helps to:", ["Break it into smaller research questions", "Accept the first claim", "Avoid evidence", "Ignore differing viewpoints"], 0),
            q("LITERATURE", "What is a metaphor?", ["A figure of speech comparing things without using 'like' or 'as'", "A list of references", "A statistical average", "A laboratory procedure"], 0),
            q("HISTORY", "Why do historians compare multiple sources?", ["To evaluate evidence and differing perspectives", "To avoid checking facts", "To guarantee every source agrees", "To replace historical context"], 0),
            q("SOCIOLOGY", "Social norms are:", ["Shared expectations about behaviour", "Chemical formulas", "Computer programs", "Financial statements"], 0),
            q("PSYCHOLOGY", "What does cognitive psychology study?", ["Mental processes such as memory and thinking", "Only building materials", "Bank transactions only", "Planetary orbits only"], 0),
            q("COMMUNICATION", "Non-verbal communication can include:", ["Facial expressions and gestures", "Only written invoices", "Database queries", "Laboratory reagents"], 0),
            q("RESEARCH", "Qualitative research often examines:", ["Experiences, meanings and descriptions", "Only electrical current", "Only machine temperature", "Only account balances"], 0),
            q("POLITICAL SCIENCE", "A democracy generally involves:", ["Public participation in governance", "No public institutions", "Only private business decisions", "The absence of all laws"], 0),
            q("MEDIA LITERACY", "Bias in a news report refers to:", ["A tendency to present information from a particular perspective", "A guarantee of accuracy", "A database backup", "A spelling rule"], 0),
            q("WRITING", "Proofreading primarily checks:", ["Grammar, spelling and presentation errors", "The chemical composition of ink", "Internet speed", "Financial liquidity"], 0),
            q("CULTURAL STUDIES", "Cultural heritage includes:", ["Practices, traditions and historical expressions passed across generations", "Only computer hardware", "Only current stock prices", "Only scientific instruments"], 0)
        ];

        return {
            management,
            commerce,
            engineering,
            science,
            arts,
            computer,
            dataScience
        };
    }

    /* =====================================================
       LOAD STUDENT PROFILE
       Checks saved session data, the logged-in user,
       the profile RPC, and the students table.
       ===================================================== */

    function getFirstValue(object, fields) {
        for (const field of fields) {
            const value = object?.[field];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return value;
            }
        }

        return "";
    }

    function readSavedObject(key) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return null;

            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object"
                ? parsed
                : null;
        } catch {
            return null;
        }
    }

    function getUsernameFromObject(object, depth = 0) {
        if (!object || typeof object !== "object" || depth > 3) {
            return "";
        }

        const directUsername =
            object.username ||
            object.user_name ||
            object.userName ||
            object.login_username ||
            object.loginUsername ||
            object.user?.username ||
            object.user?.user_name ||
            object.profile?.username ||
            object.student?.username ||
            object.student_profile?.username;

        if (typeof directUsername === "string" && directUsername.trim()) {
            return directUsername.trim();
        }

        for (const key of ["data", "session", "user", "profile", "student"]) {
            const found = getUsernameFromObject(object[key], depth + 1);
            if (found) return found;
        }

        return "";
    }

    async function loadStudentProfile(user) {
        const studentProfile = { ...(user || {}) };

        const savedProfileKeys = [
            "cosmosUser",
            "cosmos_user",
            "cosmosStudent",
            "cosmos_student",
            "cosmos_student_profile",
            "cosmos_profile",
            "student_profile"
        ];

        // Merge saved profile objects without discarding the logged-in user.
        for (const key of savedProfileKeys) {
            const saved = readSavedObject(key);

            if (saved) {
                Object.assign(studentProfile, saved);
            }
        }

        // Also check the app's existing session helper.
        if (typeof getCosmosSession === "function") {
            for (const key of savedProfileKeys) {
                try {
                    const saved = getCosmosSession(key);

                    if (saved && typeof saved === "object") {
                        Object.assign(studentProfile, saved);
                    }
                } catch (error) {
                    console.warn(
                        `Could not read COSMOS session key "${key}":`,
                        error
                    );
                }
            }
        }

        // Check the existing current-user helper when available.
        if (typeof getCurrentCosmosUser === "function") {
            try {
                const currentUser = getCurrentCosmosUser();

                if (currentUser && typeof currentUser === "object") {
                    Object.assign(studentProfile, currentUser);
                }
            } catch (error) {
                console.warn("Could not read current COSMOS user:", error);
            }
        }

        const departmentFields = [
            "department",
            "department_name",
            "student_department",
            "selected_department",
            "course",
            "course_name",
            "program",
            "program_name",
            "degree",
            "degree_name",
            "stream",
            "major",
            "branch",
            "specialization",
            "field",
            "study_field",
            "academic_department"
        ];

        const hasDepartment = object =>
            Boolean(getFirstValue(object, departmentFields));

        // If a saved profile has a department, do not query unnecessarily.
        if (hasDepartment(studentProfile)) {
            return studentProfile;
        }

        let client = null;

        try {
            if (typeof waitForSupabase === "function") {
                client = await waitForSupabase();
            } else if (typeof cosmosSupabase !== "undefined") {
                client = cosmosSupabase;
            } else if (
                typeof window !== "undefined" &&
                window.cosmosSupabase
            ) {
                client = window.cosmosSupabase;
            }
        } catch (error) {
            console.warn("Supabase initialization failed:", error);
        }

        if (!client) {
            console.error("COSMOS: Supabase client is unavailable.");
            return studentProfile;
        }

        // Try several known locations for the username.
        let username = getUsernameFromObject(studentProfile);

        if (!username && typeof user === "object") {
            username = getUsernameFromObject(user);
        }

        if (!username) {
            for (const key of [
                "cosmosUsername",
                "cosmos_username",
                "username",
                "user_name"
            ]) {
                const savedValue = localStorage.getItem(key);

                if (savedValue && savedValue.trim()) {
                    username = savedValue.trim();
                    break;
                }
            }
        }

        // Read Supabase Auth metadata if the username is not available yet.
        if (!username && client.auth?.getSession) {
            try {
                const { data, error } = await client.auth.getSession();

                if (error) {
                    console.warn("Could not read Supabase session:", error.message);
                }

                const authUser = data?.session?.user;

                if (authUser) {
                    Object.assign(studentProfile, {
                        auth_user_id: authUser.id,
                        email: authUser.email || ""
                    });

                    username = getUsernameFromObject({
                        ...authUser,
                        username: authUser.user_metadata?.username,
                        user_name: authUser.user_metadata?.user_name,
                        profile: authUser.user_metadata
                    });
                }
            } catch (error) {
                console.warn("Could not read Supabase Auth session:", error);
            }
        }

        if (!username) {
            console.error(
                "COSMOS: Username not found in the current user, session, or Auth metadata.",
                {
                    availableProfileFields: Object.keys(studentProfile)
                }
            );

            return studentProfile;
        }

        studentProfile.username = username;

        // First try the profile RPC, if it exists and is accessible.
        try {
            const { data, error } = await client.rpc(
                "get_cosmos_student_profile",
                { p_username: username }
            );

            if (error) {
                console.warn(
                    "COSMOS profile RPC unavailable:",
                    error.message
                );
            } else if (data) {
                const record = Array.isArray(data) ? data[0] : data;

                if (record && typeof record === "object") {
                    Object.assign(studentProfile, record);
                }
            }
        } catch (error) {
            console.warn("COSMOS profile RPC failed:", error);
        }

        if (hasDepartment(studentProfile)) {
            cacheStudentProfile(studentProfile);
            return studentProfile;
        }

        /*
         * Direct table lookup.
         * This works only if the students table has the selected columns
         * and its Row Level Security policies allow this query.
         */
        try {
            const { data, error } = await client
                .from("students")
                .select("*")
                .eq("username", username)
                .maybeSingle();

            if (error) {
                console.error(
                    "COSMOS student lookup failed:",
                    error.message
                );
            } else if (data) {
                Object.assign(studentProfile, data);
            } else {
                console.warn(
                    "No student row was returned for the current username."
                );
            }
        } catch (error) {
            console.error("COSMOS student lookup failed:", error);
        }

        if (hasDepartment(studentProfile)) {
            cacheStudentProfile(studentProfile);
        }

        return studentProfile;
    }

    function cacheStudentProfile(profileToSave) {
        try {
            localStorage.setItem(
                "cosmos_student_profile",
                JSON.stringify(profileToSave)
            );
        } catch (error) {
            console.warn("Could not cache student profile:", error);
        }
    }

    /* =====================================================
       STRICT DEPARTMENT NORMALIZATION
       ===================================================== */

    function normalizeDepartment(value) {
        const text = String(value || "")
            .toLowerCase()
            .replace(/[._/-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (!text) return null;

        // Check Data Science before broader science matches.
        if (
            /\bdata science\b|\bdata analytics\b|\bdata scientist\b/.test(text)
        ) {
            return "dataScience";
        }

        if (
            /\bcse\b|\bbca\b|\bmca\b|\bit\b/.test(text) ||
            /computer science|information technology|software development|computer applications/.test(text)
        ) {
            return "computer";
        }

        if (
            /\bbba\b|\bmba\b/.test(text) ||
            /management|business administration|human resources/.test(text)
        ) {
            return "management";
        }

        if (
            /\bbcom\b|\bb com\b/.test(text) ||
            /commerce|accounting|taxation|auditing|finance/.test(text)
        ) {
            return "commerce";
        }

        if (
            /\bbtech\b|\bb tech\b|\bbe\b|\bmtech\b|\bm tech\b/.test(text) ||
            /engineering|mechanical|civil engineering|electrical engineering|electronics engineering/.test(text)
        ) {
            return "engineering";
        }

        if (
            /\bba\b|\bma\b/.test(text) ||
            /arts|humanities|history|sociology|psychology|political science|journalism|literature/.test(text)
        ) {
            return "arts";
        }

        if (
            /\bbsc\b|\bb sc\b|\bmsc\b|\bm sc\b/.test(text) ||
            /science|biology|chemistry|physics|biotechnology|microbiology/.test(text)
        ) {
            return "science";
        }

        return null;
    }

    function departmentLabel(value) {
        const labels = {
            management: "Management (BBA / MBA)",
            commerce: "Commerce and Accounting (B.Com)",
            engineering: "Engineering",
            science: "Science",
            arts: "Arts and Humanities",
            computer: "Computer Science and IT",
            dataScience: "Data Science"
        };

        return labels[value] || "Unrecognized Department";
    }

    /* =====================================================
       SHUFFLE QUESTIONS AND ANSWERS
       ===================================================== */

    function shuffle(items) {
        const copy = [...items];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    function prepareQuestion(question) {
        const indexedOptions = question.options.map((text, index) => ({
            text,
            correct: index === question.answer
        }));

        const shuffledOptions = shuffle(indexedOptions);

        return {
            ...question,
            options: shuffledOptions.map(item => item.text),
            answer: shuffledOptions.findIndex(item => item.correct)
        };
    }

    /* =====================================================
       RENDER QUESTION
       ===================================================== */

    function renderQuestion() {
        if (testFinished) return;

        const question = testQuestions[currentQuestionIndex];

        questionCategory.textContent = question.category;
        questionText.textContent = question.question;

        progressText.textContent =
            `Question ${currentQuestionIndex + 1} of ${testQuestions.length}`;

        progressFill.style.width =
            `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%`;

        optionsContainer.replaceChildren();

        question.options.forEach((option, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "test-option";
            button.textContent = option;

            if (userAnswers[currentQuestionIndex] === index) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => {
                if (testFinished) return;

                userAnswers[currentQuestionIndex] = index;

                optionsContainer
                    .querySelectorAll(".test-option")
                    .forEach(element => element.classList.remove("selected"));

                button.classList.add("selected");
            });

            optionsContainer.appendChild(button);
        });

        previousButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = false;

        nextButton.textContent =
            currentQuestionIndex === testQuestions.length - 1
                ? "Submit Test ✓"
                : "Next →";
    }

    /* =====================================================
       NAVIGATION
       ===================================================== */

    nextButton.addEventListener("click", () => {
        if (testFinished) return;

        if (userAnswers[currentQuestionIndex] === null) {
            alert("Please select an answer before continuing.");
            return;
        }

        if (currentQuestionIndex < testQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            finishTest(false);
        }
    });

    previousButton.addEventListener("click", () => {
        if (testFinished || currentQuestionIndex === 0) return;

        currentQuestionIndex--;
        renderQuestion();
    });

    /* =====================================================
       TIMER - 10 MINUTES
       ===================================================== */

    function startTimer() {
        updateTimer();

        timerInterval = setInterval(() => {
            if (testFinished) {
                clearInterval(timerInterval);
                return;
            }

            timeRemaining--;
            updateTimer();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                finishTest(true);
            }
        }, 1000);
    }

    function updateTimer() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        timer.classList.toggle(
            "timer-warning",
            timeRemaining <= 60
        );
    }

    /* =====================================================
       CAREER RECOMMENDATION
       ===================================================== */

    function recommendCareer(categoryScores, resume) {
        const skills = Array.isArray(resume?.skills)
            ? resume.skills.map(skill =>
                String(skill).toLowerCase().trim()
            )
            : [];

        const hasSkill = (...names) =>
            names.some(name => skills.includes(name));

        const direction = careerDirection.toLowerCase();

        if (
            /cybersecurity|security analyst/.test(direction) ||
            hasSkill("cybersecurity")
        ) {
            return {
                name: "Cybersecurity Analyst",
                description:
                    "Explore networking, Linux, security fundamentals and practical cybersecurity labs."
            };
        }

        if (
            /data science|data analyst|analytics/.test(direction) ||
            hasSkill(
                "data analysis",
                "power bi",
                "tableau",
                "excel",
                "pandas",
                "numpy"
            )
        ) {
            return {
                name: "Data Analyst",
                description:
                    "Build skills in spreadsheets, SQL, statistics, data visualization and analysis."
            };
        }

        if (
            /artificial intelligence|machine learning|\bai\b/.test(direction) ||
            hasSkill("machine learning", "artificial intelligence")
        ) {
            return {
                name: "AI / Machine Learning Explorer",
                description:
                    "Start with Python, statistics and data concepts before progressing to machine learning."
            };
        }

        if (
            /web developer|web development/.test(direction) ||
            hasSkill("html", "css", "javascript", "react")
        ) {
            return {
                name: "Web Developer",
                description:
                    "Learn HTML, CSS and JavaScript, then build practical websites."
            };
        }

        if (
            /ui.?ux|designer/.test(direction) ||
            hasSkill("figma", "ui", "ux")
        ) {
            return {
                name: "UI/UX Designer",
                description:
                    "Explore wireframing, prototyping, accessibility and user research."
            };
        }

        const careers = {
            commerce: {
                name: "Financial / Business Analyst",
                description:
                    "Explore accounting, banking, finance and business reporting. Strengthen Excel and financial analysis."
            },
            management: {
                name: "Business Analyst",
                description:
                    "Explore business analysis, operations, marketing and project coordination."
            },
            engineering: {
                name: "Engineering / Technical Specialist",
                description:
                    "Explore technical roles related to your engineering branch and strengthen practical project skills."
            },
            science: {
                name: "Research / Laboratory Analyst",
                description:
                    "Explore scientific research, laboratory work and analytical roles relevant to your subject."
            },
            arts: {
                name: "Research / Communication Specialist",
                description:
                    "Explore research, communication, content, education and humanities-related careers."
            },
            computer: {
                name: "Software Developer",
                description:
                    "Build programming, database, web development and software engineering skills through practical projects."
            },
            dataScience: {
                name: "Data Analyst / Data Scientist",
                description:
                    "Develop Python, statistics, SQL, data visualization and machine-learning skills."
            }
        };

        return careers[department] || {
            name: "Career Exploration",
            description:
                "Explore career options that match your interests, education and skills."
        };
    }

    /* =====================================================
       FINISH TEST AND CALCULATE RESULT
       ===================================================== */

    async function finishTest(timeExpired = false) {
        if (testFinished) return;

        testFinished = true;

        if (timerInterval !== null) {
            clearInterval(timerInterval);
        }

        nextButton.disabled = true;
        previousButton.disabled = true;

        optionsContainer
            .querySelectorAll("button")
            .forEach(button => {
                button.disabled = true;
            });

        let correct = 0;
        const categoryScores = {};

        testQuestions.forEach((question, index) => {
            categoryScores[question.category] =
                categoryScores[question.category] || 0;

            if (userAnswers[index] === question.answer) {
                correct++;
                categoryScores[question.category]++;
            }
        });

        const total = testQuestions.length;
        const wrong = total - correct;
        const percentage = Math.round((correct / total) * 100);
        const passed = percentage >= 60;

        /* Count this attempt (kept across retests). */
        const attemptNumber =
            (Number(localStorage.getItem("cosmos_test_attempts")) || 0) + 1;
        localStorage.setItem("cosmos_test_attempts", String(attemptNumber));

        const resume = readResumeResult();
        const career = recommendCareer(categoryScores, resume);

        const testResult = {
            score: correct,
            totalQuestions: total,
            percentage,
            correctAnswers: correct,
            wrongAnswers: wrong,
            passed,
            department,
            departmentLabel: departmentLabel(department),
            careerDirection,
            categoryScores,
            recommendedCareer: career.name,
            careerDescription: career.description,
            timeExpired,
            attemptNumber,
            completedAt: new Date().toISOString()
        };

        /*
         * Save the result locally.
         * A passed result locks the test; a failed result allows a retest.
         */

        try {
            localStorage.setItem(
                "cosmos_test",
                JSON.stringify(testResult)
            );

            localStorage.setItem(
                "cosmos_test_completed",
                "completed"
            );

            localStorage.setItem(
                "cosmos_test_status",
                "completed"
            );
        } catch (error) {
            console.error("Could not save test result locally:", error);

            alert(
                "Your result could not be saved in this browser. " +
                "Please contact your administrator."
            );

            return;
        }

        /* Update journey progress (only when the student passes). */

        if (passed && typeof completeTestJourney === "function") {
            try {
                completeTestJourney();
            } catch (error) {
                console.error(
                    "Could not update test journey:",
                    error
                );
            }
        }

        /* Display the result. */

        scoreValue.textContent = `${correct}/${total}`;
        percentageValue.textContent = `${percentage}%`;
        correctAnswers.textContent = String(correct);
        wrongAnswers.textContent = String(wrong);

        recommendedCareer.textContent = career.name;
        careerDescription.textContent = career.description;

        if (passed) {
            resultIcon.textContent = "✓";
            resultTitle.textContent = "Congratulations!";

            resultMessage.textContent = timeExpired
                ? "Time expired. Your answers were submitted and you passed."
                : `You passed your ${departmentLabel(department)} Technical Test.`;

            testStatus.textContent = "PASSED";
            testStatus.classList.remove("failed");
            testStatus.classList.add("passed");

            careerButton.style.display = "inline-flex";
            careerButton.href = "careers.html";

            certificateMessage.textContent =
                "You passed the test and can continue to Career Recommendation.";
        } else {
            resultIcon.textContent = "✦";
            resultTitle.textContent = "Test Not Passed";

            const attemptsLeft = MAX_ATTEMPTS - attemptNumber;
            const canRetake = attemptsLeft > 0;

            resultMessage.textContent = canRetake
                ? `You scored ${percentage}%. At least 60% is required. You can retake the test with a fresh set of shuffled questions.`
                : `You scored ${percentage}%. At least 60% is required. You have used all your attempts.`;

            testStatus.textContent = "NOT PASSED";
            testStatus.classList.remove("passed");
            testStatus.classList.add("failed");

            careerButton.style.display = "none";

            certificateMessage.textContent = canRetake
                ? "You did not reach the pass mark. Please retake the test."
                : "You did not reach the required pass mark.";

            if (canRetake && !document.getElementById("retakeButton")) {
                const retakeButton = document.createElement("button");

                retakeButton.id = "retakeButton";
                retakeButton.type = "button";
                retakeButton.className = careerButton.className;
                retakeButton.textContent = "Retake Test ↻";

                retakeButton.addEventListener("click", () => {
                    localStorage.removeItem("cosmos_test");
                    localStorage.removeItem("cosmos_test_completed");
                    localStorage.removeItem("cosmos_test_status");
                    window.location.reload();
                });

                careerButton.insertAdjacentElement("afterend", retakeButton);
            }
        }

        testArea.style.display = "none";
        resultSection.hidden = false;
        resultSection.style.display = "block";

        /*
         * The result is displayed even if Supabase saving fails.
         * Check the browser console to verify the database save.
         */

        await saveTestToSupabase(testResult);
    }

    /* =====================================================
       READ RESUME ANALYSIS
       Do not overwrite or modify the resume analysis.
       ===================================================== */

    function readResumeResult() {
        try {
            if (typeof getCosmosSession === "function") {
                const result = getCosmosSession("cosmos_resume");

                if (result) return result;
            }

            return JSON.parse(
                localStorage.getItem("cosmos_resume") || "null"
            );
        } catch (error) {
            console.warn(
                "Could not read resume analysis:",
                error
            );

            return null;
        }
    }

    /* =====================================================
       SAVE TEST RESULT TO SUPABASE
       Uses the existing test_results table and the
       authenticated Supabase Auth UUID. Every attempt
       (passed or failed) is saved as its own row.
       ===================================================== */

    async function saveTestToSupabase(result) {
        try {
            let client = null;

            if (typeof waitForSupabase === "function") {
                client = await waitForSupabase();
            } else if (typeof cosmosSupabase !== "undefined") {
                client = cosmosSupabase;
            } else if (window.cosmosSupabase) {
                client = window.cosmosSupabase;
            }

            if (!client) {
                console.error("COSMOS: Supabase client is unavailable.");
                return;
            }

            // Get the real Supabase Auth user, not a cached COSMOS profile.
            const { data, error: authError } =
                await client.auth.getUser();

            if (authError) {
                console.error(
                    "COSMOS: Could not verify Supabase Auth user:",
                    authError.message
                );
                return;
            }

            const authUser = data?.user;

            if (!authUser?.id) {
                console.error(
                    "COSMOS: No authenticated Supabase Auth user was found. " +
                    "The result was not saved to test_results."
                );
                return;
            }

            console.log(
                "COSMOS: Verified Supabase Auth user ID:",
                authUser.id
            );

            const row = {
                user_id: authUser.id,
                score: result.score,
                total_questions: result.totalQuestions,
                percentage: result.percentage,
                correct_answers: result.correctAnswers,
                wrong_answers: result.wrongAnswers,
                passed: result.passed,
                recommended_career: result.recommendedCareer,
                career_description: result.careerDescription || null,
                time_expired: Boolean(result.timeExpired),
                completed_at: result.completedAt
                /* Optional: add this once an attempt_number column exists
                   in test_results:
                   , attempt_number: result.attemptNumber */
            };

            const { error: saveError } = await client
                .from("test_results")
                .insert(row);

            if (saveError) {
                console.error(
                    "COSMOS Supabase test save failed:",
                    saveError.message,
                    saveError.details || ""
                );
                return;
            }

            console.log(
                "COSMOS: Test result saved successfully to Supabase."
            );

        } catch (error) {
            console.error(
                "COSMOS Supabase test save error:",
                error
            );
        }
    }
});
