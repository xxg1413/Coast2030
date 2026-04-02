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
    {
        version: 2,
        name: 'create_auth_login_attempts',
        sql: `
            CREATE TABLE IF NOT EXISTS auth_login_attempts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ip TEXT NOT NULL,
              attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_ip_time ON auth_login_attempts(ip, attempted_at);
        `,
    },
    {
        version: 3,
        name: 'create_monthly_reviews',
        sql: `
            CREATE TABLE IF NOT EXISTS monthly_reviews (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              year INTEGER NOT NULL,
              month INTEGER NOT NULL,
              wins TEXT DEFAULT '',
              losses TEXT DEFAULT '',
              blockers TEXT DEFAULT '',
              next_steps TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(year, month)
            );

            CREATE INDEX IF NOT EXISTS idx_monthly_reviews_year_month ON monthly_reviews(year, month);
        `,
    },
    {
        version: 4,
        name: 'create_hunter_targets',
        sql: `
            CREATE TABLE IF NOT EXISTS hunter_targets (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              platform TEXT DEFAULT '',
              url TEXT DEFAULT '',
              priority TEXT DEFAULT 'P1',
              status TEXT DEFAULT 'watch',
              bounty_estimate INTEGER DEFAULT 0,
              thesis TEXT DEFAULT '',
              odds_note TEXT DEFAULT '',
              last_action TEXT DEFAULT '',
              last_action_date TEXT DEFAULT '',
              next_step TEXT DEFAULT '',
              notes TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_hunter_targets_priority_status ON hunter_targets(priority, status);
            CREATE INDEX IF NOT EXISTS idx_hunter_targets_last_action_date ON hunter_targets(last_action_date);
        `,
    },
    {
        version: 5,
        name: 'create_asset_snapshots',
        sql: `
            CREATE TABLE IF NOT EXISTS asset_snapshots (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              snapshot_date TEXT NOT NULL,
              total_assets REAL NOT NULL DEFAULT 0,
              total_liabilities REAL NOT NULL DEFAULT 0,
              net_worth REAL NOT NULL DEFAULT 0,
              notes TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_asset_snapshots_snapshot_date ON asset_snapshots(snapshot_date DESC);
        `,
    },
    {
        version: 6,
        name: 'add_transaction_currency_fields',
        sql: `
            ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'CNY';
            ALTER TABLE transactions ADD COLUMN fx_rate REAL NOT NULL DEFAULT 1;
            ALTER TABLE transactions ADD COLUMN original_amount REAL NOT NULL DEFAULT 0;

            UPDATE transactions
            SET
              currency = COALESCE(NULLIF(currency, ''), 'CNY'),
              fx_rate = CASE WHEN COALESCE(fx_rate, 0) <= 0 THEN 1 ELSE fx_rate END,
              original_amount = CASE
                WHEN COALESCE(original_amount, 0) <= 0 THEN amount
                ELSE original_amount
              END;
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
