import React from "react";

interface SubmissionProps {
  id: string;
  name: string;
  fileName: string;
  date: string;
  plagiarism: number;
  status: "Analyzing" | "Done" | "Not Run";
  isLate?: string;
  onApprove?: () => void;
  onRevision?: () => void;
  onReject?: () => void;
  busy?: boolean;
  disableActions?: boolean;
}

export const SubmissionRow: React.FC<SubmissionProps> = ({
  id,
  name,
  fileName,
  date,
  plagiarism,
  status,
  isLate,
  onApprove,
  onRevision,
  onReject,
  busy,
  disableActions,
}) => {
  return (
    <tr className="group border-b border-app-line transition-colors hover:bg-app-inset/80">
      <td className="px-6 py-4 text-center">
        <input
          className="rounded-sm border-app-line text-brand focus:ring-brand/25"
          type="checkbox"
        />
      </td>
      <td className="px-4 py-4 font-mono text-sm text-ink-muted">{id}</td>
      <td className="px-4 py-4 text-sm font-semibold text-ink-heading">{name}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="material-symbols-outlined text-lg text-mint">description</span>
          <span className="max-w-[150px] truncate">{fileName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-sm">
        <div className="flex flex-col">
          <span className="text-ink-muted">{date}</span>
          {isLate && <span className="text-[10px] font-bold uppercase text-red-600">{isLate}</span>}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-app-track">
            <div
              className={`h-full ${plagiarism > 20 ? "bg-red-500" : "bg-mint"}`}
              style={{ width: `${plagiarism}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${plagiarism > 20 ? "text-red-600" : "text-mint"}`}>
            {plagiarism}%
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        {status === "Analyzing" && (
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" /> Analyzing
          </div>
        )}
        {status === "Done" && (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            <span className="material-symbols-outlined text-xs">check_circle</span> Done
          </div>
        )}
        {status === "Not Run" && (
          <div className="inline-flex items-center gap-2 rounded-full bg-app-inset px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Not Run
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy || disableActions || !onApprove}
            className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-900 disabled:opacity-40"
          >
            Duyệt
          </button>
          <button
            type="button"
            onClick={onRevision}
            disabled={busy || disableActions || !onRevision}
            className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900 disabled:opacity-40"
          >
            Sửa lại
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy || disableActions || !onReject}
            className="rounded-lg bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-800 disabled:opacity-40"
          >
            Từ chối
          </button>
        </div>
      </td>
    </tr>
  );
};
