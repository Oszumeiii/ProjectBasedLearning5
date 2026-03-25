// src/features/classroom/components/InstructionCard.tsx
import { FileText, Download } from "lucide-react";

export const InstructionCard = ({ description }: { description: string }) => (
  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800/50">
    <h3 className="text-[#dae2fd] font-bold text-lg mb-4">Hướng dẫn bài tập</h3>
    <p className="text-[#c6c6cd] text-sm leading-relaxed whitespace-pre-line">
      {description}
    </p>

    <div className="mt-6 pt-6 border-t border-slate-800/50">
      <h4 className="text-[#adc6ff] text-xs font-bold uppercase tracking-wider mb-3">
        Tài liệu đính kèm
      </h4>
      <div className="flex items-center gap-3 p-3 bg-[#1c253d] rounded-lg border border-slate-700/50 w-fit">
        <FileText size={18} className="text-[#adc6ff]" />
        <span className="text-sm text-[#dae2fd]">de-bai-pbl5.pdf</span>
        <button className="ml-4 text-slate-400 hover:text-white">
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
);
