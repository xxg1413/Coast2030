import type { D1Database } from './db';

interface Migration {
    version: number;
    name: string;
    sql: string;
}

const MIGRATIONS: Migration[] = [
    {
        version: 1,
        name: 'create_core_tables',
        sql: `
            CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              type TEXT NOT NULL,
              project TEXT,
              amount REAL NOT NULL,
              memo TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS monthly_milestones (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              year INTEGER NOT NULL,
              month INTEGER NOT NULL,
              text TEXT NOT NULL,
              completed INTEGER DEFAULT 0,
              milestone_datetime TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS weekly_focus (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              text TEXT NOT NULL,
              completed INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS daily_tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              task_date TEXT NOT NULL,
              task_datetime TEXT,
              text TEXT NOT NULL,
              completed INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
            CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
            CREATE INDEX IF NOT EXISTS idx_monthly_milestones_year_month ON monthly_milestones(year, month);
            CREATE INDEX IF NOT EXISTS idx_daily_tasks_task_date ON daily_tasks(task_date);
        `,
    },
];

async function ensureMigrationsTable(db: D1Database): Promise<void> {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function runMigrations(db: D1Database): Promise<void> {
    await ensureMigrationsTable(db);

    const row = await db
        .prepare('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations')
        .first<{ version: number }>();

    const currentVersion = Number(row?.version || 0);
    const pending = MIGRATIONS
        .filter((migration) => migration.version > currentVersion)
        .sort((a, b) => a.version - b.version);

    for (const migration of pending) {
        await db.exec(migration.sql);
        await db
            .prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)')
            .bind(migration.version, migration.name)
            .run();
    }
}
