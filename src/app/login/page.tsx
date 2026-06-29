"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Plane } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { resolveErrorCode } from "@/lib/error-codes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AlertBanner } from "@/components/ui/alert-banner";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("linh.tran@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok && result.code !== undefined) {
      const entry = resolveErrorCode(result.code);
      setError({ code: result.code, message: entry.message });
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-aviation-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-aviation-900 text-white">
              <Plane className="h-4.5 w-4.5 -rotate-45" />
            </span>
            Skyline Air
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <AlertBanner tone="error" title="Sign-in failed" description={error.message} code={error.code} />
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Try any 4+ character password"
              required
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>

          <p className="text-center text-xs text-slate-400">
            Demo accounts: <span className="font-mono-data">linh.tran@example.com</span> (customer) ·{" "}
            <span className="font-mono-data">admin@skylineair.com</span> (admin)
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Skyline Air?{" "}
          <Link href="/register" className="font-semibold text-aviation-900 hover:text-sky-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}