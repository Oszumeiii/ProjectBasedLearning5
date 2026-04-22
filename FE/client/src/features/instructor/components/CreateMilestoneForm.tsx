import React from "react";

export const CreateMilestoneForm: React.FC = () => {
  return (
    <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-ink-heading">
        <span className="material-symbols-outlined text-mint">post_add</span>
        New Milestone
      </h3>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Milestone Title</label>
          <input
            className="w-full rounded-lg border border-app-line bg-app-inset py-3 text-sm text-ink-heading placeholder:text-ink-faint focus:ring-2 focus:ring-brand/25"
            placeholder="e.g. Final Thesis Submission"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Requirements</label>
          <textarea
            className="w-full resize-none rounded-lg border border-app-line bg-app-inset py-3 text-sm text-ink-heading placeholder:text-ink-faint focus:ring-2 focus:ring-brand/25"
            placeholder="Define expected outputs..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Start</label>
            <input
              type="date"
              className="w-full rounded-lg border border-app-line bg-app-inset py-3 text-xs text-ink-heading"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">End</label>
            <input
              type="date"
              className="w-full rounded-lg border border-app-line bg-app-inset py-3 text-xs text-ink-heading"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-brand py-4 font-bold text-white shadow-whisper transition-all hover:bg-brand-hover active:scale-[0.98]"
        >
          Publish to Timeline
        </button>
      </form>
    </div>
  );
};
