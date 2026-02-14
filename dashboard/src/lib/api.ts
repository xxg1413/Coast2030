import { getDB } from "./db";
import { remark } from "remark";
import html from "remark-html";
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

export interface WeeklyFocus {
    title: string;
    items: string[];
    htmlContent: string;
}

export async function getWeeklyFocus(): Promise<WeeklyFocus> {
    const db = await getDB();
    const result = await db
        .prepare("SELECT text, completed FROM weekly_focus ORDER BY created_at ASC")
        .all<{ text: string; completed: number }>();

    const items = result.results.map((r) => r.text);
    const listMarkdown = result.results
        .map((item) => `- [${item.completed === 1 ? "x" : " "}] ${item.text}`)
        .join("\n");
    const processedContent = await remark().use(html).process(listMarkdown);

    return {
        title: "本周焦点",
        items,
        htmlContent: processedContent.toString(),
    };
}

export async function saveWeeklyFocus(content: string): Promise<boolean> {
    const db = await getDB();
    const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const parsedTasks = lines
        .map((line) => {
            const markdownTaskMatch = line.match(/^-+\s*\[([ xX])\]\s*(.+)$/);
            if (markdownTaskMatch) {
                return {
                    text: markdownTaskMatch[2].trim(),
                    completed: markdownTaskMatch[1].toLowerCase() === "x",
                };
            }

            const bulletMatch = line.match(/^-+\s*(.+)$/);
            if (bulletMatch) {
                return {
                    text: bulletMatch[1].trim(),
                    completed: false,
                };
            }

            return {
                text: line,
                completed: false,
            };
        })
        .filter((task) => task.text.length > 0);

    await db.exec("DELETE FROM weekly_focus");

    for (const task of parsedTasks) {
        await db
            .prepare("INSERT INTO weekly_focus (text, completed) VALUES (?, ?)")
            .bind(task.text, task.completed ? 1 : 0)
            .run();
    }

    return true;
}

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
    const db = await getDB();
    const result = await db
        .prepare(`
            SELECT month_key
            FROM (
                SELECT DISTINCT strftime('%Y-%m', date) AS month_key FROM transactions
                UNION
                SELECT DISTINCT printf('%04d-%02d', year, month) AS month_key FROM monthly_milestones
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
