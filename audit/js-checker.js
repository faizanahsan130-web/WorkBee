import fs from "fs";
import path from "path";

export function checkJS(projectPath = process.cwd()) {

    const report = [];
    const jsFiles = [];

    scan(projectPath);
    checkDuplicates();

    return report;

    function scan(folder) {

        const files = fs.readdirSync(folder);

        for (const file of files) {

            const fullPath = path.join(folder, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {

                if (
                    file === "node_modules" ||
                    file === ".git" ||
                    file === "uploads"
                ) {
                    continue;
                }

                scan(fullPath);

            } else if (file.endsWith(".js")) {

                jsFiles.push(file);
                checkFile(fullPath);

            }

        }

    }

    function checkFile(filePath) {

        const code = fs.readFileSync(filePath, "utf8");

        // Empty JS File
        if (code.trim() === "") {

            report.push({
                type: "ERROR",
                file: filePath,
                message: "Empty JavaScript file"
            });

        }

        // Basic Import Check
        if (code.includes("import") && !code.includes("from")) {

            report.push({
                type: "WARNING",
                file: filePath,
                message: "Possible invalid import statement"
            });

        }

        // Firebase Check
        if (
            code.includes("onAuthStateChanged") &&
            !code.includes("firebase-auth")
        ) {

            report.push({
                type: "WARNING",
                file: filePath,
                message: "Firebase Auth import may be missing"
            });

        }

        if (
            code.includes("getFirestore") &&
            !code.includes("firebase-firestore")
        ) {

            report.push({
                type: "WARNING",
                file: filePath,
                message: "Firestore import may be missing"
            });

        }

    }

    function checkDuplicates() {

        const seen = new Set();

        jsFiles.forEach(file => {

            if (seen.has(file)) {

                report.push({
                    type: "WARNING",
                    file,
                    message: "Duplicate JavaScript filename"
                });

            }

            seen.add(file);

        });

    }

}