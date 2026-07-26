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
    {
        version: 7,
        name: 'create_morning_logs',
        sql: `
            CREATE TABLE IF NOT EXISTS morning_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              log_date TEXT NOT NULL UNIQUE,
              items_json TEXT NOT NULL DEFAULT '[]',
              custom_json TEXT NOT NULL DEFAULT '[]',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_morning_logs_log_date ON morning_logs(log_date DESC);
        `,
    },
    {
        version: 8,
        name: 'add_morning_logs_pomodoro_json',
        sql: `
            ALTER TABLE morning_logs ADD COLUMN pomodoro_json TEXT NOT NULL DEFAULT '[]';
        `,
    },
    {
        version: 9,
        name: 'add_goal_hierarchy_and_week_history',
        sql: `
            ALTER TABLE monthly_milestones ADD COLUMN goal_area TEXT NOT NULL DEFAULT 'Overall';
            ALTER TABLE monthly_milestones ADD COLUMN evidence TEXT NOT NULL DEFAULT '';

            ALTER TABLE weekly_focus ADD COLUMN week_key TEXT NOT NULL DEFAULT '';
            ALTER TABLE weekly_focus ADD COLUMN goal_area TEXT NOT NULL DEFAULT 'Overall';
            ALTER TABLE weekly_focus ADD COLUMN parent_monthly_id INTEGER;
            ALTER TABLE weekly_focus ADD COLUMN evidence TEXT NOT NULL DEFAULT '';

            ALTER TABLE daily_tasks ADD COLUMN goal_area TEXT NOT NULL DEFAULT 'Overall';
            ALTER TABLE daily_tasks ADD COLUMN parent_weekly_id INTEGER;
            ALTER TABLE daily_tasks ADD COLUMN evidence TEXT NOT NULL DEFAULT '';

            UPDATE weekly_focus
            SET week_key = strftime('%Y-W%W', 'now', '+8 hours')
            WHERE week_key = '';

            CREATE INDEX IF NOT EXISTS idx_monthly_milestones_goal_area
              ON monthly_milestones(year, month, goal_area);
            CREATE INDEX IF NOT EXISTS idx_weekly_focus_week_goal
              ON weekly_focus(week_key, goal_area);
            CREATE INDEX IF NOT EXISTS idx_daily_tasks_date_goal
              ON daily_tasks(task_date, goal_area);
        `,
    },
    {
        version: 10,
        name: 'create_agent_advisor_control_plane',
        sql: `
            ALTER TABLE daily_tasks ADD COLUMN agent_work_item_id TEXT;

            CREATE TABLE IF NOT EXISTS agent_runs (
              id TEXT PRIMARY KEY,
              run_key TEXT NOT NULL UNIQUE,
              trigger_type TEXT NOT NULL DEFAULT 'daily_advisor',
              objective TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'completed',
              context_json TEXT NOT NULL DEFAULT '{}',
              plan_json TEXT NOT NULL DEFAULT '[]',
              summary TEXT NOT NULL DEFAULT '',
              budget_steps INTEGER NOT NULL DEFAULT 3,
              started_at TEXT NOT NULL,
              completed_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS agent_work_items (
              id TEXT PRIMARY KEY,
              run_id TEXT NOT NULL,
              goal_area TEXT NOT NULL,
              project TEXT NOT NULL,
              title TEXT NOT NULL,
              rationale TEXT NOT NULL DEFAULT '',
              definition_of_done TEXT NOT NULL DEFAULT '',
              evidence_required TEXT NOT NULL DEFAULT '',
              priority TEXT NOT NULL DEFAULT 'P1',
              state TEXT NOT NULL DEFAULT 'proposed',
              due_date TEXT NOT NULL,
              source_kind TEXT NOT NULL DEFAULT 'advisor',
              source_ref TEXT NOT NULL DEFAULT '',
              created_by TEXT NOT NULL DEFAULT 'agent_advisor',
              version INTEGER NOT NULL DEFAULT 1,
              approved_at TEXT,
              completed_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS agent_approvals (
              id TEXT PRIMARY KEY,
              run_id TEXT NOT NULL,
              work_item_id TEXT NOT NULL UNIQUE,
              action_type TEXT NOT NULL,
              risk_level TEXT NOT NULL DEFAULT 'low',
              request_json TEXT NOT NULL DEFAULT '{}',
              status TEXT NOT NULL DEFAULT 'pending',
              decided_by TEXT,
              decided_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS agent_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              run_id TEXT NOT NULL,
              work_item_id TEXT,
              event_type TEXT NOT NULL,
              actor_type TEXT NOT NULL,
              actor_id TEXT NOT NULL,
              payload_json TEXT NOT NULL DEFAULT '{}',
              idempotency_key TEXT NOT NULL UNIQUE,
              created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_agent_runs_created
              ON agent_runs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_agent_work_items_run_state
              ON agent_work_items(run_id, state, priority);
            CREATE INDEX IF NOT EXISTS idx_agent_work_items_due
              ON agent_work_items(due_date, goal_area);
            CREATE INDEX IF NOT EXISTS idx_agent_approvals_status
              ON agent_approvals(status, created_at);
            CREATE INDEX IF NOT EXISTS idx_agent_events_run
              ON agent_events(run_id, created_at);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_tasks_agent_work_item
              ON daily_tasks(agent_work_item_id);
        `,
    },
    {
        version: 11,
        name: 'create_operator_control_plane',
        sql: `
            CREATE TABLE IF NOT EXISTS operator_access_tokens (
              id TEXT PRIMARY KEY,
              label TEXT NOT NULL,
              token_prefix TEXT NOT NULL,
              token_hash TEXT NOT NULL UNIQUE,
              last_used_at TEXT,
              expires_at TEXT,
              revoked_at TEXT,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS operator_action_requests (
              id TEXT PRIMARY KEY,
              action_type TEXT NOT NULL,
              target TEXT NOT NULL,
              summary TEXT NOT NULL,
              risk_level TEXT NOT NULL DEFAULT 'high',
              request_json TEXT NOT NULL DEFAULT '{}',
              status TEXT NOT NULL DEFAULT 'pending',
              requested_by TEXT NOT NULL,
              idempotency_key TEXT NOT NULL UNIQUE,
              decided_by TEXT,
              decided_at TEXT,
              executed_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS operator_tool_calls (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              token_id TEXT NOT NULL,
              tool_name TEXT NOT NULL,
              request_json TEXT NOT NULL DEFAULT '{}',
              response_json TEXT NOT NULL DEFAULT '{}',
              status TEXT NOT NULL,
              error_message TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL,
              completed_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_operator_tokens_active
              ON operator_access_tokens(revoked_at, expires_at);
            CREATE INDEX IF NOT EXISTS idx_operator_actions_status
              ON operator_action_requests(status, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_operator_tool_calls_created
              ON operator_tool_calls(created_at DESC);
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
