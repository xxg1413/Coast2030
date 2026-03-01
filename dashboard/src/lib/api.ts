import { getDB } from "./db";
import fs from "node:fs/promises";
import path from "node:path";

const YEAR_MONTH_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const BEIJING_TIME_ZONE = "Asia/Shanghai";
const INCOME_TYPES = ["Hunter", "SaaS", "Media", "Other"] as const;
const YEAR_TARGETS = {
    cashFlow: 3000000,
    saas: 1750000,
    hunter: 1000000,
    media: 250000,
} as const;

type IncomeType = (typeof INCOME_TYPES)[number];

function resolveProjectPath(...segments: string[]): string {
    return path.resolve(process.cwd(), "..", ...segments);
}

async function readFileSafe(filePath: string): Promise<string> {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch {
        return "";
    }
}

function getBeijingDateTimeParts(date: Date = new Date()): {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
} {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: BEIJING_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        hourCycle: "h23",
    });

    const partMap = new Map<string, string>();
    for (const part of formatter.formatToParts(date)) {
        partMap.set(part.type, part.value);
    }

    return {
        year: partMap.get("year") || "1970",
        month: partMap.get("month") || "01",
        day: partMap.get("day") || "01",
        hour: partMap.get("hour") || "00",
        minute: partMap.get("minute") || "00",
    };
}

function getCurrentYearMonth(): string {
    const parts = getBeijingDateTimeParts();
    return `${parts.year}-${parts.month}`;
}

