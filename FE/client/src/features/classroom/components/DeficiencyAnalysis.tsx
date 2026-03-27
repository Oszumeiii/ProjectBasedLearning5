// src/features/feedback/components/DeficiencyAnalysis.tsx
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export const DeficiencyAnalysis = ({
  plagiarismScore,
}: {
  plagiarismScore: number;
}) => (
  <div className="bg-[#171f33] rounded-2xl p-8 border border-slate-800/50">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-400" size={22} />
        <h3 className="font-bold text-xl text-[#dae2fd]">
          Deficiency Analysis
        </h3>
      </div>
      <span className="text-[10px] font-bold text-[#c6c6cd] px-3 py-1 bg-[#222a3d] rounded-full border border-slate-700/50">
        3 CRITICAL ISSUES
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {[
          {
            icon: AlertTriangle,
            color: "text-red-400",
            title: "Missing bibliography entries",
            desc: "4 citations in the text are not present in the reference list.",
            bg: "bg-red-500/5 border-red-500/20",
          },
          {
            icon: Info,
            color: "text-[#c6c6cd]",
            title: "Chapter 4 too short",
            desc: "Evaluation section is 40% below the recommended length.",
            bg: "bg-slate-800/40",
          },
          {
            icon: CheckCircle2,
            color: "text-[#c6c6cd]",
            title: "APA Formatting errors",
            desc: "Inconsistent header styling throughout pages 12-18.",
            bg: "bg-slate-800/40",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-4 p-4 rounded-xl border ${item.bg}`}
          >
            <item.icon className={item.color} size={18} />
            <div>
              <div className="font-bold text-sm text-[#dae2fd]">
                {item.title}
              </div>
              <p className="text-xs text-[#798098] mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center bg-[#131b2e] rounded-2xl p-8 border border-slate-800/30">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="364.4"
              strokeDashoffset={364.4 - (364.4 * plagiarismScore) / 100}
              className="text-[#4fdbc8]"
            />
          </svg>
          <span className="text-2xl font-black text-[#dae2fd]">
            {plagiarismScore}%
          </span>
        </div>
        <div className="text-center mt-4">
          <div className="font-bold text-sm">Plagiarism Gauge</div>
          <p className="text-[10px] text-[#4fdbc8] font-bold mt-1 tracking-widest uppercase">
            SAFE: LOW OVERLAP
          </p>
        </div>
      </div>
    </div>
  </div>
);
