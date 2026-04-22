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
    <div className="group rounded-xl border border-app-line bg-app-card p-5 shadow-whisper transition-all hover:border-brand/25 hover:bg-app-elevated">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${colorClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="material-symbols-outlined cursor-pointer text-ink-faint opacity-0 transition-opacity hover:text-ink-heading group-hover:opacity-100">
          more_vert
        </span>
      </div>
      <h4 className="mb-1 text-base font-semibold text-ink-heading">{title}</h4>
      <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-ink-muted">{description}</p>
      <div className="flex items-center justify-between border-t border-app-line pt-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${colorClass.split(" ")[0]}`}>
          {type}
        </span>
        <span className="text-[10px] text-ink-faint">{time}</span>
      </div>
    </div>
  );
};
