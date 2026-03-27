import React from "react";
import { SubmissionRow } from "../components/SubmissionRow";

export const InstructorGradingPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Sticky Header nội bộ */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-manrope font-extrabold text-[#dae2fd] tracking-tight">
            Grading Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage AI-assisted grading and submission integrity.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-[#171f33] text-slate-300 text-sm font-semibold flex items-center gap-2 border border-slate-800 hover:bg-slate-800">
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>{" "}
            Filter
          </button>
          <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
            <span className="material-symbols-outlined text-sm">
              auto_awesome
            </span>{" "}
            Run AI Analysis
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#131b2e] rounded-xl overflow-hidden border border-slate-800 mb-8">
        <table className="w-full text-left">
          <thead className="bg-[#171f33] text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
            <tr>
              <th className="py-4 px-6 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded-sm bg-slate-900 border-slate-700"
                />
              </th>
              <th className="py-4 px-4">Student ID</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">File Name</th>
              <th className="py-4 px-4">Submission Date</th>
              <th className="py-4 px-4">Plagiarism</th>
              <th className="py-4 px-4">AI Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <SubmissionRow
              id="#2024-8812"
              name="Elena Rodriguez"
              fileName="meta_analysis.pdf"
              date="Oct 12, 2024"
              plagiarism={4}
              status="Analyzing"
            />
            <SubmissionRow
              id="#2024-9102"
              name="Marcus Thorne"
              fileName="modeling_results.docx"
              date="Oct 14, 2024"
              plagiarism={42}
              status="Done"
              isLate="4h 12m Late"
            />
            <SubmissionRow
              id="#2024-7721"
              name="Sarah Jenkins"
              fileName="ethical_review.pdf"
              date="Oct 13, 2024"
              plagiarism={0}
              status="Not Run"
            />
          </tbody>
        </table>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        <div className="md:col-span-2 bg-[#131b2e] p-6 rounded-xl border border-slate-800">
          <h3 className="text-slate-100 font-bold mb-4">Submission Velocity</h3>
          <div className="flex items-end gap-2 h-24">
            {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-500/20 rounded-t-md hover:bg-indigo-500 transition-all"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/40 to-[#0b1326] p-6 rounded-xl border border-indigo-500/20">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-emerald-400">
              psychology
            </span>
          </div>
          <h3 className="text-white font-bold text-lg">AI Diagnostic</h3>
          <p className="text-slate-400 text-xs mt-2">
            Integrity across 84% of submissions is within safe margins.
          </p>
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>GLOBAL SCORE</span>
              <span className="text-emerald-400">92.4%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: "92%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <div className="bg-[#171f33]/80 backdrop-blur-xl border border-indigo-500/30 p-2 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="flex items-center gap-2 pl-4 flex-1">
            <span className="material-symbols-outlined text-indigo-400 text-sm font-bold">
              terminal
            </span>
            <input
              className="bg-transparent border-none text-sm text-white focus:ring-0 w-full"
              placeholder="Type a command (/run-ai-all)..."
            />
          </div>
          <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};
