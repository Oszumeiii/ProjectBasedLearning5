import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AIAdvisorSidebar } from "../components/AIAdvisorSidebar";
import {
  getReportById,
  downloadReportInBrowser,
  type Report,
} from "../../classroom/services/report.service";

export const InstructorGradingDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(!!reportId);

  useEffect(() => {
    if (!reportId) return;
    const fetchReport = async () => {
      try {
        const data = await getReportById(Number(reportId));
        setReport(data);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const title = report?.title || "Sub-Atomic Synthesis Paradigms.pdf";
  const author = report?.author_name || "Elias Vance";
  const content = report?.content;
  const submittedAgo = report
    ? `Nộp lúc ${new Date(report.created_at).toLocaleString("vi-VN")}`
    : "4 hours ago";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500">
      <section className="flex-1 bg-[#0b1326] p-8 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <span className="material-symbols-outlined text-base">
                verified_user
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {report?.status === "approved"
                  ? "Đã duyệt"
                  : report?.status === "under_review"
                    ? "Đang duyệt"
                    : "Đã nộp"}
              </span>
            </div>
            <h2 className="text-2xl font-manrope font-extrabold text-[#dae2fd]">
              {title}
            </h2>
            <p className="text-slate-500 text-sm">
              Nộp bởi{" "}
              <span className="text-indigo-400 font-medium">{author}</span> •{" "}
              {submittedAgo}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-[#171f33] text-slate-400 hover:text-white border border-slate-800 transition-colors">
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!report) return;
                void downloadReportInBrowser(report.id, report.file_name);
              }}
              className="p-2.5 rounded-xl bg-[#171f33] text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-2xl min-h-[800px] w-full max-w-4xl mx-auto p-20 text-slate-800 font-serif leading-relaxed mb-12">
          <div className="border-b border-slate-200 pb-10 mb-10 text-center">
            <h3 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
              {title}
            </h3>
            <p className="mt-2 text-slate-400 text-sm italic">
              Tác giả: {author}
            </p>
          </div>

          <div className="space-y-8 text-lg">
            {content ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3 font-manrope">
                    Tóm tắt
                  </h4>
                  <p className="text-slate-600 italic">
                    {report?.description ||
                      "Nội dung báo cáo sẽ được hiển thị ở đây khi hệ thống xử lý xong file."}
                  </p>
                </div>

                <div className="my-10 py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                    description
                  </span>
                  <p className="text-sm text-slate-400">
                    {report?.file_type
                      ? `File ${report.file_type.toUpperCase()} - đang chờ xử lý`
                      : "Chưa có file đính kèm"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <AIAdvisorSidebar />
    </div>
  );
};
