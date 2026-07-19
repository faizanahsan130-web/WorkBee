// =======================================
// WorkBee Project Auditor v1.0
// Main File
// =======================================

import { checkHTML } from './html-checker.js';
import { checkCSS } from './css-checker.js';
import { checkJS } from './js-checker.js';
import { checkDuplicates } from './duplicate-checker.js';
import { checkFirebase } from './firebase-checker.js';
import { checkPaths } from './path-checker.js';
import { generateReport } from './report-generator.js';

console.clear();

console.log("");
console.log("======================================");
console.log("🐝 WorkBee Project Auditor");
console.log("Version : 1.0");
console.log("======================================");
console.log("");

let report = [];

try {

    console.log("🔍 Checking HTML...");
    report.push(...checkHTML());

    console.log("🎨 Checking CSS...");
    report.push(...checkCSS());

    console.log("⚡ Checking JavaScript...");
    report.push(...checkJS());

    console.log("🔥 Checking Firebase...");
    report.push(...checkFirebase());

    console.log("📂 Checking Duplicate Files...");
    report.push(...checkDuplicates());

    console.log("🔗 Checking Paths...");
    report.push(...checkPaths());

    console.log("");

    generateReport(report);

    console.log("======================================");
    console.log("✅ Audit Completed Successfully");
    console.log("📄 audit-report.html Generated");
    console.log("======================================");

}

catch (error) {

    console.error("");
    console.error("❌ Audit Failed");
    console.error(error);

}