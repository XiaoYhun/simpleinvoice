import type { Metadata } from "next";
import { Suspense } from "react";
import { ReceiptText } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in · SimpleInvoice",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-7 place-items-center rounded-md bg-brand text-brand-foreground">
              <ReceiptText className="size-4" aria-hidden />
            </span>
            SimpleInvoice
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Use your 101 Digital sandbox credentials.</p>

          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
