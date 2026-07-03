const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Locate the api folder in your directory structure (supports both src/app and app structures)
const possiblePaths = [
    path.join(__dirname, "src", "app", "api"),
    path.join(__dirname, "app", "api")
];

let apiPath = "";
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        apiPath = p;
        break;
    }
}

const backupPath = apiPath ? `${apiPath}-backup` : "";

try {
    // 1. Temporarily hide the API directory so Next.js doesn't scan/evaluate it during static compile
    if (apiPath && fs.existsSync(apiPath)) {
        console.log(`Hiding API folder for static export: ${apiPath} -> ${backupPath}`);
        fs.renameSync(apiPath, backupPath);
    }

    // 2. Execute the static compilation with the environment flag active
    console.log("Starting static HTML compilation...");
    execSync("next build", {
        env: { ...process.env, STATIC_EXPORT: "true" },
        stdio: "inherit"
    });

    console.log("Static compilation completed successfully.");
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
} finally {
    // 3. Always restore the API folder so normal local development remains functional
    if (backupPath && fs.existsSync(backupPath) && apiPath) {
        console.log(`Restoring API folder: ${backupPath} -> ${apiPath}`);
        fs.renameSync(backupPath, apiPath);
    }
}