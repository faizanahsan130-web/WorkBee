import fs from "fs";
import path from "path";

export function checkDuplicates(projectPath = process.cwd()) {

    const report = [];

    const fileMap = {};

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
                ) {
                    continue;
                }

                scan(fullPath);

            } else {

                if (!fileMap[file]) {

                    fileMap[file] = [];

                }

                fileMap[file].push(fullPath);

            }

        }

    }

    Object.keys(fileMap).forEach(file => {

        if (fileMap[file].length > 1) {

            report.push({

                type: "WARNING",

                file,

                message: `Duplicate file found (${fileMap[file].length} copies)`,

                locations: fileMap[file]

            });

        }

    });

}