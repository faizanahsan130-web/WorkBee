import fs from 'fs';

function generateDetailedExcel() {
    try {
        // 1. JSON file read karein
        const rawData = fs.readFileSync('../audit/audit-results.json', 'utf8');
        const data = JSON.parse(rawData);

        // 2. CSV content banayein
        // Hum "Status" aur "Pending Task" ka column add kar rahe hain
        let csvContent = "Masla,Status,Pending Task\n";

        // JSON se data utha kar line-by-line Excel mein dalna
        // Agar aapke JSON mein issues ki list hai toh ye loop chalega
        data.issues.forEach(item => {
            const status = item.fixed ? "Fixed" : "Incomplete";
            const task = item.fixed ? "-" : item.remainingTask || "Complete pending work";
            csvContent += `${item.name},${status},${task}\n`;
        });

        // 3. File save karein
        fs.writeFileSync('workbee-audit-report.csv', csvContent);
        console.log("✅ Report generate ho gayi hai: workbee-audit-report.csv");
        
    } catch (error) {
        console.error("File banane mein masla aaya:", error);
    }
}

generateDetailedExcel();