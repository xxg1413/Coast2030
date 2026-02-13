import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyFocus } from "@/lib/api";

export function WeeklyFocusCard({ focus }: { focus: WeeklyFocus }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    📅 {focus.title || "Weekly Focus"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="prose dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: focus.htmlContent }}
                />
            </CardContent>
        </Card>
    );
}
