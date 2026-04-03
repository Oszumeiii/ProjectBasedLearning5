import React from "react";

interface AssetCardProps {
  title: string;
  description: string;
  type: string;
  time: string;
  icon: string;
  colorClass: string; 
}

export const AssetCard: React.FC<AssetCardProps> = ({
  title,
  description,
  type,
  time,
  icon,
  colorClass,
}) => {
  return (
    <div className="bg-[#131b2e] p-5 rounded-xl hover:bg-[#171f33] transition-all group border border-slate-800/50 hover:border-indigo-500/30">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="material-symbols-outlined text-slate-500 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-white transition-opacity">
          more_vert
        </span>
      </div>
      <h4 className="text-[#dae2fd] font-semibold text-base mb-1">{title}</h4>
      <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${colorClass.split(" ")[0]}`}
        >
          {type}
        </span>
        <span className="text-[10px] text-slate-500">{time}</span>
      </div>
    </div>
  );
};
