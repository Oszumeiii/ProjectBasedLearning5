// src/features/classroom/components/MaterialItem.tsx
import { FileText, Download, Eye } from "lucide-react";

interface MaterialProps {
  title: string;
  date: string;
  type: string;
}

export const MaterialItem = ({ title, date, type }: MaterialProps) => (
  <div className="group flex items-center justify-between rounded-xl border border-app-line bg-app-card p-4 transition-all hover:border-brand/20">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-inset text-mint">
        <FileText size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-ink-heading transition-colors group-hover:text-brand">
          {title}
        </h4>
        <p className="text-[11px] text-ink-muted">
          {date} • {type}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <button type="button" className="p-2 text-ink-muted transition-colors hover:text-mint">
        <Eye size={18} />
      </button>
      <button type="button" className="p-2 text-ink-muted transition-colors hover:text-brand">
        <Download size={18} />
      </button>
    </div>
  </div>
);
