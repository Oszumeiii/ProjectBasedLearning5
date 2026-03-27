// src/features/materials/components/MaterialCard.tsx
import { FileText, Download, Eye, MoreVertical } from "lucide-react";

interface MaterialCardProps {
  title: string;
  description: string;
  type: string;
  size: string;
  isFeatured?: boolean;
  tags?: string[];
}

export const MaterialCard = ({
  title,
  description,
  type,
  size,
  isFeatured,
  tags,
}: MaterialCardProps) => {
  if (isFeatured) {
    return (
      <div className="col-span-12 md:col-span-8 bg-[#131b2e] rounded-xl p-6 hover:bg-[#171f33] transition-colors group relative overflow-hidden border border-slate-800/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#adc6ff]/5 rounded-full blur-3xl group-hover:bg-[#adc6ff]/10 transition-all"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <FileText size={30} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#adc6ff] uppercase bg-[#adc6ff]/10 px-2 py-0.5 rounded">
                FEATURED
              </span>
              <h3 className="text-xl font-bold text-[#dae2fd] mt-1">{title}</h3>
            </div>
          </div>
          <span className="text-[#798098] text-xs font-mono">{size}</span>
        </div>
        <p className="text-[#c6c6cd] text-sm mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3">
          {tags?.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#001c18] text-[#4fdbc8] text-[11px] font-bold rounded-sm uppercase tracking-wider border border-[#009182]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 md:col-span-4 bg-[#131b2e] rounded-xl p-6 hover:bg-[#171f33] transition-colors border border-slate-800/50 flex flex-col">
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
        <FileText size={20} />
      </div>
      <h3 className="text-lg font-bold text-[#dae2fd] mb-2 leading-tight line-clamp-2">
        {title}
      </h3>
      <p className="text-[#c6c6cd] text-xs mb-4 line-clamp-2">{description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-[#798098] font-medium uppercase">
          {type} • {size}
        </span>
        <button className="text-[#adc6ff] hover:text-white transition-colors">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};
