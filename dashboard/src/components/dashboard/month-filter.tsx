"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface MonthFilterProps {
    months: string[];
    currentMonth: string;
}

export function MonthFilter({ months, currentMonth }: MonthFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", value);
        router.push(`${pathname}?${params.toString()}`);
    };

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
