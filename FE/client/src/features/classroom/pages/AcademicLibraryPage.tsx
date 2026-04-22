import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Download, Eye, BookOpen, Filter } from "lucide-react";
import {
  listReports,
  type Report,
  downloadReportInBrowser,
} from "../services/report.service";

const FILE_COLORS: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  DOCX: "bg-blue-100 text-blue-800",
  DOC: "bg-blue-100 text-blue-800",
  PPT: "bg-orange-100 text-orange-800",
  PPTX: "bg-orange-100 text-orange-800",
};

export const AcademicLibraryPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "popular" | "rated">("recent");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | "pdf" | "docx" | "pptx">("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReports({
        status: "approved",
        search: debouncedSearch || undefined,
        limit: 50,
        sort,
      });
      const items: Report[] = data.items || [];
      const filteredItems =
        fileTypeFilter === "all"
          ? items
          : items.filter((item) => item.file_type?.toLowerCase() === fileTypeFilter);
      setReports(filteredItems);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, fileTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto bg-app p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h2 className="mb-2 text-4xl font-black tracking-tight text-ink-heading">Thư viện tài liệu</h2>
          <p className="max-w-2xl text-lg text-ink-body">
            Tìm kiếm và truy cập các báo cáo, tài liệu đã được phê duyệt từ hệ thống.
          </p>
        </header>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm báo cáo theo tiêu đề, tác giả..."
              className="w-full rounded-xl border border-app-line bg-app-card py-3.5 pl-12 pr-4 text-sm text-ink-heading placeholder:text-ink-faint transition-all focus:border-brand/35 focus:ring-2 focus:ring-brand/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted hover:text-ink-heading"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
              <Filter size={14} /> Bộ lọc
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "popular" | "rated")}
              className="rounded-lg border border-app-line bg-app-card px-3 py-2 text-xs text-ink-heading"
            >
              <option value="recent">Mới nhất</option>
              <option value="popular">Xem nhiều</option>
              <option value="rated">Đánh giá cao</option>
            </select>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as "all" | "pdf" | "docx" | "pptx")}
              className="rounded-lg border border-app-line bg-app-card px-3 py-2 text-xs text-ink-heading"
            >
              <option value="all">Tất cả file</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="pptx">PPTX</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <span className="ml-3 text-ink-muted">Đang tìm kiếm...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-ink-faint" />
            <p className="mb-1 text-lg text-ink-muted">
              {search ? "Không tìm thấy kết quả" : "Chưa có báo cáo công khai nào"}
            </p>
            {search && <p className="text-sm text-ink-faint">Thử từ khóa khác hoặc xóa bộ lọc</p>}
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-ink-muted">
              {reports.length} kết quả
              {search && <> cho &quot;{search}&quot;</>}
            </p>

            <div className="grid grid-cols-12 gap-6">
              {reports.slice(0, 1).map((report) => (
                <div
                  key={report.id}
                  className="group relative col-span-12 cursor-pointer overflow-hidden rounded-xl border border-app-line bg-app-card p-6 shadow-whisper transition-colors hover:bg-app-elevated md:col-span-8"
                  onClick={() => navigate(`/student/feedback?reportId=${report.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/student/feedback?reportId=${report.id}`);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/5 blur-3xl transition-all group-hover:bg-brand/10" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="mb-4 flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "bg-app-inset text-ink-muted"}`}
                      >
                        <FileText size={28} />
                      </div>
                      <div>
                        <span className="rounded bg-mint-dim px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-teal-900">
                          NỔI BẬT
                        </span>
                        <h3 className="mt-1 text-xl font-bold text-ink-heading transition-colors group-hover:text-brand">
                          {report.title}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-ink-faint">{formatSize(report.file_size)}</span>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-ink-body">
                    {report.description || "Không có mô tả"}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
                    <div className="flex items-center gap-4">
                      <span>{report.author_name}</span>
                      <span>•</span>
                      <span>{new Date(report.created_at).toLocaleDateString("vi-VN")}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {report.view_count} lượt xem
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void downloadReportInBrowser(report.id, report.file_name);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-app-line bg-app-inset px-2 py-1 text-[10px] font-bold text-ink-heading hover:bg-brand hover:text-white"
                    >
                      <Download size={12} /> Tải file
                    </button>
                  </div>
                </div>
              ))}

              {reports.length > 1 && (
                <div className="col-span-12 flex flex-col gap-6 md:col-span-4">
                  {reports.slice(1, 3).map((report) => (
                    <div
                      key={report.id}
                      onClick={() => navigate(`/student/feedback?reportId=${report.id}`)}
                      className="group flex-1 cursor-pointer rounded-xl border border-app-line bg-app-card p-5 shadow-whisper transition-colors hover:bg-app-elevated"
                    >
                      <div
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "bg-app-inset text-ink-muted"}`}
                      >
                        <FileText size={20} />
                      </div>
                      <h3 className="mb-1 line-clamp-2 text-sm font-bold text-ink-heading transition-colors group-hover:text-brand">
                        {report.title}
                      </h3>
                      <p className="text-[11px] text-ink-muted">
                        {report.author_name} • {formatSize(report.file_size)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {reports.slice(3).map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/student/feedback?reportId=${report.id}`)}
                  className="group col-span-12 cursor-pointer rounded-xl border border-app-line bg-app-card p-5 shadow-whisper transition-colors hover:bg-app-elevated md:col-span-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "bg-app-inset text-ink-muted"}`}
                    >
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-ink-faint">
                      {report.file_type?.toUpperCase() || "FILE"} • {formatSize(report.file_size)}
                    </span>
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-bold text-ink-heading transition-colors group-hover:text-brand">
                    {report.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-[11px] text-ink-body">
                    {report.description || "Không có mô tả"}
                  </p>
                  <div className="flex items-center justify-between gap-2 text-[10px] text-ink-muted">
                    <span>{report.author_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {report.view_count}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void downloadReportInBrowser(report.id, report.file_name);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-app-line bg-app-inset px-2 py-1 text-[10px] font-bold text-ink-heading hover:bg-brand hover:text-white"
                      >
                        <Download size={11} /> Tải
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
