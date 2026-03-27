// src/features/classroom/components/ClassHeader.tsx
import { BookOpen, Users, Info } from "lucide-react";

export const ClassHeader = ({
  title,
  teacher,
}: {
  title: string;
  teacher: string;
}) => (
  <div className="bg-[#131b2e] border-b border-slate-800/50 p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#adc6ff] text-sm font-bold uppercase tracking-widest mb-2">
            <BookOpen size={16} /> Course Workspace
          </div>
          <h1 className="text-4xl font-black text-[#dae2fd] tracking-tight">
            {title}
          </h1>
          <p className="text-[#c6c6cd] mt-2 flex items-center gap-2">
            Giảng viên:{" "}
            <span className="text-[#adc6ff] font-semibold">{teacher}</span>
          </p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#222a3d] rounded-lg text-sm font-bold border border-slate-700 hover:bg-[#2d3449] transition-all">
            <Users size={18} /> Mọi người
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0566d9] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#0566d9]/20 hover:scale-105 transition-all">
            <Info size={18} /> Thông tin môn
          </button>
        </div>
      </div>
    </div>
  </div>
);
