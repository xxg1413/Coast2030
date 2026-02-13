"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WeeklyFocusEditorProps {
    title: string;
    initialContent: string; // HTML content for display
    rawContent?: string; // We might need a way to get raw md, but for now we'll edit logic later or just let user rewrite
}

export function WeeklyFocusEditor({ title, htmlContent }: { title: string, htmlContent: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const router = useRouter();

    // Simple extraction of text from list items for editing initial state
    // Ideally we pass raw markdown, but we only have HTML here. 
    // For V1, we start with empty or try to convert back? 
    // Let's just default to a template or empty for now to avoid complexity of reverse-markdown.
    // Actually, let's just let them write the list items.

    const defaultTemplate = `- [ ] **Task 1**: \n- [ ] **Task 2**: `;

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/focus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                setOpen(false);
                router.refresh(); // Refresh server components
            } else {
                alert("Failed to save");
            }
        } catch (e) {
            alert("Error saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full relative group">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    📅 {title || "Weekly Focus"}
                </CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Edit Weekly Focus</DialogTitle>
                            <DialogDescription>
                                Update your weekly tasks. Use Markdown syntax.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Textarea
                                id="content"
                                className="h-[200px] font-mono"
                                placeholder={defaultTemplate}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div
                    className="prose dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </CardContent>
        </Card>
    );
}
