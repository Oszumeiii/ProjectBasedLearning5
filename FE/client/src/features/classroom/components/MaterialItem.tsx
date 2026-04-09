// src/features/classroom/components/MaterialItem.tsx
import { FileText, Download, Eye } from "lucide-react";

interface MaterialProps {
  title: string;
  date: string;
  type: string;
}

export const MaterialItem = ({ title, date, type }: MaterialProps) => (
  <div className="group flex items-center justify-between p-4 bg-[#171f33] rounded-xl border border-slate-800/50 hover:border-[#adc6ff]/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#222a3d] flex items-center justify-center text-[#adc6ff]">
        <FileText size={20} />
      </div>
      <div>
        <h4 className="text-[#dae2fd] font-bold text-sm group-hover:text-[#adc6ff] transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-[#798098]">
          {date} • {type}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <button className="p-2 text-slate-400 hover:text-[#4fdbc8] transition-colors">
        <Eye size={18} />
      </button>
      <button className="p-2 text-slate-400 hover:text-[#adc6ff] transition-colors">
        <Download size={18} />
      </button>
    </div>
  </div>
);
