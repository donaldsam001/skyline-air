"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User as UserIcon, Phone, Plane, Check, X } from "lucide-react";
import { resolveErrorCode } from "@/lib/error-codes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AlertBanner } from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/client"; // Imported the core api client
import { ApiError } from "@/types";

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { test: (v: string) => /[!@#$%^&*]/.test(v), label: "One symbol (!@#$%^&*)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<{ code: number; message: string } | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(form.password));

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!passwordValid) {
      const entry = resolveErrorCode(1045);
      setApiError({ code: 1045, message: entry.message });
      return;
    }

    setLoading(true);
    
    console.log("Submitting registration form:", form); // Debugging log

    try {
      // 2. Call backend register API
      await api.users.register({
        email: form.email,
        passwordHash: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1400);
    } catch (error: any) {
      // 3. Robust Error Handling
      if (error instanceof ApiError) {
        // Try parsing error code dynamically if your ApiError returns it, otherwise fall back
        const errorCode = error.code || 1000; 
        const entry = resolveErrorCode(errorCode);
        setApiError({ 
          code: errorCode, 
          message: entry?.message || error.message || "Registration failed. Please try again." 
        });
      } else {
        setApiError({ 
          code: 500, 
          message: error.message || "An unexpected error occurred." 
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold text-aviation-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-aviation-900 text-white">
              <Plane className="h-4.5 w-4.5 -rotate-45" />
            </span>
            Skyline Air
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Book faster and manage every trip in one place.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {apiError && (
            <AlertBanner tone="error" title="Registration failed" description={apiError.message} code={apiError.code} />
          )}
          {success && (
            <AlertBanner tone="success" title="Account created" description="Redirecting you to sign in…" />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              icon={<Phone className="h-4 w-4" />}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+84 90 123 4567"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {PASSWORD_RULES.map((rule) => {
                const met = rule.test(form.password);
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      met ? "text-emerald-600" : "text-slate-400"
                    )}
                  >
                    {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-aviation-900 hover:text-sky-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}