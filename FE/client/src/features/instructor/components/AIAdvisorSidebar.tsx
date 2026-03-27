import React from "react";

export const AIAdvisorSidebar: React.FC = () => {
  return (
    <aside className="w-[420px] bg-[#0b1326] flex flex-col border-l border-slate-800/50 h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 bg-[#131b2e]/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div>
          <h3 className="font-manrope font-bold text-[#dae2fd]">
            AI Research Advisor
          </h3>
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">
            Analysis Engine Active
          </span>
        </div>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* 1. Executive Summary */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-indigo-400 text-sm">
              description
            </span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Executive Summary
            </h4>
          </div>
          <div className="bg-[#171f33] rounded-xl p-4 text-sm text-slate-300 leading-relaxed border border-slate-800">
            <p>
              The report focuses on{" "}
              <span className="text-white font-medium">
                Sub-Atomic Synthesis Paradigms
              </span>
              . Results indicate a{" "}
              <span className="text-emerald-400 font-bold">
                12% efficiency gain
              </span>
              . However, the connection to the Kuramoto model remains
              speculative.
            </p>
          </div>
        </section>

        {/* 2. Defense Questions (Interactive) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-indigo-400 text-sm">
              quiz
            </span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Defense Questions
            </h4>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How does your recursive loop address entropy leakage?",
                a: "Focus on 'self-sustaining resonance' and Brownian motion.",
              },
              {
                q: "Is the 12% gain statistically significant?",
                a: "Check for p-value calculations in hidden data.",
              },
            ].map((item, idx) => (
              <div key={idx} className="group cursor-help">
                <p className="text-sm font-semibold text-slate-200 mb-2 leading-snug">
                  {idx + 1}. {item.q}
                </p>
                <div className="hidden group-hover:block bg-[#131b2e] p-3 rounded-lg border-l-2 border-indigo-500 text-[11px] text-slate-400 animate-in slide-in-from-top-1">
                  <span className="font-bold text-indigo-400 uppercase text-[9px] block mb-1">
                    Suggested Answer:
                  </span>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Deficiency Analysis */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-indigo-400 text-sm">
              security_update_warning
            </span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Integrity & Structure
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] mb-2 font-bold">
                <span className="text-slate-500 uppercase">
                  Integrity Marker
                </span>
                <span className="text-emerald-400">4% Matches (Low)</span>
              </div>
              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: "4%" }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#171f33]/50 border border-slate-800">
                <span className="material-symbols-outlined text-emerald-400 text-lg">
                  check_circle
                </span>
                <span className="text-xs text-slate-400">
                  Bibliography formatted (APA 7)
                </span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#171f33]/50 border border-slate-800">
                <span className="material-symbols-outlined text-red-400 text-lg">
                  cancel
                </span>
                <span className="text-xs text-slate-200">
                  Missing detailed Conclusion
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Action Box */}
      <section className="p-6 bg-[#131b2e] border-t border-slate-800">
        <div className="flex gap-4 mb-4">
          <div className="w-20">
            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
              Grade
            </label>
            <input
              className="w-full bg-[#0b1326] border border-slate-700 rounded-lg text-lg font-bold text-center text-indigo-400 focus:ring-1 focus:ring-indigo-500 py-2 outline-none"
              placeholder="--"
              type="text"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
              Internal Feedback
            </label>
            <textarea
              className="w-full bg-[#0b1326] border border-slate-700 rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 py-2 px-3 resize-none h-[46px]"
              placeholder="Add notes..."
            />
          </div>
        </div>
        <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-950/40">
          <span className="material-symbols-outlined text-sm">send</span>
          Notify Student & Post Grade
        </button>
      </section>
    </aside>
  );
};
