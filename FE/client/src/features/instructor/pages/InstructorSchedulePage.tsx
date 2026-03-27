import React from "react";
import { MilestoneItem } from "../components/MilestoneItem";
import { CreateMilestoneForm } from "../components/CreateMilestoneForm";

export const SchedulePage: React.FC = () => {
  return (
    <main className="ml-64 pt-24 px-12 pb-20 min-h-screen bg-[#0b1326] animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-extrabold text-[#dae2fd] font-manrope tracking-tight mb-2">
            Schedule & Deadlines
          </h2>
          <p className="text-slate-400 max-w-lg">
            Manage critical milestones, report submissions, and automated
            feedback cycles for the 2024 academic semester.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="p-3 rounded-xl bg-[#171f33] border border-slate-800 text-slate-400 hover:text-white transition-all">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Timeline Track */}
        <div className="col-span-12 lg:col-span-8 relative">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent"></div>

          <div className="space-y-12">
            <MilestoneItem
              status="active"
              title="Qualitative Analysis Report"
              description="Detailed thematic coding and initial theory triangulation from the Phase 1 datasets."
              dateRange="Oct 12 - Oct 28"
              stats="42/48 Submitted"
              deadlineCountdown="04:12:44"
            />

            <MilestoneItem
              status="upcoming"
              title="Final Methodology Peer-Review"
              description="Cross-institutional validation of the RAG implementation and vector weight adjustments."
              dateRange="Nov 14 - Nov 20"
              stats="Scheduled"
            />

            <MilestoneItem
              status="closed"
              title="Literature Review Synthesis"
              description="Comprehensive review of 2023-2024 academic papers on Neural Information Retrieval."
              dateRange="Finished on Sep 30"
            />
          </div>
        </div>

        {/* Right Sidebar: Tools & Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <CreateMilestoneForm />

          {/* Progress Statistics */}
          <div className="bg-[#131b2e] rounded-2xl p-8 border border-slate-800/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
              Semester Velocity
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  Total Completion
                </span>
                <span className="text-sm font-bold text-[#4fdbc8]">84%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b1326] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4fdbc8] rounded-full shadow-[0_0_12px_rgba(79,219,200,0.3)]"
                  style={{ width: "84%" }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-black text-[#dae2fd]">12</p>
                </div>
                <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                    Active Now
                  </p>
                  <p className="text-2xl font-black text-[#adc6ff]">03</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
