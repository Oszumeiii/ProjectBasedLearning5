import React from "react";

export const CreateMilestoneForm: React.FC = () => {
  return (
    <div className="bg-[#2d3449]/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
      <h3 className="text-xl font-bold font-manrope mb-6 flex items-center gap-2 text-[#dae2fd]">
        <span className="material-symbols-outlined text-[#adc6ff]">
          post_add
        </span>
        New Milestone
      </h3>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Milestone Title
          </label>
          <input
            className="w-full bg-[#171f33] border-none rounded-lg focus:ring-2 focus:ring-[#adc6ff] text-[#dae2fd] placeholder:text-slate-600 text-sm py-3"
            placeholder="e.g. Final Thesis Submission"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Requirements
          </label>
          <textarea
            className="w-full bg-[#171f33] border-none rounded-lg focus:ring-2 focus:ring-[#adc6ff] text-[#dae2fd] placeholder:text-slate-600 text-sm resize-none"
            placeholder="Define expected outputs..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Start
            </label>
            <input
              type="date"
              className="w-full bg-[#171f33] border-none rounded-lg text-xs text-[#dae2fd] py-3"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              End
            </label>
            <input
              type="date"
              className="w-full bg-[#171f33] border-none rounded-lg text-xs text-[#dae2fd] py-3"
            />
          </div>
        </div>
        <button className="w-full bg-[#adc6ff] text-[#002e6a] font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-[0.98] transition-all mt-2">
          Publish to Timeline
        </button>
      </form>
    </div>
  );
};
