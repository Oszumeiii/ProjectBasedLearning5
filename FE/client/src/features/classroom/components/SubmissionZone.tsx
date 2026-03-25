// src/features/classroom/components/SubmissionZone.tsx
import { Upload, File, X } from "lucide-react";

export const SubmissionZone = () => (
  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800/50">
    <h3 className="text-[#dae2fd] font-bold text-lg mb-4">Bài làm của bạn</h3>

    {/* Khu vực kéo thả file */}
    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-[#0b1326]/50 hover:border-[#0566d9] hover:bg-[#0566d9]/5 transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-full bg-[#1c253d] flex items-center justify-center text-[#adc6ff] group-hover:scale-110 transition-transform">
        <Upload size={24} />
      </div>
      <p className="mt-4 text-[#dae2fd] font-medium text-sm">
        Nhấn để tải lên hoặc kéo thả file vào đây
      </p>
      <p className="mt-1 text-slate-500 text-xs">
        PDF, ZIP, DOCX (Tối đa 25MB)
      </p>
    </div>

    {/* Danh sách file đã chọn (Ví dụ mẫu) */}
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between p-3 bg-[#1c253d] rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <File size={16} className="text-[#4fdbc8]" />
          <span className="text-sm text-[#dae2fd]">Bao-cao-PBL5-Nhom1.pdf</span>
        </div>
        <button className="text-red-400 hover:text-red-300">
          <X size={16} />
        </button>
      </div>
    </div>

    <button className="w-full mt-6 py-3 bg-[#0566d9] text-white rounded-xl font-bold hover:bg-[#004395] transition-all shadow-lg shadow-[#0566d9]/20">
      Nộp bài ngay
    </button>
  </div>
);
