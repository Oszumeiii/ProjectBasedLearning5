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
      <div className="flex items-center justify-center py-20 bg-[#0b1326]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0b1326] no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        <GradeBanner
          title={title}
          instructorName={reviewer}
          comment={comment}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AiExecutiveSummary summary={summary} />
            <DeficiencyAnalysis plagiarismScore={6} />
          </div>

          <div className="lg:col-span-4">
            <DefensePrepCard />
          </div>
        </div>

        {feedbacks.length > 0 && (
          <div className="p-6 bg-[#131b2e] rounded-xl border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold mb-4">
              Nhận xét ({feedbacks.length})
            </h3>
            <div className="space-y-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-[#171f33] rounded-lg border border-slate-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#dae2fd]">
                      {f.reviewer_name}
                    </span>
                  </div>
                  {f.comment && (
                    <p className="text-sm text-[#c6c6cd]">{f.comment}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-2">
                    {new Date(f.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="flex items-center justify-end gap-2 pt-8 border-t border-slate-800/50">
          <span className="text-xs text-[#798098]">Trạng thái:</span>
          <span className="px-3 py-1 bg-[#001c18] text-[#4fdbc8] text-[10px] font-bold rounded-sm uppercase">
            {report?.status || "N/A"}
          </span>
        </footer>
      </div>
    </div>
  );
};
