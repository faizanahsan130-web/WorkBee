import fs from "fs";
import path from "path";

export function checkCSS(projectPath = process.cwd()) {

    const report = [];

    const cssFiles = [];

    scan(projectPath);

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
                ) continue;

                scan(fullPath);

            } else if (file.endsWith(".css")) {

                cssFiles.push(file);

                checkFile(fullPath);

            }

        }

    }

    function checkFile(filePath) {

        const css = fs.readFileSync(filePath, "utf8");

        // Empty CSS

        if (css.trim() === "") {

            report.push({

                type: "ERROR",

                file: filePath,

                message: "Empty CSS File"

            });

        }

        // Basic Syntax Check

        const open = (css.match(/{/g) || []).length;

        const close = (css.match(/}/g) || []).length;

        if (open !== close) {

            report.push({

                type: "ERROR",

                file: filePath,

                message: "CSS Brackets Mismatch"

            });

        }

        // Missing body selector

        if (!css.includes("body")) {

            report.push({

                type: "WARNING",

                file: filePath,

                message: "No body selector found"

            });

        }

    }

    // Duplicate CSS Names

    const seen = new Set();

    cssFiles.forEach(file => {

        if (seen.has(file)) {

            report.push({

                type: "WARNING",

                file,

                message: "Duplicate CSS File Name"

            });

        }

        seen.add(file);

    });

}