import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GradeBanner } from "../components/GradeBanner";
import { AiExecutiveSummary } from "../components/AiExecutiveSummary";
import { DeficiencyAnalysis } from "../components/DeficiencyAnalysis";
import { DefensePrepCard } from "../components/DefensePrepCard";
import {
  getReportById,
  getRatings,
  type Report,
  type ReportRating,
} from "../services/report.service";

export const AnalysisFeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState<Report | null>(null);
  const [ratings, setRatings] = useState<ReportRating[]>([]);
  const [loading, setLoading] = useState(!!reportId);

  useEffect(() => {
    if (!reportId) return;
    const fetchData = async () => {
      try {
        const [reportData, ratingsData] = await Promise.all([
          getReportById(Number(reportId)),
          getRatings(Number(reportId)),
        ]);
        setReport(reportData);
        setRatings(ratingsData);
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

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
  const score = report ? Math.round(avgRating * 20) : 88;

  const title = report?.title || "Phân tích báo cáo";
  const reviewer =
    ratings.length > 0
      ? ratings[0].reviewer_name
      : report?.reviewer_name || "Giảng viên";
  const comment =
    ratings.length > 0
      ? ratings[0].comment || ""
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
          score={score}
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

        {ratings.length > 0 && (
          <div className="p-6 bg-[#131b2e] rounded-xl border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold mb-4">
              Đánh giá ({ratings.length})
            </h3>
            <div className="space-y-4">
              {ratings.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-[#171f33] rounded-lg border border-slate-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#dae2fd]">
                      {r.reviewer_name}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined text-sm ${star <= r.rating ? "text-amber-400" : "text-slate-700"}`}
                          style={{
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#c6c6cd]">{r.comment}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-2">
                    {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#798098] uppercase font-bold tracking-widest">
              Điểm trung bình
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-2 w-32 bg-[#171f33] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4fdbc8] to-[#adc6ff]"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-[#4fdbc8]">{score}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#798098]">Trạng thái:</span>
            <span className="px-3 py-1 bg-[#001c18] text-[#4fdbc8] text-[10px] font-bold rounded-sm uppercase">
              {report?.status || "N/A"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
