// src/features/feedback/components/GradeBanner.tsx
import { Verified, User } from "lucide-react";

interface GradeBannerProps {
  title: string;
  instructorName: string;
  comment: string;
}

export const GradeBanner = ({
  title,
  instructorName,
  comment,
}: GradeBannerProps) => (
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#222a3d] to-[#131b2e] p-8 shadow-xl border border-slate-800/50">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Verified size={120} className="text-[#dae2fd]" />
    </div>
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-[#001c18] text-[#4fdbc8] text-[10px] font-bold tracking-widest uppercase border border-[#009182]/20">
          Graded Assessment
        </span>
        <h2 className="text-4xl font-bold text-[#dae2fd] tracking-tight">
          {title}
        </h2>
        <p className="text-[#c6c6cd] max-w-2xl italic">"{comment}"</p>
        <div className="flex items-center gap-4 pt-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-[#adc6ff]/30">
            <User size={16} />
          </div>
          <span className="text-sm font-semibold text-[#bec6e0]">
            {instructorName}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-[#2d3449] rounded-2xl border border-slate-700/50 min-w-[220px]">
        <span className="text-[10px] text-[#c6c6cd] uppercase font-bold tracking-tighter">
          Phản hồi giảng viên
        </span>
        <div className="text-2xl font-bold text-[#adc6ff] mt-2">Nhận xét</div>
      </div>
    </div>
  </section>
);
