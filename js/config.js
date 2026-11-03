
/* =========================================================
   COSMOS - SUPABASE CONFIGURATION
   ========================================================= */

const COSMOS_CONFIG = {
    supabaseUrl: "https://gieheccxjwayyghmvyte.supabase.co",
    supabaseKey: "sb_publishable_ITMuOADIU1y0b-eHDXGRyQ_frxqPJEL"
};

/* =========================================================
   LOAD SUPABASE
   ========================================================= */

(function loadSupabase() {
    if (window.supabase) {
        initializeCosmosSupabase();
        return;
    }

    const script = document.createElement("script");

    script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = initializeCosmosSupabase;

    script.onerror = function () {
        console.error("Unable to load Supabase.");
    };

    document.head.appendChild(script);
})();

function initializeCosmosSupabase() {
    if (window.cosmosSupabase) return;

    window.cosmosSupabase = window.supabase.createClient(
        COSMOS_CONFIG.supabaseUrl,
        COSMOS_CONFIG.supabaseKey
    );

    console.log("COSMOS Supabase connected.");
}

/* =========================================================
   SESSION HELPERS
   ========================================================= */

function getCurrentCosmosUser() {
    try {
        const user = localStorage.getItem("cosmos_user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Unable to read COSMOS user:", error);
        return null;
    }
}

function setCurrentCosmosUser(user) {
    localStorage.setItem("cosmos_user", JSON.stringify(user));
}

function clearCurrentCosmosUser() {
    localStorage.removeItem("cosmos_user");
}

function isStudentLoggedIn() {
    const user = getCurrentCosmosUser();
    return !!(user && user.role === "student");
}

function isAdminLoggedIn() {
    const user = getCurrentCosmosUser();
    return !!(user && user.role === "admin");
}

