import React from "react";
import { AIAdvisorSidebar } from "../components/AIAdvisorSidebar";

export const InstructorGradingDetailPage: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500">
      {/* Left Pane: Document Viewer */}
      <section className="flex-1 bg-[#0b1326] p-8 overflow-y-auto custom-scrollbar">
        {/* Header Document */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <span className="material-symbols-outlined text-base">
                verified_user
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Verified Submission
              </span>
            </div>
            <h2 className="text-2xl font-manrope font-extrabold text-[#dae2fd]">
              Sub-Atomic Synthesis Paradigms.pdf
            </h2>
            <p className="text-slate-500 text-sm">
              Submitted by{" "}
              <span className="text-indigo-400 font-medium">Elias Vance</span> •
              4 hours ago
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-[#171f33] text-slate-400 hover:text-white border border-slate-800 transition-colors">
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button className="p-2.5 rounded-xl bg-[#171f33] text-slate-400 hover:text-white border border-slate-800 transition-colors">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        {/* Paper Canvas (Skeuomorphic Design) */}
        <div className="bg-white rounded-sm shadow-2xl min-h-[1200px] w-full max-w-4xl mx-auto p-20 text-slate-800 font-serif leading-relaxed mb-12">
          <div className="border-b border-slate-200 pb-10 mb-10 text-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
              Research Monograph
            </h3>
            <p className="mt-2 text-slate-400 text-sm italic">
              Department of Quantum Engineering
            </p>
          </div>

          <div className="space-y-8 text-lg">
            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 font-manrope">
                Abstract
              </h4>
              <p>
                The convergence of stochastic modeling and sub-atomic particle
                synthesis presents a novel frontier for localized energy
                generation. This paper explores the integration of ARM-2024
                protocols in high-density plasma environments...
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 font-manrope">
                1. Introduction
              </h4>
              <p>
                Historically, the limitation of synthetic paradigms has been the
                inability to sustain coherence beyond the nanosecond threshold.
                Previous scholars (Thorne et al., 2021) argued that structural
                integrity was dependent on external flux capacitors...
              </p>
            </div>

            {/* Simulated Chart */}
            <div className="my-10 py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                stacked_line_chart
              </span>
              <p className="text-[10px] font-sans uppercase font-extrabold tracking-tighter text-slate-400">
                Fig 1.1: Thermal Variance under Recursive Synthesis
              </p>
            </div>

            <p>
              Analyzing the data points in Figure 1.1 reveals a non-linear
              progression that aligns with the Kuramoto model. By adjusting the
              synchronization parameters, we observed a 12% increase in net
              output...
            </p>
          </div>
        </div>
      </section>

      {/* Right Pane: AI Advisor Sidebar */}
      <AIAdvisorSidebar />
    </div>
  );
};
