-- Non-destructive bootstrap schema for local/dev initialization.
-- Use explicit SQL commands when you need to reset data.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- 'SaaS', 'Hunter', 'Media', 'Other'
  project TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  fx_rate REAL NOT NULL DEFAULT 1,
  original_amount REAL NOT NULL DEFAULT 0,
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monthly_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0, -- boolean
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

CREATE TABLE IF NOT EXISTS auth_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_monthly_milestones_year_month ON monthly_milestones(year, month);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_task_date ON daily_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_monthly_reviews_year_month ON monthly_reviews(year, month);
CREATE INDEX IF NOT EXISTS idx_hunter_targets_priority_status ON hunter_targets(priority, status);
CREATE INDEX IF NOT EXISTS idx_hunter_targets_last_action_date ON hunter_targets(last_action_date);
CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_ip_time ON auth_login_attempts(ip, attempted_at);
CREATE INDEX IF NOT EXISTS idx_asset_snapshots_snapshot_date ON asset_snapshots(snapshot_date DESC);
