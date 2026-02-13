import { getDB } from './db';
import { remark } from 'remark';
import html from 'remark-html';

export interface WeeklyFocus {
    title: string;
    items: string[];
    htmlContent: string;
}

export async function getWeeklyFocus(): Promise<WeeklyFocus> {
    const db = await getDB();
    const result = await db.prepare('SELECT * FROM weekly_focus ORDER BY created_at ASC').all<{ text: string, completed: number }>();

    // Convert to markdown list for html processing (legacy support if needed, or just render list)
    // For now, let's just use the items directly.
    const items = result.results.map(r => r.text);
    const listMarkdown = items.map(i => `- [ ] ${i}`).join('\n');
    const processedContent = await remark().use(html).process(listMarkdown);

    return {
        title: '本周焦点',
        items,
        htmlContent: processedContent.toString(),
    };
}

export interface Metric {
    label: string;
    value: string;
    trend?: string;
}

export function getCoreMetrics(): Metric[] {
    // Simplified mock reader for now. Use ledgers/DB in future.
    return [
        { label: 'Cash Flow', value: '¥2,500 / 300万', trend: '+0.1%' },
        { label: 'SaaS MRR', value: '¥0 / 175万', trend: '0%' },
        { label: 'Hunter', value: '¥2,500 / 100万', trend: 'Start' },
    ];
}

// Deprecated: saveWeeklyFocus (was for full file replace)

export interface TaskItem {
    id: string; // Using text as ID for now to minimize frontend changes, but DB has ID
    text: string;
    completed: boolean;
}

export async function getStructuredWeeklyFocus(): Promise<{ title: string; tasks: TaskItem[] }> {
    const db = await getDB();
    const result = await db.prepare('SELECT id, text, completed FROM weekly_focus ORDER BY created_at ASC').all<{ id: number, text: string, completed: number }>();

    const tasks = result.results.map(r => ({
        id: r.id.toString(),
        text: r.text,
        completed: r.completed === 1
    }));

    return { title: '本周焦点', tasks };
}

export async function toggleTask(taskText: string, completed: boolean): Promise<boolean> {
    // Note: Frontend passes text, but we should use ID if possible. 
    // Adapting to use text lookup for now to match legacy args, or we assume taskText is ID?
    // The previous implementation used text. Let's try to update by text for valid inputs.
    // Ideally frontend should pass ID.
    const db = await getDB();
    // Try to update by text if ID not provided
    await db.prepare('UPDATE weekly_focus SET completed = ? WHERE text = ?').bind(completed ? 1 : 0, taskText).run();
    return true;
}

export async function addTask(taskText: string): Promise<boolean> {
    const db = await getDB();
    await db.prepare('INSERT INTO weekly_focus (text, completed) VALUES (?, 0)').bind(taskText).run();
    return true;
}

// --- Finance Ledger ---

export interface Transaction {
    date: string;
    type: string;
    project: string;
    amount: number;
    memo: string;
}

export async function getTransactions(month?: string): Promise<Transaction[]> {
    const db = await getDB();
    let query = 'SELECT * FROM transactions';
    let params: any[] = [];

    if (month) {
        query += ' WHERE strftime(\'%Y-%m\', date) = ?';
        params.push(month);
    }

    query += ' ORDER BY date DESC';

    const result = await db.prepare(query).bind(...params).all<Transaction>();
    return result.results;
}

export async function addTransaction(transaction: Transaction): Promise<boolean> {
    const db = await getDB();
    await db.prepare(
        'INSERT INTO transactions (date, type, project, amount, memo) VALUES (?, ?, ?, ?, ?)'
    ).bind(
        transaction.date,
        transaction.type,
        transaction.project,
        transaction.amount,
        transaction.memo
    ).run();
    return true;
}

export async function getTotalIncome(month?: string): Promise<number> {
    const db = await getDB();
    let query = 'SELECT SUM(amount) as total FROM transactions';
    let params: any[] = [];

    if (month) {
        query += ' WHERE strftime(\'%Y-%m\', date) = ?';
        params.push(month);
    }

    const result = await db.prepare(query).bind(...params).first<{ total: number }>();
    return result?.total || 0;
}

// --- Monthly Tasks ---

export async function getMonthlyTasks(): Promise<TaskItem[]> {
    const db = await getDB();
    // Assuming current month for simplicity, or we can fetch all.
    // Let's fetch all for now or filter by '2026' '2' if we had args.
    // For V0.3 let's just show all in the table.
    const result = await db.prepare('SELECT id, text, completed FROM monthly_milestones ORDER BY created_at ASC').all<{ id: number, text: string, completed: number }>();

    return result.results.map(r => ({
        id: r.id.toString(),
        text: r.text,
        completed: r.completed === 1
    }));
}

export async function toggleMonthlyTask(taskText: string, completed: boolean): Promise<boolean> {
    const db = await getDB();
    await db.prepare('UPDATE monthly_milestones SET completed = ? WHERE text = ?').bind(completed ? 1 : 0, taskText).run();
    return true;
}

export async function addMonthlyTask(taskText: string): Promise<boolean> {
    const db = await getDB();
    const year = 2026; // Hardcoded for V0.3 context
    const month = 2;
    await db.prepare('INSERT INTO monthly_milestones (year, month, text, completed) VALUES (?, ?, ?, 0)').bind(year, month, taskText).run();
    return true;
}

export async function deleteMonthlyTask(id: string): Promise<boolean> {
    const db = await getDB();
    await db.prepare('DELETE FROM monthly_milestones WHERE id = ?').bind(id).run();
    return true;
}
