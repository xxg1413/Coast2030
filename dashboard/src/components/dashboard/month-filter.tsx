"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function MonthFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get("month") || new Date().toISOString().slice(0, 7); // Default YYYY-MM

    const handleValueChange = (value: string) => {
        // Replace URL param
        router.push(`/?month=${value}`);
    };

    // Generate last 12 months + next 12 months list? Or just 2026.
    // For V0.3 let's stick to 2026 Focus.
    const months = [
        "2026-01", "2026-02", "2026-03", "2026-04",
        "2026-05", "2026-06", "2026-07", "2026-08",
        "2026-09", "2026-10", "2026-11", "2026-12"
    ];

    return (
        <Select value={currentMonth} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="选择月份" />
            </SelectTrigger>
            <SelectContent>
                {months.map((m) => (
                    <SelectItem key={m} value={m}>
                        {m}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
