// src/features/classroom/components/InstructionCard.tsx
import { FileText, Download } from "lucide-react";

export const InstructionCard = ({ description }: { description: string }) => (
  <div className="rounded-2xl border border-app-line bg-app-card p-6 shadow-whisper">
    <h3 className="mb-4 text-lg font-bold text-ink-heading">Hướng dẫn bài tập</h3>
    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-body">{description}</p>

    <div className="mt-6 border-t border-app-line pt-6">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-mint">Tài liệu đính kèm</h4>
      <div className="flex w-fit items-center gap-3 rounded-lg border border-app-line bg-app-inset p-3">
        <FileText size={18} className="text-mint" />
        <span className="text-sm text-ink-heading">de-bai-pbl5.pdf</span>
        <button type="button" className="ml-4 text-ink-muted hover:text-ink-heading">
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
);
