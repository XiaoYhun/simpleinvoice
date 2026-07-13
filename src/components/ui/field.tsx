import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export const controlClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted/60 focus:border-brand focus-visible:outline-2 focus-visible:outline-offset-1 " +
  "focus-visible:outline-ring disabled:opacity-60";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
