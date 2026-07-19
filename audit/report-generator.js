import fs from "fs";

export function generateReport(report) {

    let errors = 0;
    let warnings = 0;
    let passed = 0;

    report.forEach(item => {

        if (item.type === "ERROR") errors++;
        else if (item.type === "WARNING") warnings++;
        else passed++;

    });

    const total = report.length || 1;

    const score = Math.max(
        0,
        Math.round(
            ((passed + (warnings * 0.5)) / total) * 100
        )
    );

    let rows = "";

    report.forEach(item => {

        let color = "#4CAF50";

        if (item.type === "WARNING")
            color = "#FFC107";

        if (item.type === "ERROR")
            color = "#F44336";

        rows += `
        <tr>
            <td style="color:${color};font-weight:bold;">
                ${item.type}
            </td>

            <td>${item.file}</td>

            <td>${item.message}</td>
        </tr>
        `;

    });

    if (rows === "") {

        rows = `
        <tr>
            <td colspan="3" style="text-align:center;">
                🎉 No problems found.
            </td>
        </tr>
        `;

    }

    const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>WorkBee Audit Report</title>

<style>

body{

font-family:Arial;

background:#f4f6f9;

padding:30px;

}

h1{

color:#2563eb;

}

.cards{

display:flex;

gap:20px;

margin:20px 0;

flex-wrap:wrap;

}

.card{

background:white;

padding:20px;

border-radius:10px;

box-shadow:0 5px 15px rgba(0,0,0,.1);

width:220px;

}

.card h2{

margin:0;

}

table{

width:100%;

border-collapse:collapse;

background:white;

margin-top:20px;

}

th,td{

padding:12px;

border:1px solid #ddd;

text-align:left;

}

th{

background:#2563eb;

color:white;

}

</style>

</head>

<body>

<h1>🐝 WorkBee Project Audit</h1>

<div class="cards">

<div class="card">

<h2>Health Score</h2>

<h1>${score}%</h1>

</div>

<div class="card">

<h2>Errors</h2>

<h1 style="color:red;">
${errors}
</h1>

</div>

<div class="card">

<h2>Warnings</h2>

<h1 style="color:orange;">
${warnings}
</h1>

</div>

<div class="card">

<h2>Passed</h2>

<h1 style="color:green;">
${passed}
</h1>

</div>

</div>

<table>

<tr>

<th>Status</th>

<th>File</th>

<th>Message</th>

</tr>

${rows}

</table>

</body>

</html>
`;

    fs.writeFileSync(
        "audit-report.html",
        html
    );

}