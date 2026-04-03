import { BookOpen } from "lucide-react";

interface ClassHeaderProps {
  title: string;
  teacher: string;
  action?: React.ReactNode;
}

export const ClassHeader = ({ title, teacher, action }: ClassHeaderProps) => (
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
        {action && <div className="flex gap-4">{action}</div>}
      </div>
    </div>
  </div>
);
