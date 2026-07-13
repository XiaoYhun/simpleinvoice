import { cn } from "@/lib/cn";

const palette: Record<string, string> = {
  PAID: "bg-success-surface text-success border-success/30",
  SUBMITTED: "bg-brand/10 text-brand border-brand/30",
  DRAFT: "bg-surface-muted text-muted border-border",
  OVERDUE: "bg-danger-surface text-danger border-danger/30",
  VOID: "bg-surface-muted text-muted border-border line-through",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase() ?? "UNKNOWN";
  const style = palette[key] ?? "bg-surface-muted text-muted border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
      )}
    >
      {key.toLowerCase()}
    </span>
  );
}
