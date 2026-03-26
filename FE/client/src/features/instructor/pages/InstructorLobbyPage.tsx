import React from "react";
import { InstructorClassCard } from "../components/InstructorClassCard";

export const InstructorLobbyPage: React.FC = () => {
  const mockClasses = [
    {
      code: "ARM-2024",
      name: "Advanced Research Methods",
      category: "SOC SCI",
      submissions: 25,
      totalStudents: 40,
      pendingCount: 4,
    },
    {
      code: "MATH-402",
      name: "Quantitative Analysis II",
      category: "STEM",
      submissions: 12,
      totalStudents: 12,
      pendingCount: 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h3 className="text-3xl font-manrope font-extrabold text-[#dae2fd] tracking-tight">
            Active Research Channels
          </h3>
          <p className="text-slate-400 mt-2">
            Quản lý các lớp học và dữ liệu phân tích từ RAG.
          </p>
        </div>
        <button className="bg-gradient-to-br from-[#adc6ff] to-[#0566d9] text-[#001a42] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] transition-transform">
          <span className="material-symbols-outlined">add</span> Create New
          Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockClasses.map((item) => (
          <InstructorClassCard key={item.code} {...item} />
        ))}

        {/* Placeholder Card */}
        <div className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center hover:border-indigo-500/40 transition-all cursor-pointer min-h-[280px]">
          <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">
            add_circle
          </span>
          <p className="text-slate-500 text-sm font-medium">
            Add a New Semester
          </p>
        </div>
      </div>
    </div>
  );
};
