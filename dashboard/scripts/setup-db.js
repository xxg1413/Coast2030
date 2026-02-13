const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'local.sqlite');
const SCHEMA_PATH = path.join(process.cwd(), 'schema.sql');

function setup() {
    console.log(`Setting up DB at ${DB_PATH}...`);
    const db = new Database(DB_PATH);

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);

    console.log('Schema applied successfully.');
    db.close();
}

setup();
