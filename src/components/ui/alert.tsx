import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "error";

const tones: Record<Tone, { className: string; Icon: typeof Info }> = {
  info: { className: "border-border bg-surface-muted text-foreground", Icon: Info },
  success: { className: "border-success/40 bg-success-surface text-success", Icon: CheckCircle2 },
  error: { className: "border-danger/40 bg-danger-surface text-danger", Icon: AlertCircle },
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { className: toneClass, Icon } = tones[tone];
  return (
    <div className={cn("flex gap-2.5 rounded-lg border px-4 py-3 text-sm", toneClass, className)} role="status">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5")}>{children}</div> : null}
      </div>
    </div>
  );
}
