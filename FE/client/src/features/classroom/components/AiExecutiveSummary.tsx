// src/features/feedback/components/AiExecutiveSummary.tsx
import { Sparkles } from "lucide-react";

export const AiExecutiveSummary = ({ summary }: { summary: string }) => (
  <div className="bg-[#171f33] rounded-2xl p-8 border border-slate-800/50">
    <div className="flex items-center gap-3 mb-6">
      <Sparkles className="text-[#adc6ff]" size={22} />
      <h3 className="font-bold text-xl text-[#dae2fd]">AI Executive Summary</h3>
    </div>
    <div className="text-[#c6c6cd] leading-relaxed space-y-4">
      <p>{summary}</p>
    </div>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800/30">
        <div className="text-[10px] text-[#798098] uppercase font-bold mb-1">
          Tone Analysis
        </div>
        <div className="font-bold text-[#4fdbc8]">Academic / Objective</div>
      </div>
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800/30">
        <div className="text-[10px] text-[#798098] uppercase font-bold mb-1">
          Argument Strength
        </div>
        <div className="font-bold text-[#adc6ff]">Strong (74%)</div>
      </div>
      <div className="bg-[#131b2e] p-4 rounded-xl border border-slate-800/30">
        <div className="text-[10px] text-[#798098] uppercase font-bold mb-1">
          Reading Ease
        </div>
        <div className="font-bold text-[#dae2fd]">Post-Graduate</div>
      </div>
    </div>
  </div>
);
