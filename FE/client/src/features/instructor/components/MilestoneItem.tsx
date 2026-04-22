import React from "react";

interface MilestoneProps {
  status: "active" | "upcoming" | "closed";
  title: string;
  description: string;
  dateRange: string;
  stats?: string;
  deadlineCountdown?: string;
}

export const MilestoneItem: React.FC<MilestoneProps> = ({
  status,
  title,
  description,
  dateRange,
  stats,
  deadlineCountdown,
}) => {
  const isInternal = status === "active";
  const isClosed = status === "closed";

  return (
    <div className={`relative pl-16 ${isClosed ? "opacity-70 grayscale-[0.35]" : ""}`}>
      <div
        className={`absolute left-4 top-2 z-10 h-4 w-4 rounded-full border-4 border-app ${
          status === "active"
            ? "bg-brand ring-4 ring-brand/15"
            : status === "upcoming"
              ? "bg-app-track"
              : "bg-red-600"
        }`}
      />

      <div
        className={`rounded-xl border-l-4 p-8 shadow-whisper transition-all ${
          isInternal
            ? "border-brand bg-app-card hover:bg-app-elevated"
            : "border-transparent bg-app-card hover:bg-app-elevated"
        }`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                isInternal ? "bg-brand/10 text-brand" : "bg-app-inset text-ink-muted"
              }`}
            >
              {isInternal && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />}
              {status.replace("_", " ")}
            </span>
            <h3 className={`mb-1 text-2xl font-bold ${isClosed ? "text-ink-muted" : "text-ink-heading"}`}>
              {title}
            </h3>
            <p className="max-w-md text-sm text-ink-muted">{description}</p>
          </div>

          {deadlineCountdown && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-mint">Deadline In</p>
              <p className="tabular-nums text-2xl font-black text-brand">{deadlineCountdown}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-6 border-t border-app-line pt-6">
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span className="text-xs font-medium">{dateRange}</span>
          </div>
          {stats && (
            <div className="flex items-center gap-2 text-ink-muted">
              <span className="material-symbols-outlined text-sm">groups</span>
              <span className="text-xs font-medium">{stats}</span>
            </div>
          )}
          <div className="ml-auto">
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold text-ink-heading transition-colors hover:text-brand"
            >
              {isInternal ? "View Queue" : "Edit Requirements"}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