function requireCosmosLogin() {
    if (!getCurrentCosmosUser()) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function requireCosmosStudent() {
    if (!isStudentLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function requireCosmosAdmin() {
    if (!isAdminLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

/* =========================================================
   ACCOUNT-SCOPED STUDENT STORAGE
   ========================================================= */

function cosmosAccountIdentity() {
    const user = getCurrentCosmosUser();

    return (
        user?.id ||
        user?.username?.trim().toLowerCase() ||
        (user?.role === "admin" ? "admin" : "anonymous")
    );
}

function cosmosScopedStorageKey(storage, key) {
    const area =
        storage === window.sessionStorage ? "session" : "local";

    return `cosmos_account:${area}:${encodeURIComponent(cosmosAccountIdentity())}:${key}`;
}

function cosmosIsNewAccount() {
    const user = getCurrentCosmosUser();

    if (!user?.username) return false;

    const marker =
        `cosmos_new_account:${user.username.trim().toLowerCase()}`;

    return Storage.prototype.__cosmosRawGet.call(
        window.localStorage,
        marker
    ) === "1";
}

function markCosmosAccountAsNew(username) {
    const marker =
        `cosmos_new_account:${username.trim().toLowerCase()}`;

    Storage.prototype.__cosmosRawSet.call(
        window.localStorage,
        marker,
        "1"
    );
}

(function installAccountScopedCosmosStorage() {
    const proto = Storage.prototype;

    if (proto.__cosmosAccountScoped) return;

    const rawGet = proto.getItem;
    const rawSet = proto.setItem;
    const rawRemove = proto.removeItem;
    const rawKey = proto.key;
    const rawClear = proto.clear;

    Object.defineProperties(proto, {
        __cosmosRawGet: { value: rawGet },
        __cosmosRawSet: { value: rawSet }
    });

    const isCosmosJourneyKey = key =>
        typeof key === "string" &&
        key.startsWith("cosmos_") &&
        key !== "cosmos_user" &&
        !key.startsWith("cosmos_new_account:");

    proto.getItem = function (key) {
        key = String(key);

        if (!isCosmosJourneyKey(key)) {
            return rawGet.call(this, key);
        }

        const scopedKey = cosmosScopedStorageKey(this, key);
        const scopedValue = rawGet.call(this, scopedKey);

        if (scopedValue !== null) return scopedValue;

        if (
            this === window.localStorage &&
            getCurrentCosmosUser() &&
            !cosmosIsNewAccount()
        ) {
            const legacyValue = rawGet.call(this, key);

            if (legacyValue !== null) {
                rawSet.call(this, scopedKey, legacyValue);
                rawRemove.call(this, key);
                return legacyValue;
            }
        }

        return null;
    };

    proto.setItem = function (key, value) {
        key = String(key);

        if (!isCosmosJourneyKey(key)) {
            return rawSet.call(this, key, value);
        }

        return rawSet.call(
            this,
            cosmosScopedStorageKey(this, key),
            String(value)
        );
    };

    proto.removeItem = function (key) {
        key = String(key);

        if (!isCosmosJourneyKey(key)) {
            return rawRemove.call(this, key);
        }

        return rawRemove.call(
            this,
            cosmosScopedStorageKey(this, key)
        );
    };

    proto.clear = function () {
        const area =
            this === window.sessionStorage ? "session" : "local";

        const prefix =
            `cosmos_account:${area}:${encodeURIComponent(cosmosAccountIdentity())}:`;

        for (let index = this.length - 1; index >= 0; index--) {
            const key = rawKey.call(this, index);

            if (key?.startsWith(prefix)) {
                rawRemove.call(this, key);
            }
        }
    };

    Object.defineProperty(proto, "__cosmosAccountScoped", {
        value: true
    });
})();

/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutCosmosUser() {
    try {
        if (window.cosmosSupabase) {
            await window.cosmosSupabase.auth.signOut();
        }
    } catch (error) {
        console.error("Logout error:", error);
    }

    clearCurrentCosmosUser();
    window.location.href = "index.html";
}

/* =========================================================
   SESSION STORAGE HELPERS
   ========================================================= */

function saveCosmosSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function getCosmosSession(key) {
    try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function removeCosmosSession(key) {
    sessionStorage.removeItem(key);
}

/* =========================================================
   SUPABASE HELPERS
   ========================================================= */

async function waitForSupabase(timeout = 10000) {
    const start = Date.now();

    while (!window.cosmosSupabase) {
        if (Date.now() - start > timeout) {
            throw new Error("Supabase connection timed out.");
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return window.cosmosSupabase;
}

async function cosmosRPC(functionName, parameters = {}) {
    const supabase = await waitForSupabase();

    const { data, error } = await supabase.rpc(
        functionName,
        parameters
    );

    if (error) throw error;

    return data;
}

async function testCosmosSupabaseConnection() {
    try {
        await waitForSupabase();

        console.log("COSMOS Supabase connection ready.");

        return true;
    } catch (error) {
        console.error(
            "COSMOS Supabase connection failed:",
            error
        );

        return false;
    }
}

/* =========================================================
   JOURNEY PROGRESS
   ========================================================= */

const COSMOS_JOURNEY = {
    ASSESSMENT: "cosmos_assessment_completed",
    DISCOVER: "cosmos_discover_completed",
    RESUME: "cosmos_resume_completed",
    TEST: "cosmos_test_completed",
    CAREER: "cosmos_career_completed",
    CERTIFICATE: "cosmos_certificate_completed"
};

function completeCosmosStep(step) {
    localStorage.setItem(step, "true");
}

function isCosmosStepCompleted(step) {
    return localStorage.getItem(step) === "true";
}

function canAccessCosmosStep(step) {
    const order = [
        COSMOS_JOURNEY.ASSESSMENT,
        COSMOS_JOURNEY.DISCOVER,
        COSMOS_JOURNEY.RESUME,
        COSMOS_JOURNEY.TEST,
        COSMOS_JOURNEY.CAREER,
        COSMOS_JOURNEY.CERTIFICATE
    ];

    const index = order.indexOf(step);

    if (index <= 0) return true;

    return isCosmosStepCompleted(order[index - 1]);
}
