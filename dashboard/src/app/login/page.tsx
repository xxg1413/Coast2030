"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.refresh();
                router.push("/");
            } else {
                setError("用户名或密码错误");
            }
        } catch {
            setError("登录失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4">
            <Card className="w-full max-w-sm border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-[var(--shadow-card)]">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/coast-logo.svg"
                            alt="Coast2030 Logo"
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)]"
                        />
                    </div>
                    <CardTitle className="text-2xl text-center font-bold text-[var(--color-ink)]">
                        Coast2030
                    </CardTitle>
                    <CardDescription className="text-center text-[var(--color-muted)]">
                        请输入管理员密码。登录后，这台浏览器 14 天内不用再输入。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login-username" className="text-[var(--color-ink-2)]">
                                用户名
                            </Label>
                            <Input
                                id="login-username"
                                type="text"
                                autoComplete="username"
                                placeholder="管理员用户名"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-ink)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-[var(--color-ink-2)]">
                                密码
                            </Label>
                            <Input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-ink)]"
                            />
                        </div>
                        {error && (
                            <p className="text-[var(--color-danger)] text-sm text-center">{error}</p>
                        )}
                        <Button type="submit" className="w-full h-11 font-extrabold" disabled={loading}>
                            {loading ? "登录中…" : "登录"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
