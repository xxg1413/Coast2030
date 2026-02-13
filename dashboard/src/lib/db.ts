import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { runMigrations } from './migrations';

// Interface for D1-like behavior
export interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: any;
}

export interface D1ExecResult {
    count: number;
    duration: number;
}

// Local sql.js Helper
let SQLPromise: Promise<initSqlJs.SqlJsStatic> | null = null;
function getSqlJs() {
    if (!SQLPromise) {
        // Use local copy of wasm to avoid node_modules resolution issues in Next.js build
        const wasmPath = path.join(process.cwd(), 'sql-wasm.wasm');
        SQLPromise = initSqlJs({
            locateFile: (file) => wasmPath
        });
    }
    return SQLPromise;
}

// Local SQLite Implementation (simulating D1 with WASM)
class LocalD1Database implements D1Database {
    private db: initSqlJs.Database;
    private dbPath: string;

    constructor(db: initSqlJs.Database, dbPath: string) {
        this.db = db;
        this.dbPath = dbPath;
    }

    save() {
        console.log('[DB] Saving to disk...');
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
        console.log('[DB] Saved.');
    }

    prepare(query: string): D1PreparedStatement {
        return new LocalD1PreparedStatement(this.db, query, () => this.save());
    }

    async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
        const results: D1Result[] = [];
        for (const stmt of statements) {
            results.push(await stmt.run());
        }
        return results;
    }

    async exec(query: string): Promise<D1ExecResult> {
        if (!this.db) throw new Error("DB not initialized");
        this.db.run(query);
        this.save();
        return { count: 0, duration: 0 };
    }
}

class LocalD1PreparedStatement implements D1PreparedStatement {
    private db: initSqlJs.Database;
    private query: string;
    private params: any[] = [];
    private saveCallback: () => void;

    constructor(db: initSqlJs.Database, query: string, saveCallback: () => void) {
        this.db = db;
        this.query = query;
        this.saveCallback = saveCallback;
    }

    bind(...values: any[]): D1PreparedStatement {
        this.params = values;
        return this;
    }

    async first<T = unknown>(colName?: string): Promise<T | null> {
        const res = this.db.exec(this.query, this.params);
        if (res.length > 0 && res[0].values.length > 0) {
            const columns = res[0].columns;
            const values = res[0].values[0];
            const obj: any = {};
            columns.forEach((col, i) => obj[col] = values[i]);
            return obj as T;
        }
        return null;
    }

    async run(): Promise<D1Result> {
        this.db.run(this.query, this.params);
        this.saveCallback();
        return {
            results: [],
            success: true,
            meta: { changes: this.db.getRowsModified() },
        };
    }

    async all<T = unknown>(): Promise<D1Result<T>> {
        const res = this.db.exec(this.query, this.params);
        let results: T[] = [];
        if (res.length > 0) {
            const columns = res[0].columns;
            results = res[0].values.map(row => {
                const obj: any = {};
                columns.forEach((col, i) => obj[col] = row[i]);
                return obj as T;
            });
        }
        return {
            results,
            success: true,
            meta: {},
        };
    }

    async raw<T = unknown>(): Promise<T[]> {
        const res = this.db.exec(this.query, this.params);
        if (res.length > 0) {
            return res[0].values as any as T[];
        }
        return [];
    }
}

class CloudflareD1Database implements D1Database {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    prepare(query: string): D1PreparedStatement {
        return new CloudflareD1PreparedStatement(this.db.prepare(query));
    }

    async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
        const nativeStatements = statements.map((statement) => {
            if (statement instanceof CloudflareD1PreparedStatement) {
                return statement.getNativeStatement();
            }
            throw new Error('Cloudflare D1 batch only supports statements created from the same DB instance');
        });
        const result = await this.db.batch(nativeStatements);
        return result as D1Result[];
    }

    async exec(query: string): Promise<D1ExecResult> {
        // Avoid native exec() metadata aggregation edge-cases in workerd by
        // executing each statement via prepare().run().
        const statements = query
            .split(';')
            .map((statement: string) => statement.trim())
            .filter((statement: string) => statement.length > 0);

        const startedAt = Date.now();
        for (const statement of statements) {
            await this.db.prepare(statement).run();
        }

        return {
            count: statements.length,
            duration: Date.now() - startedAt,
        };
    }
}

class CloudflareD1PreparedStatement implements D1PreparedStatement {
    private statement: any;

    constructor(statement: any) {
        this.statement = statement;
    }

    getNativeStatement() {
        return this.statement;
    }

    bind(...values: any[]): D1PreparedStatement {
        this.statement = this.statement.bind(...values);
        return this;
    }

    async first<T = unknown>(colName?: string): Promise<T | null> {
        const result = await this.statement.first(colName);
        return (result ?? null) as T | null;
    }

    async run(): Promise<D1Result> {
        const result = await this.statement.run();
        return result as D1Result;
    }

    async all<T = unknown>(): Promise<D1Result<T>> {
        const result = await this.statement.all();
        return result as D1Result<T>;
    }

    async raw<T = unknown>(): Promise<T[]> {
        const result = await this.statement.raw();
        return result as T[];
    }
}

// Singleton definition with global type for development hot reload
const globalForDB = globalThis as unknown as {
    conn: Promise<D1Database> | undefined;
    migrationsReady: Promise<void> | undefined;
};

async function ensureMigrationsReady(db: D1Database): Promise<void> {
    if (!globalForDB.migrationsReady) {
        globalForDB.migrationsReady = runMigrations(db).catch((error) => {
            globalForDB.migrationsReady = undefined;
            throw error;
        });
    }

    await globalForDB.migrationsReady;
}

export async function getDB(): Promise<D1Database> {
    if (process.env.NODE_ENV === 'development') {
        if (!globalForDB.conn) {
            // Use local copy of wasm to avoid node_modules resolution issues in Next.js build
            const wasmPath = path.join(process.cwd(), 'sql-wasm.wasm');
            const dbPath = path.join(process.cwd(), 'local.sqlite');

            const init = async () => {
                const SQL = await initSqlJs({
                    locateFile: (file) => wasmPath
                });
                let db: initSqlJs.Database;
                if (fs.existsSync(dbPath)) {
                    console.log('[DB] Loading existing DB from', dbPath);
                    const filebuffer = fs.readFileSync(dbPath);
                    db = new SQL.Database(filebuffer);
                } else {
                    console.log('[DB] Creating new DB at', dbPath);
                    db = new SQL.Database();
                    // Save immediately to create the file
                    const data = db.export();
                    fs.writeFileSync(dbPath, Buffer.from(data));
                }
                return new LocalD1Database(db, dbPath);
            };
            globalForDB.conn = init();
        }
        const db = await globalForDB.conn;
        await ensureMigrationsReady(db);
        return db;
    } else {
        const context = getCloudflareContext();
        const env = context?.env as Record<string, unknown> | undefined;
        const d1 = env?.DB;
        if (!d1) {
            throw new Error('Cloudflare D1 binding "DB" not found');
        }
        const db = new CloudflareD1Database(d1);
        await ensureMigrationsReady(db);
        return db;
    }
}
