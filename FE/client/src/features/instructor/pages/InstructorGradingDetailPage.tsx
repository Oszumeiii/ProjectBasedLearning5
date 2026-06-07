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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
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
      <section className="custom-scrollbar flex-1 overflow-y-auto bg-app p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-mint">
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {report?.status === "approved"
                  ? "Đã duyệt"
                  : report?.status === "under_review"
                    ? "Đang duyệt"
                    : "Đã nộp"}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-ink-heading">{title}</h2>
            <p className="text-sm text-ink-muted">
              Nộp bởi <span className="font-medium text-ink-heading">{author}</span> • {submittedAgo}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-app-line bg-app-card p-2.5 text-ink-muted transition-colors hover:bg-app-inset hover:text-ink-heading"
            >
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!report) return;
                void downloadReportInBrowser(report.id, report.file_name);
              }}
              className="rounded-xl border border-app-line bg-app-card p-2.5 text-ink-muted transition-colors hover:bg-app-inset hover:text-ink-heading"
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
                  <h4 className="text-xl font-bold text-slate-900 mb-3 ">
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
