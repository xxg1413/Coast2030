const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'local.sqlite');
const SCHEMA_PATH = path.join(process.cwd(), 'schema.sql');
const LEDGER_PATH = path.join(process.cwd(), '../2026/metrics/finance-ledger.md');
const PLAN_PATH = path.join(process.cwd(), '../2026/02-plan.md');

async function migrate() {
    console.log(`Migrating data to ${DB_PATH} using sql.js...`);
    const SQL = await initSqlJs();
    let db;

    // Load existing or create new
    if (fs.existsSync(DB_PATH)) {
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
    } else {
        db = new SQL.Database();
    }

    // Apply Schema (Idempotent)
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schema);

    // 1. Transactions
    if (fs.existsSync(LEDGER_PATH)) {
        const fileContent = fs.readFileSync(LEDGER_PATH, 'utf8');
        const lines = fileContent.split('\n');

        // sql.js doesn't support prepare().run() multiple times easily inside transaction without rebinding?
        // Actually it does.
        const stmt = db.prepare('INSERT INTO transactions (date, type, project, amount, memo) VALUES (?, ?, ?, ?, ?)');

        let count = 0;
        db.run("BEGIN TRANSACTION");
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed.startsWith('|')) return;
            if (trimmed.includes('Date') || trimmed.includes('---')) return;

            const cols = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
            if (cols.length >= 5) {
                // Check if exists to avoid dupes (rough check)
                // For migration, we might just wipe and recreation or assume empty start. 
                // Let's checking if ID exists is hard without ID. 
                // Let's assume we are initializing.
                stmt.run([cols[0], cols[1], cols[2], parseFloat(cols[3]) || 0, cols[4]]);
                count++;
            }
        });
        db.run("COMMIT");
        stmt.free();
        console.log(`Migrated ${count} transactions.`);
    }

    // 2. Monthly Tasks
    if (fs.existsSync(PLAN_PATH)) {
        const fileContent = fs.readFileSync(PLAN_PATH, 'utf8');
        const match = fileContent.match(/## 📅 关键里程碑.*?\n([\s\S]*?)## 🚀/);

        if (match) {
            const rawContent = match[1].trim();
            const stmt = db.prepare('INSERT INTO monthly_milestones (year, month, text, completed) VALUES (?, ?, ?, ?)');

            let count = 0;
            db.run("BEGIN TRANSACTION");
            rawContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                let text = '';
                let completed = 0;

                if (trimmed.startsWith('- [ ]')) {
                    text = trimmed.replace('- [ ]', '').trim();
                    completed = 0;
                } else if (trimmed.startsWith('- [x]')) {
                    text = trimmed.replace('- [x]', '').trim();
                    completed = 1;
                }

                if (text) {
                    stmt.run([2026, 2, text, completed]);
                    count++;
                }
            });
            db.run("COMMIT");
            stmt.free();
            console.log(`Migrated ${count} monthly tasks.`);
        }
    }

    // Save back to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log("Database saved.");
}

migrate();
