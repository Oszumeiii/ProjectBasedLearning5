// src/features/classroom/components/SubmissionZone.tsx
import { Upload, File, X } from "lucide-react";

export const SubmissionZone = () => (
  <div className="rounded-2xl border border-app-line bg-app-card p-6 shadow-whisper">
    <h3 className="mb-4 text-lg font-bold text-ink-heading">Bài làm của bạn</h3>

    <div className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-app-line bg-app-inset p-8 transition-all hover:border-brand/35 hover:bg-app-elevated">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-card text-mint shadow-whisper transition-transform group-hover:scale-110">
        <Upload size={24} />
      </div>
      <p className="mt-4 text-sm font-medium text-ink-heading">
        Nhấn để tải lên hoặc kéo thả file vào đây
      </p>
      <p className="mt-1 text-xs text-ink-muted">PDF, ZIP, DOCX (Tối đa 25MB)</p>
    </div>

    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between rounded-lg border border-app-line bg-app-elevated p-3">
        <div className="flex items-center gap-2">
          <File size={16} className="text-mint" />
          <span className="text-sm text-ink-body">Bao-cao-PBL5-Nhom1.pdf</span>
        </div>
        <button type="button" className="text-red-600 hover:text-red-700">
          <X size={16} />
        </button>
      </div>
    </div>

    <button
      type="button"
      className="mt-6 w-full rounded-xl bg-brand py-3 font-bold text-white shadow-whisper transition-colors hover:bg-brand-hover"
    >
      Nộp bài ngay
    </button>
  </div>
);
