import fs from "fs";
import path from "path";

export function checkFirebase(projectPath = process.cwd()) {

    const report = [];

    // ==========================
    // firebase-config.js Check
    // ==========================

    let firebaseConfigFound = false;

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

            } else {

                if (file === "firebase-config.js") {

                    firebaseConfigFound = true;

                    checkFirebaseConfig(fullPath);

                }

            }

        }

    }

    scan(projectPath);

    if (!firebaseConfigFound) {

        report.push({

            type: "ERROR",

            file: "firebase-config.js",

            message: "firebase-config.js file not found."

        });

    }

    return report;

    // ==========================
    // Firebase Config Checker
    // ==========================

    function checkFirebaseConfig(filePath) {

        const code = fs.readFileSync(filePath, "utf8");

        if (!code.includes("initializeApp")) {

            report.push({

                type: "ERROR",

                file: filePath,

                message: "initializeApp() is missing."

            });

        }

        if (!code.includes("getAuth")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "Firebase Authentication is not configured."

            });

        }

        if (!code.includes("getFirestore")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "Firestore Database is not configured."

            });

        }

        if (!code.includes("export const auth")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "auth export is missing."

            });

        }

        if (!code.includes("export const db")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "db export is missing."

            });

        }

        if (!code.includes("firebaseConfig")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "firebaseConfig object not found."

            });

        }

    }

}