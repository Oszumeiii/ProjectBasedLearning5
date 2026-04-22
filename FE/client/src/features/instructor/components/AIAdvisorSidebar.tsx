import React from "react";

export const AIAdvisorSidebar: React.FC = () => {
  return (
    <aside className="flex h-full w-[420px] flex-col overflow-hidden border-l border-app-line bg-app-card">
      <div className="flex items-center gap-3 border-b border-app-line bg-app-elevated p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand shadow-whisper">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div>
          <h3 className="font-bold text-ink-heading">AI Research Advisor</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-mint">
            Analysis Engine Active
          </span>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-mint">description</span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Executive Summary
            </h4>
          </div>
          <div className="rounded-xl border border-app-line bg-app-inset p-4 text-sm leading-relaxed text-ink-body">
            <p>
              The report focuses on{" "}
              <span className="font-medium text-ink-heading">Sub-Atomic Synthesis Paradigms</span>.
              Results indicate a{" "}
              <span className="font-bold text-mint">12% efficiency gain</span>. However, the connection
              to the Kuramoto model remains speculative.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-mint">quiz</span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
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
                <p className="mb-2 text-sm font-semibold leading-snug text-ink-heading">
                  {idx + 1}. {item.q}
                </p>
                <div className="hidden animate-in slide-in-from-top-1 rounded-lg border border-app-line border-l-4 border-l-brand bg-app-elevated p-3 text-[11px] text-ink-muted group-hover:block">
                  <span className="mb-1 block text-[9px] font-bold uppercase text-brand">
                    Suggested Answer:
                  </span>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-mint">security_update_warning</span>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Integrity & Structure
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-[10px] font-bold">
                <span className="uppercase text-ink-faint">Integrity Marker</span>
                <span className="text-mint">4% Matches (Low)</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-app-track">
                <div className="h-full bg-mint" style={{ width: "4%" }} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 rounded-lg border border-app-line bg-app-inset p-2.5">
                <span className="material-symbols-outlined text-lg text-mint">check_circle</span>
                <span className="text-xs text-ink-muted">Bibliography formatted (APA 7)</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-app-line bg-app-inset p-2.5">
                <span className="material-symbols-outlined text-lg text-red-500">cancel</span>
                <span className="text-xs text-ink-body">Missing detailed Conclusion</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-t border-app-line bg-app-elevated p-6">
        <div className="mb-4 flex gap-4">
          <div className="w-20">
            <label className="mb-1 block text-[9px] font-bold uppercase text-ink-faint">Grade</label>
            <input
              className="w-full rounded-lg border border-app-line bg-app-card py-2 text-center text-lg font-bold text-ink-heading outline-none focus:ring-2 focus:ring-brand/25"
              placeholder="--"
              type="text"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[9px] font-bold uppercase text-ink-faint">
              Internal Feedback
            </label>
            <textarea
              className="h-[46px] w-full resize-none rounded-lg border border-app-line bg-app-card px-3 py-2 text-sm text-ink-body outline-none focus:ring-2 focus:ring-brand/25"
              placeholder="Add notes..."
            />
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-whisper transition-all hover:bg-brand-hover active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          Notify Student & Post Grade
        </button>
      </section>
    </aside>
  );
};
