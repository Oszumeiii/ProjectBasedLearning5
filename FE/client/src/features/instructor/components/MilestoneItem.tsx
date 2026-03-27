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
    <div
      className={`relative pl-16 ${isClosed ? "opacity-60 grayscale-[0.5]" : ""}`}
    >
      {/* Connector Marker */}
      <div
        className={`absolute left-4 top-2 w-4 h-4 rounded-full border-4 border-[#0b1326] z-10 
        ${
          status === "active"
            ? "bg-[#adc6ff] ring-4 ring-indigo-500/20"
            : status === "upcoming"
              ? "bg-[#31394d]"
              : "bg-[#93000a]"
        }`}
      />

      <div
        className={`rounded-xl p-8 transition-all border-l-4 shadow-lg 
        ${
          isInternal
            ? "bg-[#222a3d] border-[#adc6ff] hover:bg-[#2d3449]"
            : "bg-[#131b2e] border-transparent hover:bg-[#222a3d]"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3
              ${isInternal ? "bg-indigo-500/10 text-[#adc6ff]" : "bg-slate-800 text-slate-400"}`}
            >
              {isInternal && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#adc6ff] animate-pulse"></span>
              )}
              {status.replace("_", " ")}
            </span>
            <h3
              className={`text-2xl font-bold font-manrope mb-1 ${isClosed ? "text-slate-400" : "text-[#dae2fd]"}`}
            >
              {title}
            </h3>
            <p className="text-slate-400 text-sm max-w-md">{description}</p>
          </div>

          {deadlineCountdown && (
            <div className="text-right">
              <p className="text-[10px] text-indigo-400 font-bold uppercase">
                Deadline In
              </p>
              <p className="text-2xl font-black font-manrope text-[#adc6ff] tabular-nums">
                {deadlineCountdown}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-sm">
              calendar_month
            </span>
            <span className="text-xs font-medium">{dateRange}</span>
          </div>
          {stats && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-sm">groups</span>
              <span className="text-xs font-medium">{stats}</span>
            </div>
          )}
          <div className="ml-auto">
            <button className="text-[#dae2fd] hover:text-[#adc6ff] transition-colors text-xs font-bold flex items-center gap-1">
              {isInternal ? "View Queue" : "Edit Requirements"}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
