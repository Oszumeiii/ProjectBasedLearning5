// src/features/materials/components/MaterialCard.tsx
import { FileText, Download } from "lucide-react";

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
      <div className="group relative col-span-12 overflow-hidden rounded-xl border border-app-line bg-app-card p-6 shadow-whisper transition-colors hover:bg-app-elevated md:col-span-8">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/5 blur-3xl transition-all group-hover:bg-brand/10" />
        <div className="relative z-10 flex items-start justify-between">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <FileText size={30} />
            </div>
            <div>
              <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                FEATURED
              </span>
              <h3 className="mt-1 text-xl font-bold text-ink-heading">{title}</h3>
            </div>
          </div>
          <span className="font-mono text-xs text-ink-faint">{size}</span>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-body">{description}</p>
        <div className="flex gap-3">
          {tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-mint/30 bg-mint-dim px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-900"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 flex flex-col rounded-xl border border-app-line bg-app-card p-6 shadow-whisper transition-colors hover:bg-app-elevated md:col-span-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        <FileText size={20} />
      </div>
      <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-ink-heading">{title}</h3>
      <p className="mb-4 line-clamp-2 text-xs text-ink-muted">{description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-ink-faint">
          {type} • {size}
        </span>
        <button type="button" className="text-brand transition-colors hover:text-brand-hover">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};
