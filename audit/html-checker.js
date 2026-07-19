import fs from "fs";
import path from "path";

export function checkHTML(projectPath = process.cwd()) {

    const report = [];

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

            } else if (file.endsWith(".html")) {

                checkFile(fullPath);

            }

        }

    }

    function checkFile(filePath) {

        const html = fs.readFileSync(filePath, "utf8");

        // Empty File
        if (html.trim() === "") {

            report.push({
                type: "ERROR",
                file: filePath,
                message: "Empty HTML File"
            });

        }

        // CSS Link
        const cssLinks = html.match(/href="([^"]+\.css)"/g);

        if (!cssLinks) {

            report.push({
                type: "WARNING",
                file: filePath,
                message: "No CSS Linked"
            });

        }

        // JS Link
        const jsLinks = html.match(/src="([^"]+\.js)"/g);

        if (!jsLinks) {

            report.push({
                type: "WARNING",
                file: filePath,
                message: "No JavaScript Linked"
            });

        }

        // Duplicate IDs

        const ids = [];

        const idMatches = [...html.matchAll(/id="([^"]+)"/g)];

        idMatches.forEach(match => {

            if (ids.includes(match[1])) {

                report.push({
                    type: "ERROR",
                    file: filePath,
                    message: `Duplicate ID : ${match[1]}`
                });

            }

            ids.push(match[1]);

        });

    }

}