function getCurrentDate(): string {
    const parts = getBeijingDateTimeParts();
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function normalizeYearMonth(month?: string): string | undefined {
    if (!month) return undefined;
    return YEAR_MONTH_REGEX.test(month) ? month : undefined;
}

function normalizeDate(date?: string): string | undefined {
    if (!date) return undefined;
    return DATE_REGEX.test(date) ? date : undefined;
}

function toDatePrefix(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    return `${year}.${month}.${day}`;
}

function stripExistingDateTimePrefix(text: string): string {
    return text.replace(/^\d{4}\.\d{1,2}\.\d{1,2}\s+\d{2}:\d{2}\s+/, "").trim();
}

function buildPrefixedText(text: string, date: string, time: string): string {
    const content = stripExistingDateTimePrefix(text.trim());
    return `${toDatePrefix(date)} ${time} ${content}`;
}

function getNowDateTimeInfo(): { date: string; time: string; datetime: string } {
    const parts = getBeijingDateTimeParts();
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        time: `${parts.hour}:${parts.minute}`,
        datetime: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:00`,
    };
}

function parseYearMonth(month?: string): { year: number; month: number } | null {
    if (!month) return null;
    const match = month.match(YEAR_MONTH_REGEX);
    if (!match) return null;
    return {
        year: Number(match[1]),
        month: Number(match[2]),
    };
}

function getPreviousYearMonth(month: string): string {
    const [year, monthPart] = month.split("-").map(Number);
    const date = new Date(Date.UTC(year, monthPart - 1, 1));
    date.setUTCMonth(date.getUTCMonth() - 1);
    return date.toISOString().slice(0, 7);
}

function formatCurrency(value: number): string {
    return `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function getTrendText(current: number, previous: number): string {
    if (previous === 0) {
        if (current === 0) return "0%";
        return "新增长";
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}%`;
}

function getProgress(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 999);
}

// --- Weekly Focus ---

export interface TaskItem {
    id: string;
    text: string;
    completed: boolean;
}

export async function getStructuredWeeklyFocus(): Promise<{ title: string; tasks: TaskItem[] }> {
    const db = await getDB();
    const result = await db
        .prepare("SELECT id, text, completed FROM weekly_focus ORDER BY created_at ASC")
        .all<{ id: number; text: string; completed: number }>();

    const tasks = result.results.map((r) => ({
        id: r.id.toString(),
        text: r.text,
        completed: r.completed === 1,
    }));

    return { title: "本周焦点", tasks };
}

export async function toggleTask(taskId: string, completed: boolean): Promise<boolean> {
    const db = await getDB();
    await db
        .prepare("UPDATE weekly_focus SET completed = ? WHERE id = ?")
        .bind(completed ? 1 : 0, Number(taskId))
        .run();
    return true;
}

export async function addTask(taskText: string): Promise<boolean> {
    const db = await getDB();
    await db
        .prepare("INSERT INTO weekly_focus (text, completed) VALUES (?, 0)")
        .bind(taskText.trim())
        .run();
    return true;
}

export async function deleteTask(taskId: string): Promise<boolean> {
    const db = await getDB();
    await db.prepare("DELETE FROM weekly_focus WHERE id = ?").bind(Number(taskId)).run();
    return true;
}

// --- Monthly Reviews ---

export interface MonthlyReview {
    wins: string;
    losses: string;
    blockers: string;
    nextSteps: string;
}

async function ensureMonthlyReviewsTable() {
    const db = await getDB();
    await db.exec(`
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
    `);
}

async function ensureHunterTargetsTable() {
    const db = await getDB();
    await db.exec(`
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
    `);
}

export async function getMonthlyReview(month?: string): Promise<MonthlyReview> {
    await ensureMonthlyReviewsTable();
    const db = await getDB();
    const parsed = parseYearMonth(month || getCurrentYearMonth());

    if (!parsed) {
        return {
            wins: "",
            losses: "",
            blockers: "",
            nextSteps: "",
        };
    }

    const result = await db
        .prepare("SELECT wins, losses, blockers, next_steps FROM monthly_reviews WHERE year = ? AND month = ? LIMIT 1")
        .bind(parsed.year, parsed.month)
        .first<{ wins: string; losses: string; blockers: string; next_steps: string }>();

    return {
        wins: result?.wins || "",
        losses: result?.losses || "",
        blockers: result?.blockers || "",
        nextSteps: result?.next_steps || "",
    };
}

export async function saveMonthlyReview(
    month: string | undefined,
    review: MonthlyReview,
): Promise<boolean> {
    await ensureMonthlyReviewsTable();
    const db = await getDB();
    const parsed = parseYearMonth(month || getCurrentYearMonth());

    if (!parsed) return false;

    const wins = review.wins.trim();
    const losses = review.losses.trim();
    const blockers = review.blockers.trim();
    const nextSteps = review.nextSteps.trim();

    const existing = await db
        .prepare("SELECT id FROM monthly_reviews WHERE year = ? AND month = ? LIMIT 1")
        .bind(parsed.year, parsed.month)
        .first<{ id: number }>();

    if (existing?.id) {
        await db
            .prepare(`
                UPDATE monthly_reviews
                SET wins = ?, losses = ?, blockers = ?, next_steps = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .bind(wins, losses, blockers, nextSteps, existing.id)
            .run();
        return true;
    }

    await db
        .prepare(`
            INSERT INTO monthly_reviews (year, month, wins, losses, blockers, next_steps)
            VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(parsed.year, parsed.month, wins, losses, blockers, nextSteps)
        .run();

    return true;
}

export async function getMonthlyReviewDraft(month?: string): Promise<MonthlyReview> {
    await ensureMonthlyReviewsTable();
    await ensureHunterTargetsTable();

    const targetMonth = normalizeYearMonth(month) || getCurrentYearMonth();
    const db = await getDB();

    const [transactions, monthlyTasks, dailyStats, hunterStats] = await Promise.all([
        getTransactions(targetMonth),
        getMonthlyTasks(targetMonth),
        db
            .prepare(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
                FROM daily_tasks
                WHERE strftime('%Y-%m', task_date) = ?
            `)
            .bind(targetMonth)
            .first<{ total: number; completed: number }>(),
        db
            .prepare(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
                    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_count,
                    SUM(CASE WHEN priority = 'P0' THEN 1 ELSE 0 END) AS p0_count
                FROM hunter_targets
            `)
            .first<{ total: number; active_count: number; submitted_count: number; p0_count: number }>(),
    ]);

    const incomeByType = new Map<string, number>();
    let totalIncome = 0;
    for (const transaction of transactions) {
        totalIncome += Number(transaction.amount || 0);
        incomeByType.set(transaction.type, (incomeByType.get(transaction.type) || 0) + Number(transaction.amount || 0));
    }

    const monthlyCompleted = monthlyTasks.filter((task) => task.completed).length;
    const monthlyPending = monthlyTasks.filter((task) => !task.completed);
    const dailyTotal = Number(dailyStats?.total || 0);
    const dailyCompleted = Number(dailyStats?.completed || 0);
    const hunterTotal = Number(hunterStats?.total || 0);
    const hunterActive = Number(hunterStats?.active_count || 0);
    const hunterSubmitted = Number(hunterStats?.submitted_count || 0);
    const hunterP0 = Number(hunterStats?.p0_count || 0);

    const wins: string[] = [];
    const losses: string[] = [];
    const blockers: string[] = [];
    const nextSteps: string[] = [];

    if (totalIncome > 0) {
        wins.push(
            `本月已记录收入 ${formatCurrency(totalIncome)}，Hunter ${formatCurrency(incomeByType.get("Hunter") || 0)} / SaaS ${formatCurrency(incomeByType.get("SaaS") || 0)} / Media ${formatCurrency(incomeByType.get("Media") || 0)}。`,
        );
    } else {
        losses.push("本月数据库里还没有形成已到账收入，现金流验证仍未闭环。");
    }

    if (monthlyTasks.length > 0) {
        wins.push(`本月关键点完成 ${monthlyCompleted}/${monthlyTasks.length}。`);
        if (monthlyPending.length > 0) {
            losses.push(`仍有 ${monthlyPending.length} 个本月关键点未完成。`);
        }
    } else {
        blockers.push("本月关键点还没有建立成结构化执行清单。");
    }

    if (dailyTotal > 0) {
        wins.push(`本月日任务完成 ${dailyCompleted}/${dailyTotal}。`);
        if (dailyCompleted / dailyTotal < 0.5) {
            losses.push("日任务完成率偏低，说明执行节奏还不稳定。");
        }
    } else {
        blockers.push("本月没有形成足够的日任务沉淀，执行数据偏少。");
    }

    if (hunterTotal > 0) {
        wins.push(`Hunter 目标池当前共 ${hunterTotal} 个目标，其中活跃 ${hunterActive} 个，已提交 ${hunterSubmitted} 个，P0 ${hunterP0} 个。`);
    } else {
        blockers.push("Hunter 目标池尚未建库，无法判断赔率是否集中在正确标的上。");
    }

    if (hunterTotal < 5) {
        blockers.push("高潜 AI 目标数量仍然不足，距离“至少 5 个可重注目标”的要求有缺口。");
        nextSteps.push("补齐 Hunter 目标池到至少 5 个高潜目标，并把 2 个最强标的推进到 active。");
    }

    if (hunterActive < 2) {
        blockers.push("主攻目标还不够集中，当前 active 数量不足 2 个。");
        nextSteps.push("收缩目标池，明确 2 个主攻项目和 3 个跟进项目。");
    }

    if (monthlyPending.length > 0) {
        nextSteps.push(
            `优先收口这些未完成关键点：${monthlyPending
                .slice(0, 3)
                .map((task) => task.text)
                .join("；")}。`,
        );
    }

    if ((incomeByType.get("SaaS") || 0) === 0) {
        nextSteps.push("继续推进 kol.tools 的转化入口验证，至少形成可追踪的注册、反馈或付费数据。");
    }

    if ((incomeByType.get("Hunter") || 0) === 0) {
        nextSteps.push("把 Hunter 主线推进到可提交或深度沟通阶段，优先追求高赔率命中而不是低危堆量。");
    }

    if (wins.length === 0) {
        wins.push("本月尚未形成足够明确的正反馈，说明策略还需要进一步收敛。");
    }

    if (losses.length === 0) {
        losses.push("本月没有明显的结构性失误记录，后续应继续把失败案例写进数据库，避免复发。");
    }

    if (blockers.length === 0) {
        blockers.push("当前没有显著阻塞项暴露，但仍需要持续用目标池和转化数据验证判断。");
    }

    if (nextSteps.length === 0) {
        nextSteps.push("延续本月有效动作，避免扩张，继续围绕唯一主线加码。");
    }

    return {
        wins: wins.map((item) => `- ${item}`).join("\n"),
        losses: losses.map((item) => `- ${item}`).join("\n"),
        blockers: blockers.map((item) => `- ${item}`).join("\n"),
        nextSteps: nextSteps.map((item) => `- ${item}`).join("\n"),
    };
}

export interface HunterTarget {
    id: string;
    name: string;
    platform: string;
    url: string;
    priority: string;
    status: string;
    bountyEstimate: number;
    thesis: string;
    oddsNote: string;
    lastAction: string;
    lastActionDate: string;
    nextStep: string;
    notes: string;
}

export interface HunterTargetInput {
    name: string;
    platform: string;
    url: string;
    priority: string;
    status: string;
    bountyEstimate: number;
    thesis: string;
    oddsNote: string;
    lastAction: string;
    lastActionDate: string;
    nextStep: string;
    notes: string;
}

function normalizeHunterTargetInput(input: HunterTargetInput): HunterTargetInput {
    return {
        name: input.name.trim(),
        platform: input.platform.trim(),
        url: input.url.trim(),
        priority: input.priority.trim() || "P1",
        status: input.status.trim() || "watch",
        bountyEstimate: Number.isFinite(Number(input.bountyEstimate)) ? Number(input.bountyEstimate) : 0,
        thesis: input.thesis.trim(),
        oddsNote: input.oddsNote.trim(),
        lastAction: input.lastAction.trim(),
        lastActionDate: normalizeDate(input.lastActionDate) || "",
        nextStep: input.nextStep.trim(),
        notes: input.notes.trim(),
    };
}

export async function getHunterTargets(): Promise<HunterTarget[]> {
    await ensureHunterTargetsTable();
    const db = await getDB();
    const result = await db
        .prepare(`
            SELECT
                id,
                name,
                platform,
                url,
                priority,
                status,
                bounty_estimate,
                thesis,
                odds_note,
                last_action,
                last_action_date,
                next_step,
                notes
            FROM hunter_targets
            ORDER BY
                CASE priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END ASC,
                CASE status WHEN 'active' THEN 0 WHEN 'submitted' THEN 1 WHEN 'follow_up' THEN 2 WHEN 'watch' THEN 3 ELSE 4 END ASC,
                CASE WHEN last_action_date = '' THEN 1 ELSE 0 END ASC,
                last_action_date DESC,
                created_at DESC
        `)
        .all<{
            id: number;
            name: string;
            platform: string;
            url: string;
            priority: string;
            status: string;
            bounty_estimate: number;
            thesis: string;
            odds_note: string;
            last_action: string;
            last_action_date: string;
            next_step: string;
            notes: string;
        }>();

    return result.results.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        platform: item.platform || "",
        url: item.url || "",
        priority: item.priority || "P1",
        status: item.status || "watch",
        bountyEstimate: Number(item.bounty_estimate || 0),
        thesis: item.thesis || "",
        oddsNote: item.odds_note || "",
        lastAction: item.last_action || "",
        lastActionDate: item.last_action_date || "",
        nextStep: item.next_step || "",
        notes: item.notes || "",
    }));
}

export async function addHunterTarget(input: HunterTargetInput): Promise<boolean> {
    await ensureHunterTargetsTable();
    const db = await getDB();
    const normalized = normalizeHunterTargetInput(input);
    if (!normalized.name) return false;

    await db
        .prepare(`
            INSERT INTO hunter_targets (
                name, platform, url, priority, status, bounty_estimate, thesis, odds_note, last_action, last_action_date, next_step, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
            normalized.name,
            normalized.platform,
            normalized.url,
            normalized.priority,
            normalized.status,
            normalized.bountyEstimate,
            normalized.thesis,
            normalized.oddsNote,
            normalized.lastAction,
            normalized.lastActionDate,
            normalized.nextStep,
            normalized.notes,
        )
        .run();
    return true;
}

export async function updateHunterTarget(id: string, input: HunterTargetInput): Promise<boolean> {
    await ensureHunterTargetsTable();
    const db = await getDB();
    const normalized = normalizeHunterTargetInput(input);
    if (!normalized.name) return false;

    await db
        .prepare(`
            UPDATE hunter_targets
            SET
                name = ?,
                platform = ?,
                url = ?,
                priority = ?,
                status = ?,
                bounty_estimate = ?,
                thesis = ?,
                odds_note = ?,
                last_action = ?,
                last_action_date = ?,
                next_step = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `)
        .bind(
            normalized.name,
            normalized.platform,
            normalized.url,
            normalized.priority,
            normalized.status,
            normalized.bountyEstimate,
            normalized.thesis,
            normalized.oddsNote,
            normalized.lastAction,
            normalized.lastActionDate,
            normalized.nextStep,
            normalized.notes,
            Number(id),
        )
        .run();
    return true;
}

export async function deleteHunterTarget(id: string): Promise<boolean> {
    await ensureHunterTargetsTable();
    const db = await getDB();
    await db.prepare("DELETE FROM hunter_targets WHERE id = ?").bind(Number(id)).run();
    return true;
}

// --- Daily Tasks ---

export interface DailyTaskItem {
    id: string;
    date: string;
    text: string;
    completed: boolean;
}

export async function getDailyTasks(date?: string): Promise<DailyTaskItem[]> {
    const db = await getDB();
    const targetDate = normalizeDate(date) || getCurrentDate();
    const result = await db
        .prepare("SELECT id, task_date, text, completed FROM daily_tasks WHERE task_date = ? ORDER BY created_at ASC")
        .bind(targetDate)
        .all<{ id: number; task_date: string; text: string; completed: number }>();

    return result.results.map((task) => ({
        id: task.id.toString(),
        date: task.task_date,
        text: task.text,
        completed: task.completed === 1,
    }));
}

export async function addDailyTask(text: string, date?: string): Promise<boolean> {
    const db = await getDB();
    const trimmed = text.trim();
    const targetDate = normalizeDate(date) || getCurrentDate();
    if (!trimmed) return false;
    const addedAt = getNowDateTimeInfo();
    const prefixedText = buildPrefixedText(trimmed, addedAt.date, addedAt.time);

    await db
        .prepare("INSERT INTO daily_tasks (task_date, task_datetime, text, completed) VALUES (?, ?, ?, 0)")
        .bind(targetDate, addedAt.datetime, prefixedText)
        .run();
    return true;
}

export async function toggleDailyTask(id: string, completed: boolean): Promise<boolean> {
    const db = await getDB();
    await db
        .prepare("UPDATE daily_tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(completed ? 1 : 0, Number(id))
        .run();
    return true;
}

export async function updateDailyTask(id: string, text: string): Promise<boolean> {
    const db = await getDB();
    const trimmed = text.trim();
    if (!trimmed) return false;

    await db
        .prepare("UPDATE daily_tasks SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(trimmed, Number(id))
        .run();
    return true;
}

export async function deleteDailyTask(id: string): Promise<boolean> {
    const db = await getDB();
    await db.prepare("DELETE FROM daily_tasks WHERE id = ?").bind(Number(id)).run();
    return true;
}

// --- Finance ---

export interface Transaction {
    id: number;
    date: string;
    type: string;
    project: string;
    amount: number;
    memo: string;
}

export interface Metric {
    label: string;
    monthly: number;
    yearToDate: number;
    yearlyTarget: number;
    progress: number;
    trend?: string;
}

async function getMonthlyIncomeByType(month: string, type?: IncomeType): Promise<number> {
    const db = await getDB();
    let query = "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE strftime('%Y-%m', date) = ?";
    const params: Array<string> = [month];
    if (type) {
        query += " AND type = ?";
        params.push(type);
    }

    const result = await db.prepare(query).bind(...params).first<{ total: number }>();
    return Number(result?.total || 0);
}

export async function getYearIncome(year: number, type?: IncomeType): Promise<number> {
    const db = await getDB();
    let query = "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE strftime('%Y', date) = ?";
    const params: Array<string> = [String(year)];
    if (type) {
        query += " AND type = ?";
        params.push(type);
    }

    const result = await db.prepare(query).bind(...params).first<{ total: number }>();
    return Number(result?.total || 0);
}

export async function getCoreMetrics(month?: string): Promise<Metric[]> {
    const targetMonth = normalizeYearMonth(month) || getCurrentYearMonth();
    const previousMonth = getPreviousYearMonth(targetMonth);
    const targetYear = Number(targetMonth.slice(0, 4));

    const [
        monthlyCashFlow,
        previousCashFlow,
        monthlySaaS,
        previousSaaS,
        monthlyHunter,
        previousHunter,
        monthlyMedia,
        previousMedia,
        ytdCashFlow,
        ytdSaaS,
        ytdHunter,
        ytdMedia,
    ] = await Promise.all([
        getMonthlyIncomeByType(targetMonth),
        getMonthlyIncomeByType(previousMonth),
        getMonthlyIncomeByType(targetMonth, "SaaS"),
        getMonthlyIncomeByType(previousMonth, "SaaS"),
        getMonthlyIncomeByType(targetMonth, "Hunter"),
        getMonthlyIncomeByType(previousMonth, "Hunter"),
        getMonthlyIncomeByType(targetMonth, "Media"),
        getMonthlyIncomeByType(previousMonth, "Media"),
        getYearIncome(targetYear),
        getYearIncome(targetYear, "SaaS"),
        getYearIncome(targetYear, "Hunter"),
        getYearIncome(targetYear, "Media"),
    ]);

    return [
        {
            label: "现金流",
            monthly: monthlyCashFlow,
            yearToDate: ytdCashFlow,
            yearlyTarget: YEAR_TARGETS.cashFlow,
            progress: getProgress(ytdCashFlow, YEAR_TARGETS.cashFlow),
            trend: getTrendText(monthlyCashFlow, previousCashFlow),
        },
        {
            label: "Hunter 收入",
            monthly: monthlyHunter,
            yearToDate: ytdHunter,
            yearlyTarget: YEAR_TARGETS.hunter,
            progress: getProgress(ytdHunter, YEAR_TARGETS.hunter),
            trend: getTrendText(monthlyHunter, previousHunter),
        },
        {
            label: "SaaS 收入",
            monthly: monthlySaaS,
            yearToDate: ytdSaaS,
            yearlyTarget: YEAR_TARGETS.saas,
            progress: getProgress(ytdSaaS, YEAR_TARGETS.saas),
            trend: getTrendText(monthlySaaS, previousSaaS),
        },
        {
            label: "自媒体收入",
            monthly: monthlyMedia,
            yearToDate: ytdMedia,
            yearlyTarget: YEAR_TARGETS.media,
            progress: getProgress(ytdMedia, YEAR_TARGETS.media),
            trend: getTrendText(monthlyMedia, previousMedia),
        },
    ];
}

export async function getTransactions(month?: string): Promise<Transaction[]> {
    const db = await getDB();
    let query = "SELECT * FROM transactions";
    const params: Array<string> = [];
    const normalizedMonth = normalizeYearMonth(month);

    if (normalizedMonth) {
        query += " WHERE strftime('%Y-%m', date) = ?";
        params.push(normalizedMonth);
    }

    query += " ORDER BY date DESC";
    const result = await db.prepare(query).bind(...params).all<Transaction>();
    return result.results;
}

export async function addTransaction(transaction: Omit<Transaction, "id">): Promise<boolean> {
    const db = await getDB();
    await db
        .prepare("INSERT INTO transactions (date, type, project, amount, memo) VALUES (?, ?, ?, ?, ?)")
        .bind(transaction.date, transaction.type, transaction.project, transaction.amount, transaction.memo)
        .run();
    return true;
}

export async function deleteTransaction(id: number): Promise<boolean> {
    const db = await getDB();
    await db.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
    return true;
}

export async function getTotalIncome(month?: string): Promise<number> {
    const db = await getDB();
    let query = "SELECT SUM(amount) as total FROM transactions";
    const params: Array<string> = [];
    const normalizedMonth = normalizeYearMonth(month);

    if (normalizedMonth) {
        query += " WHERE strftime('%Y-%m', date) = ?";
        params.push(normalizedMonth);
    }

    const result = await db.prepare(query).bind(...params).first<{ total: number }>();
    return Number(result?.total || 0);
}

export interface IncomeCompositionItem {
    type: IncomeType;
    amount: number;
    percentage: number;
}

export async function getIncomeComposition(month?: string): Promise<IncomeCompositionItem[]> {
    const targetMonth = normalizeYearMonth(month) || getCurrentYearMonth();
    const total = await getTotalIncome(targetMonth);
    const db = await getDB();

    const rows = await db
        .prepare("SELECT type, COALESCE(SUM(amount), 0) AS total FROM transactions WHERE strftime('%Y-%m', date) = ? GROUP BY type")
        .bind(targetMonth)
        .all<{ type: string; total: number }>();

    const byType = new Map<string, number>();
    rows.results.forEach((row) => byType.set(row.type, Number(row.total || 0)));

    return INCOME_TYPES.map((type) => {
        const amount = byType.get(type) || 0;
        return {
            type,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
        };
    });
}

// --- Monthly Milestones ---

export async function getMonthlyTasks(month?: string): Promise<TaskItem[]> {
    const db = await getDB();
    const parsed = parseYearMonth(month);

    if (!parsed) {
        const fallback = await db
            .prepare("SELECT id, text, completed FROM monthly_milestones ORDER BY year DESC, month DESC, created_at ASC")
            .all<{ id: number; text: string; completed: number }>();
        return fallback.results.map((r) => ({
            id: r.id.toString(),
            text: r.text,
            completed: r.completed === 1,
        }));
    }

    const result = await db
        .prepare("SELECT id, text, completed FROM monthly_milestones WHERE year = ? AND month = ? ORDER BY created_at ASC")
        .bind(parsed.year, parsed.month)
        .all<{ id: number; text: string; completed: number }>();

    return result.results.map((r) => ({
        id: r.id.toString(),
        text: r.text,
        completed: r.completed === 1,
    }));
}

export async function toggleMonthlyTask(taskId: string, completed: boolean): Promise<boolean> {
    const db = await getDB();
    await db
        .prepare("UPDATE monthly_milestones SET completed = ? WHERE id = ?")
        .bind(completed ? 1 : 0, Number(taskId))
        .run();
    return true;
}

export async function addMonthlyTask(taskText: string, month?: string): Promise<boolean> {
    const db = await getDB();
    const parsed = parseYearMonth(month || getCurrentYearMonth());
    if (!parsed) return false;
    const addedAt = getNowDateTimeInfo();
    const prefixedText = buildPrefixedText(taskText, addedAt.date, addedAt.time);

    await db
        .prepare("INSERT INTO monthly_milestones (year, month, text, completed, milestone_datetime) VALUES (?, ?, ?, 0, ?)")
        .bind(parsed.year, parsed.month, prefixedText, addedAt.datetime)
        .run();
    return true;
}

export async function deleteMonthlyTask(id: string): Promise<boolean> {
    const db = await getDB();
    await db.prepare("DELETE FROM monthly_milestones WHERE id = ?").bind(Number(id)).run();
    return true;
}

export async function getAvailableMonths(): Promise<string[]> {
    await ensureMonthlyReviewsTable();
    const db = await getDB();
    const result = await db
        .prepare(`
            SELECT month_key
            FROM (
                SELECT DISTINCT strftime('%Y-%m', date) AS month_key FROM transactions
                UNION
                SELECT DISTINCT printf('%04d-%02d', year, month) AS month_key FROM monthly_milestones
                UNION
                SELECT DISTINCT printf('%04d-%02d', year, month) AS month_key FROM monthly_reviews
            )
            WHERE month_key IS NOT NULL AND month_key != ''
            ORDER BY month_key DESC
        `)
        .all<{ month_key: string }>();

    const months = result.results.map((item) => item.month_key);
    const currentMonth = getCurrentYearMonth();
    if (!months.includes(currentMonth)) {
        months.push(currentMonth);
        months.sort((a, b) => b.localeCompare(a));
    }

    return months;
}

export interface MediaChannelStat {
    platform: string;
    current: string;
    target: string;
    progress: string;
}

export async function getMediaChannelStats(): Promise<MediaChannelStat[]> {
    const socialPath = resolveProjectPath("2026", "metrics", "social-stats.md");
    const content = await readFileSafe(socialPath);

    const rows: MediaChannelStat[] = [];
    const lineRegex = /^\|\s*\*\*(.+?)\*\*\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/;

    for (const rawLine of content.split("\n")) {
        const line = rawLine.trim();
        const matched = line.match(lineRegex);
        if (!matched) continue;
        rows.push({
            platform: matched[1].trim(),
            current: matched[2].trim(),
            target: matched[3].trim(),
            progress: matched[4].trim(),
        });
    }

    if (rows.length === 0) {
        return [
            { platform: "X", current: "-", target: "-", progress: "-" },
            { platform: "YouTube", current: "-", target: "-", progress: "-" },
            { platform: "小红书", current: "-", target: "-", progress: "-" },
            { platform: "Newsletter", current: "-", target: "-", progress: "-" },
        ];
    }

    return rows;
}

export interface SaaSProjectStat {
    priority: string;
    project: string;
    goal: string;
    status: string;
}

export async function getSaaSProjectStats(): Promise<SaaSProjectStat[]> {
    const readmePath = resolveProjectPath("2026", "README.md");
    const content = await readFileSafe(readmePath);

    const lines = content.split("\n");
    const rows: SaaSProjectStat[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("| **P")) continue;
        const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
        if (parts.length < 4) continue;
        const priority = parts[0].replaceAll("*", "");
        const project = parts[1].replaceAll("*", "").replaceAll("[", "").replaceAll("]", "").replace(/\(.+?\)/g, "").trim();
        const goal = parts[2];
        const status = parts[3];
        rows.push({ priority, project, goal, status });
    }

    return rows;
}

export interface HunterPipelineStat {
    activeTargets: number;
    submittedReports: number;
}

export async function getHunterPipelineStats(): Promise<HunterPipelineStat> {
    const hunterPath = resolveProjectPath("2026", "metrics", "hunter-log.md");
    const content = await readFileSafe(hunterPath);
    const lines = content.split("\n");

    let inActiveTargets = false;
    let inVulnRecords = false;
    let activeTargets = 0;
    let submittedReports = 0;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith("### 活跃目标")) {
            inActiveTargets = true;
            inVulnRecords = false;
            continue;
        }
        if (line.startsWith("## 漏洞记录")) {
            inActiveTargets = false;
            inVulnRecords = true;
            continue;
        }
        if (line.startsWith("## ") && !line.startsWith("## 漏洞记录")) {
            inActiveTargets = false;
            inVulnRecords = false;
        }

        if (inActiveTargets && line.startsWith("|")) {
            if (line.includes("平台") || line.includes("---")) continue;
            const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
            if (cells.length >= 4 && cells[0] && cells[1] && cells[0] !== "-" && cells[1] !== "-") {
                activeTargets += 1;
            }
        }

        if (inVulnRecords && line.startsWith("|")) {
            if (line.includes("日期") || line.includes("---")) continue;
            if (line.includes("📤") || line.includes("💬") || line.includes("✅") || line.includes("💰")) {
                submittedReports += 1;
            }
        }
    }

    return { activeTargets, submittedReports };
}

export function formatMoney(value: number): string {
    return formatCurrency(value);
}

export function getBeijingCurrentYearMonth(): string {
    return getCurrentYearMonth();
}

export function getBeijingCurrentDate(): string {
    return getCurrentDate();
}
