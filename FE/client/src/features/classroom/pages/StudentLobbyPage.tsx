// src/features/classroom/pages/StudentLobbyPage.tsx
import { ClassCard } from "../components/ClassCard";
import { School, LayoutGrid, List } from "lucide-react";

export const StudentLobbyPage = () => {
  const classes = [
    {
      title: "Advanced Cognitive Psychology",
      teacher: "Dr. Helena Vance",
      status: "pending",
      deadline: "2 days 10 hours",
      progress: 25,
    },
    {
      title: "Natural Language Processing",
      teacher: "Prof. Marcus Chen",
      status: "submitted",
      deadline: "Tomorrow, 10:00 AM",
      progress: 100,
    },
    {
      title: "Ethics in Artificial Intelligence",
      teacher: "Dr. Sarah Jenkins",
      status: "graded",
      deadline: "Completed",
      progress: 100,
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center p-8 rounded-xl bg-gradient-to-br from-[#131b2e] to-[#171f33] relative overflow-hidden border border-slate-800/50">
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-[#dae2fd] tracking-tight">
              Welcome back, Scholar
            </h3>
            <p className="text-[#c6c6cd] mt-2 max-w-md">
              You have 3 active assignments requiring attention this week. Your
              current research efficiency is up by 12%.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0566d9]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        <div className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#c6c6cd] font-medium text-sm">
              Overall Progress
            </span>
            <span className="text-[#4fdbc8] font-bold">84%</span>
          </div>
          <div className="mt-4 h-2 w-full bg-[#171f33] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#adc6ff] to-[#4fdbc8] w-[84%]"></div>
          </div>
          <p className="text-[10px] text-[#c6c6cd] mt-4 uppercase tracking-widest font-bold">
            Recommended Goal: 2h 15m today
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline text-xl font-bold text-[#dae2fd] flex items-center gap-2">
            <School className="text-[#adc6ff]" size={24} /> My Enrolled Classes
          </h4>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-[#222a3d] text-[#adc6ff] shadow-inner">
              <LayoutGrid size={20} />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-[#222a3d] transition-all">
              <List size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((cls, idx) => (
            <ClassCard key={idx} {...(cls as any)} />
          ))}
        </div>
      </section>
    </div>
  );
};
