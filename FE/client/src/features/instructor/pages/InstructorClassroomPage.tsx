import React from "react";
import { AssetCard } from "../components/AssetCard"; // Điều chỉnh đường dẫn file

export const InstructorClassroomPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section nội bộ của trang */}
      <section className="mb-10 flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-manrope font-extrabold text-[#dae2fd] tracking-tight mb-2">
            Workspace Materials
          </h3>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Curate and organize research documentation, datasets, and
            collaborative assets for this cohort.
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          <span className="material-symbols-outlined text-sm">add</span>
          New Asset
        </button>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Cột trái: Feed tài liệu & Insights */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Search Bar */}
          <div className="bg-[#171f33]/60 backdrop-blur-md p-4 rounded-xl flex gap-4 items-center border border-slate-800">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                search
              </span>
              <input
                className="w-full bg-[#0b1326]/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Search research papers..."
                type="text"
              />
            </div>
            <button className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-200 hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>{" "}
              Filter
            </button>
          </div>

          {/* Grid tài liệu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AssetCard
              title="Qualitative Analysis Matrix"
              description="Framework for synthesizing non-structured interview data."
              type="Document"
              time="2h ago"
              icon="description"
              colorClass="text-indigo-400 bg-indigo-500/10"
            />
            <AssetCard
              title="Raw Dataset: ARM-Pilot-B"
              description="JSON and CSV exports of the preliminary feedback loop."
              type="Dataset"
              time="1d ago"
              icon="database"
              colorClass="text-blue-400 bg-blue-500/10"
            />

            {/* Upload Placeholder */}
            <div className="bg-[#131b2e]/50 p-5 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all cursor-pointer min-h-[160px]">
              <span className="material-symbols-outlined text-3xl mb-2">
                upload_file
              </span>
              <p className="text-sm font-medium">
                Drop to upload research files
              </p>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-[#171f33] p-6 rounded-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="material-symbols-outlined text-indigo-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h5 className="text-[#dae2fd] font-bold uppercase tracking-widest text-[10px]">
                  Curator Insights
                </h5>
              </div>
              <p className="text-slate-200 text-lg font-manrope font-semibold mb-4 leading-snug">
                Engagement with "Qualitative Matrix" has increased by 40% this
                week.
              </p>
              <button className="text-indigo-400 text-xs font-bold flex items-center gap-2 hover:underline">
                View analytics{" "}
                <span className="material-symbols-outlined text-xs">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin bổ trợ */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Upcoming Sessions */}
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-800">
            <h5 className="font-manrope font-bold text-[#dae2fd] mb-6 text-sm uppercase tracking-wider">
              Upcoming Sessions
            </h5>
            <div className="space-y-4">
              <div className="flex gap-4 group cursor-pointer">
                <div className="flex flex-col items-center justify-center bg-[#0b1326] w-12 h-12 rounded-lg border border-slate-800 shrink-0 group-hover:border-indigo-500/50 transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Oct
                  </span>
                  <span className="text-lg font-bold text-white">12</span>
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    Methodology Defense
                  </h6>
                  <p className="text-xs text-slate-500">09:00 AM • Room 402B</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grading Status */}
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-800">
            <h5 className="font-manrope font-bold text-[#dae2fd] mb-4 text-sm uppercase tracking-wider">
              Grading Pulse
            </h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-tighter text-slate-400">
                  <span>Midterm Reviews</span>
                  <span className="text-white">88%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: "88%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0b1326]/80 backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl z-40 border border-slate-800/50">
        <div className="flex items-center gap-2 px-3 border-r border-slate-800">
          <span
            className="material-symbols-outlined text-indigo-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            Command Center
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">
            share
          </span>
          <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">
            archive
          </span>
          <div className="h-4 w-[px] bg-slate-800"></div>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-300">
            ⌘ K
          </span>
        </div>
      </div>
    </div>
  );
};
