import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, ExternalLink, Heart, Star } from "lucide-react";
import { GradeBanner } from "../components/GradeBanner";
import { AiExecutiveSummary } from "../components/AiExecutiveSummary";
import { DeficiencyAnalysis } from "../components/DeficiencyAnalysis";
import { DefensePrepCard } from "../components/DefensePrepCard";
import {
  getReportById,
  getReportFeedback,
  getReportReferences,
  getRatings,
  upsertRating,
  addFavorite,
  removeFavorite,
  type Report,
  type ReportFeedback,
  type ReportReference,
  type RatingsResponse,
} from "../services/report.service";

export const AnalysisFeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState<Report | null>(null);
  const [feedbacks, setFeedbacks] = useState<ReportFeedback[]>([]);
  const [references, setReferences] = useState<ReportReference[]>([]);
  const [loading, setLoading] = useState(!!reportId);
  const [ratingsData, setRatingsData] = useState<RatingsResponse | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    const id = Number(reportId);
    const fetchData = async () => {
      try {
        const [reportData, feedbackData, refsData, ratData] = await Promise.all([
          getReportById(id),
          getReportFeedback(id),
          getReportReferences(id),
          getRatings(id),
        ]);
        setReport(reportData);
        setFeedbacks(feedbackData);
        setReferences(refsData);
        setRatingsData(ratData);
      } catch (err) {
        console.error("Failed to load feedback data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reportId]);

  const handleRate = async (stars: number) => {
    if (!reportId || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      await upsertRating(Number(reportId), stars);
      setMyRating(stars);
      const updated = await getRatings(Number(reportId));
      setRatingsData(updated);
    } catch (err) {
      console.error("Failed to submit rating", err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!report || favLoading) return;
    setFavLoading(true);
    try {
      if (report.is_favorited) {
        await removeFavorite(report.id);
      } else {
        await addFavorite(report.id);
      }
      setReport({ ...report, is_favorited: !report.is_favorited });
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setFavLoading(false);
    }
  };

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

  const isProcessed = report?.embedding_status === "done";

  return (
    <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto bg-app p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <GradeBanner title={title} instructorName={reviewer} comment={comment} />

        {/* Rating & Favorite bar */}
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-app-line bg-app-card px-6 py-4 shadow-whisper">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink-muted">Đánh giá:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={ratingSubmitting}
                  onClick={() => void handleRate(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    size={22}
                    className={
                      s <= (hoverRating || myRating)
                        ? "text-amber-400"
                        : "text-slate-300"
                    }
                    fill={s <= (hoverRating || myRating) ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            {ratingsData && ratingsData.count > 0 && (
              <span className="text-xs text-ink-muted">
                {Number(ratingsData.avgRating).toFixed(1)} / 5 ({ratingsData.count} lượt)
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-app-line" />

          <button
            type="button"
            disabled={favLoading}
            onClick={() => void handleToggleFavorite()}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              report?.is_favorited
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-app-line bg-app-inset text-ink-muted hover:border-red-200 hover:text-red-500"
            }`}
          >
            <Heart
              size={16}
              fill={report?.is_favorited ? "currentColor" : "none"}
            />
            {report?.is_favorited ? "Đã yêu thích" : "Yêu thích"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <AiExecutiveSummary summary={summary} isProcessed={isProcessed} />
            <DeficiencyAnalysis isProcessed={isProcessed} />
          </div>

          <div className="lg:col-span-4">
            <DefensePrepCard isProcessed={isProcessed} />
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

        {references.length > 0 && (
          <div className="rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-brand" />
              <h3 className="font-bold text-ink-heading">
                Tài liệu tham khảo ({references.length})
              </h3>
            </div>
            <ol className="space-y-3">
              {references.map((ref, idx) => (
                <li key={ref.id} className="flex gap-3 rounded-lg border border-app-line bg-app-inset p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-heading">
                      {ref.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                      {ref.authors && <span>{ref.authors}</span>}
                      {ref.year && <span>({ref.year})</span>}
                      {ref.source && <span className="italic">{ref.source}</span>}
                    </div>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        <ExternalLink size={10} /> {ref.url.length > 60 ? ref.url.slice(0, 60) + "..." : ref.url}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
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
