import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GradeBanner } from "../components/GradeBanner";
import { AiExecutiveSummary } from "../components/AiExecutiveSummary";
import { DeficiencyAnalysis } from "../components/DeficiencyAnalysis";
import { DefensePrepCard } from "../components/DefensePrepCard";
import {
  getReportById,
  getReportFeedback,
  type Report,
  type ReportFeedback,
} from "../services/report.service";

export const AnalysisFeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState<Report | null>(null);
  const [feedbacks, setFeedbacks] = useState<ReportFeedback[]>([]);
  const [loading, setLoading] = useState(!!reportId);

  useEffect(() => {
    if (!reportId) return;
    const fetchData = async () => {
      try {
        const reportData = await getReportById(Number(reportId));
        setReport(reportData);
        const feedbackData = await getReportFeedback(Number(reportId));
        setFeedbacks(feedbackData);
      } catch (err) {
        console.error("Failed to load feedback data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-app py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const title = report?.title || "Phân tích báo cáo";
  const reviewer =
    feedbacks.length > 0
      ? feedbacks[0].reviewer_name
      : report?.reviewer_name || "Giảng viên";
  const comment =
    feedbacks.length > 0
      ? feedbacks[0].comment || ""
      : report?.review_note || "Chưa có nhận xét.";
  const summary =
    report?.content?.slice(0, 500) ||
    report?.description ||
    "Nội dung phân tích sẽ hiển thị khi hệ thống xử lý xong báo cáo.";

  return (
    <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto bg-app p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <GradeBanner title={title} instructorName={reviewer} comment={comment} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <AiExecutiveSummary summary={summary} />
            <DeficiencyAnalysis plagiarismScore={6} />
          </div>

          <div className="lg:col-span-4">
            <DefensePrepCard />
          </div>
        </div>

        {feedbacks.length > 0 && (
          <div className="rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
            <h3 className="mb-4 font-bold text-ink-heading">Nhận xét ({feedbacks.length})</h3>
            <div className="space-y-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="rounded-lg border border-app-line bg-app-inset p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-heading">{f.reviewer_name}</span>
                  </div>
                  {f.comment && <p className="text-sm text-ink-body">{f.comment}</p>}
                  <p className="mt-2 text-xs text-ink-faint">
                    {new Date(f.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-app-line pt-8">
          <span className="text-xs text-ink-muted">Trạng thái:</span>
          <span className="rounded-sm bg-mint-dim px-3 py-1 text-[10px] font-bold uppercase text-teal-900">
            {report?.status || "N/A"}
          </span>
        </footer>
      </div>
    </div>
  );
};
