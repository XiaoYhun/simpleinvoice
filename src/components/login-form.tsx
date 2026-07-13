"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";
import { loginSchema, type LoginValues } from "@/lib/invoices/schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setServerError(data.message ?? "Sign in failed. Please try again.");
      return;
    }

    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <Field label="Username" htmlFor="username" required error={errors.username?.message}>
        <input
          id="username"
          autoComplete="username"
          className={controlClass}
          placeholder="94756921275"
          {...register("username")}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={controlClass}
          placeholder="••••••••"
          {...register("password")}
        />
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <LogIn className="size-4" aria-hidden />
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
