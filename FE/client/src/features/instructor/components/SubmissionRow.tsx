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
    <tr className="hover:bg-slate-800/40 transition-colors group border-b border-slate-900/50">
      <td className="py-4 px-6 text-center">
        <input
          className="rounded-sm bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500/30"
          type="checkbox"
        />
      </td>
      <td className="py-4 px-4 text-sm font-mono text-slate-400">{id}</td>
      <td className="py-4 px-4 text-sm font-semibold text-slate-100">{name}</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="material-symbols-outlined text-indigo-400 text-lg">
            description
          </span>
          <span className="truncate max-w-[150px]">{fileName}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm">
        <div className="flex flex-col">
          <span className="text-slate-400">{date}</span>
          {isLate && (
            <span className="text-[10px] text-red-400 font-bold uppercase">
              {isLate}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${plagiarism > 20 ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${plagiarism}%` }}
            ></div>
          </div>
          <span
            className={`text-xs font-bold ${plagiarism > 20 ? "text-red-400" : "text-emerald-400"}`}
          >
            {plagiarism}%
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        {status === "Analyzing" && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>{" "}
            Analyzing
          </div>
        )}
        {status === "Done" && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-xs">
              check_circle
            </span>{" "}
            Done
          </div>
        )}
        {status === "Not Run" && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Not Run
          </div>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy || disableActions || !onApprove}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-bold disabled:opacity-40"
          >
            Duyệt
          </button>
          <button
            type="button"
            onClick={onRevision}
            disabled={busy || disableActions || !onRevision}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-bold disabled:opacity-40"
          >
            Sửa lại
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy || disableActions || !onReject}
            className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 text-[10px] font-bold disabled:opacity-40"
          >
            Từ chối
          </button>
        </div>
      </td>
    </tr>
  );
};
