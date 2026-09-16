import { FileSearch, Wrench, Bug } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sweep, SweepChild } from "@/components/shared/motion";
import type { ProofEntry } from "@/lib/proof";

/**
 * The site's signature element (`design-system/MASTER.md` §2, client-
 * authorized 2026-09-14): a genuinely lit instrument surface, not another
 * bordered card. Reserved for real machine output — verified fixes here,
 * and at most a handful of other surfaces sitewide. Do not reach for this
 * as a general-purpose card; MASTER's card-elevation rule applies doubly to
 * `--panel`.
 */
export function Console({
  label,
  meta,
  entries,
  className,
}: {
  label: string;
  meta?: string;
  entries: ProofEntry[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel-lit overflow-hidden rounded-card border border-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted">
          <span
            aria-hidden
            className="size-[7px] shrink-0 rounded-full bg-accent-secondary shadow-[0_0_8px_var(--glow)]"
          />
          {label}
        </div>
        {meta && (
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-white/35">
            {meta}
          </div>
        )}
      </div>

      <Sweep as="div">
        {entries.map((entry, i) => (
          <ConsoleRow key={entry.id} index={i + 1} entry={entry} />
        ))}
      </Sweep>
    </div>
  );
}

function ConsoleRow({ index, entry }: { index: number; entry: ProofEntry }) {
  return (
    <SweepChild
      as="div"
      className="grid grid-cols-[2.5rem_1fr] gap-5 border-b border-white/[0.05] px-6 py-6 last:border-b-0 sm:px-8"
    >
      <span className="font-mono text-xs font-semibold text-accent-secondary/40">
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <p className="text-pretty text-base leading-relaxed text-foreground">
          {entry.symptom}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ConsoleField icon={FileSearch} label="Why it happened" value={entry.cause} />
          <ConsoleField icon={Wrench} label="What changed" value={entry.fix} />
          <ConsoleField icon={Bug} label="Verified against" value={entry.verifiedAgainst} />
        </div>
      </div>
    </SweepChild>
  );
}

function ConsoleField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground-muted/50">
        <Icon className="size-3" aria-hidden />
        {label}
      </div>
      <p className="text-pretty text-sm leading-relaxed text-foreground-muted">{value}</p>
    </div>
  );
}
