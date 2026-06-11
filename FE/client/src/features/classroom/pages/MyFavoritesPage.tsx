import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  FileText,
  Download,
  Eye,
  Star,
  MessageSquare,
  Calendar,
  User,
  BookOpen,
  FileArchive,
} from "lucide-react";
import {
  getMyFavorites,
  removeFavorite,
  downloadReportInBrowser,
  type Report,
} from "../services/report.service";

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const MyFavoritesPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyFavorites();
      setReports(data.items || []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (removingId) return;
    setRemovingId(id);
    try {
      await removeFavorite(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to remove favorite", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-[#F3F6FA] p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Heart size={22} className="text-red-500" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">
                Yêu thích của tôi
              </h2>
              <p className="text-sm text-slate-500">
                Danh sách tài liệu bạn đã lưu yêu thích
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand border-t-transparent" />
            <span className="ml-3 text-sm text-slate-500">Đang tải...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 text-center">
            <Heart size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="mb-1 text-lg font-medium text-slate-500">
              Chưa có tài liệu yêu thích
            </p>
            <p className="text-sm text-slate-400">
              Bấm vào icon{" "}
              <Heart size={12} className="inline text-red-400" /> trên trang thư
              viện để lưu tài liệu yêu thích.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs font-medium text-slate-400">
              {reports.length} tài liệu yêu thích
            </p>
            <div className="space-y-3">
              {reports.map((report) => {
                const ext = report.file_type?.toUpperCase() || "FILE";
                const FileIcon =
                  ext === "ZIP" ? FileArchive : FileText;
                const iconColor =
                  ext === "PDF"
                    ? "bg-red-50 text-red-600"
                    : ext === "DOCX" || ext === "DOC"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-500";

                return (
                  <div
                    key={report.id}
                    onClick={() =>
                      navigate(`/student/feedback?reportId=${report.id}`)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate(`/student/feedback?reportId=${report.id}`);
                    }}
                    className="group cursor-pointer rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
                      >
                        <FileIcon size={24} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-[#0F172A] transition-colors group-hover:text-brand">
                          {report.title}
                        </h3>
                        {report.description && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                            {report.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {report.author_name && (
                            <span className="inline-flex items-center gap-1">
                              <User size={11} /> {report.author_name}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} />{" "}
                            {formatDate(report.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye size={11} /> {report.view_count ?? 0}
                          </span>
                          {Number(report.avg_rating) > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Star
                                size={11}
                                className="text-amber-400"
                                fill="currentColor"
                              />
                              {Number(report.avg_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          title="Chat AI"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/student/chat?reportId=${report.id}`
                            );
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-brand/20 bg-brand/5 p-2 text-brand transition-colors hover:bg-brand/10"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          type="button"
                          title="Tải file"
                          onClick={(e) => {
                            e.stopPropagation();
                            void downloadReportInBrowser(
                              report.id,
                              report.file_name
                            );
                          }}
                          className="inline-flex items-center justify-center rounded-lg bg-brand p-2 text-white transition-colors hover:bg-brand/90"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          title="Bỏ yêu thích"
                          disabled={removingId === report.id}
                          onClick={(e) => void handleRemove(e, report.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
