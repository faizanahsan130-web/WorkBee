import fs from "fs";
import path from "path";

export function checkPaths(projectPath = process.cwd()) {

    const report = [];

    scan(projectPath);

    return report;

    // ==========================
    // Scan All HTML Files
    // ==========================

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

            }

            else if (file.endsWith(".html")) {

                checkHTML(fullPath);

            }

        }

    }

    // ==========================
    // Check HTML Paths
    // ==========================

    function checkHTML(filePath) {

        const html = fs.readFileSync(filePath, "utf8");

        // ---------- CSS ----------

        const cssMatches = [
            ...html.matchAll(/href="([^"]+\.css)"/g)
        ];

        cssMatches.forEach(match => {

            const cssPath = path.join(
                path.dirname(filePath),
                match[1]
            );

            if (!fs.existsSync(cssPath)) {

                report.push({

                    type: "ERROR",

                    file: filePath,

                    message:
                        `Missing CSS File → ${match[1]}`

                });

            }

        });

        // ---------- JavaScript ----------

        const jsMatches = [
            ...html.matchAll(/src="([^"]+\.js)"/g)
        ];

        jsMatches.forEach(match => {

            const jsPath = path.join(
                path.dirname(filePath),
                match[1]
            );

            if (!fs.existsSync(jsPath)) {

                report.push({

                    type: "ERROR",

                    file: filePath,

                    message:
                        `Missing JavaScript File → ${match[1]}`

                });

            }

        });

        // ---------- Images ----------

        const imgMatches = [
            ...html.matchAll(/src="([^"]+\.(png|jpg|jpeg|gif|svg|webp))"/g)
        ];

        imgMatches.forEach(match => {

            const imgPath = path.join(
                path.dirname(filePath),
                match[1]
            );

            if (!fs.existsSync(imgPath)) {

                report.push({

                    type: "WARNING",

                    file: filePath,

                    message:
                        `Missing Image → ${match[1]}`

                });

            }

        });

        // ---------- Internal Links ----------

        const pageMatches = [
            ...html.matchAll(/href="([^"]+\.html)"/g)
        ];

        pageMatches.forEach(match => {

            const pagePath = path.join(
                path.dirname(filePath),
                match[1]
            );

            if (!fs.existsSync(pagePath)) {

                report.push({

                    type: "WARNING",

                    file: filePath,

                    message:
                        `Broken HTML Link → ${match[1]}`

                });

            }

        });

    }

}