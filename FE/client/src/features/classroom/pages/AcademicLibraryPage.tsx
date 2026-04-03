import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Download,
  Eye,
  Star,
  Filter,
  BookOpen,
} from "lucide-react";
import {
  listReports,
  type Report,
  addFavorite,
  removeFavorite,
} from "../services/report.service";

const STATUS_LABEL: Record<string, string> = {
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  under_review: "Đang duyệt",
};

const FILE_COLORS: Record<string, string> = {
  PDF: "text-red-400 bg-red-500/10",
  DOCX: "text-blue-400 bg-blue-500/10",
  DOC: "text-blue-400 bg-blue-500/10",
  PPT: "text-orange-400 bg-orange-500/10",
  PPTX: "text-orange-400 bg-orange-500/10",
};

export const AcademicLibraryPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        sort: "newest",
      });
      setReports(data.items || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

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
    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-[#0b1326]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h2 className="text-4xl font-black text-[#dae2fd] tracking-tight mb-2">
            Thư viện tài liệu
          </h2>
          <p className="text-[#c6c6cd] text-lg max-w-2xl">
            Tìm kiếm và truy cập các báo cáo, tài liệu đã được phê duyệt từ
            hệ thống.
          </p>
        </header>

        <div className="relative mb-8">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm báo cáo theo tiêu đề, tác giả..."
            className="w-full pl-12 pr-4 py-3.5 bg-[#131b2e] border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm"
            >
              Xóa
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Đang tìm kiếm...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-lg text-slate-500 mb-1">
              {search
                ? "Không tìm thấy kết quả"
                : "Chưa có báo cáo công khai nào"}
            </p>
            {search && (
              <p className="text-sm text-slate-600">
                Thử từ khóa khác hoặc xóa bộ lọc
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4">
              {reports.length} kết quả
              {search && <> cho "{search}"</>}
            </p>

            <div className="grid grid-cols-12 gap-6">
              {reports.slice(0, 1).map((report) => (
                <div
                  key={report.id}
                  className="col-span-12 md:col-span-8 bg-[#131b2e] rounded-xl p-6 hover:bg-[#171f33] transition-colors group relative overflow-hidden border border-slate-800/50 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/student/feedback?reportId=${report.id}`
                    )
                  }
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#adc6ff]/5 rounded-full blur-3xl group-hover:bg-[#adc6ff]/10 transition-all" />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "text-slate-400 bg-slate-500/10"}`}
                      >
                        <FileText size={28} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#4fdbc8] uppercase bg-[#4fdbc8]/10 px-2 py-0.5 rounded">
                          NỔI BẬT
                        </span>
                        <h3 className="text-xl font-bold text-[#dae2fd] mt-1 group-hover:text-[#adc6ff] transition-colors">
                          {report.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[#798098] text-xs font-mono">
                      {formatSize(report.file_size)}
                    </span>
                  </div>
                  <p className="text-[#c6c6cd] text-sm mb-4 line-clamp-2">
                    {report.description || "Không có mô tả"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{report.author_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(report.created_at).toLocaleDateString("vi-VN")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {report.view_count} lượt xem
                    </span>
                  </div>
                </div>
              ))}

              {reports.length > 1 && (
                <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                  {reports.slice(1, 3).map((report) => (
                    <div
                      key={report.id}
                      onClick={() =>
                        navigate(
                          `/student/feedback?reportId=${report.id}`
                        )
                      }
                      className="bg-[#131b2e] rounded-xl p-5 hover:bg-[#171f33] transition-colors border border-slate-800/50 cursor-pointer group flex-1"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "text-slate-400 bg-slate-500/10"}`}
                      >
                        <FileText size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-[#dae2fd] mb-1 line-clamp-2 group-hover:text-[#adc6ff] transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {report.author_name} •{" "}
                        {formatSize(report.file_size)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {reports.slice(3).map((report) => (
                <div
                  key={report.id}
                  onClick={() =>
                    navigate(
                      `/student/feedback?reportId=${report.id}`
                    )
                  }
                  className="col-span-12 md:col-span-4 bg-[#131b2e] rounded-xl p-5 hover:bg-[#171f33] transition-colors border border-slate-800/50 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${FILE_COLORS[report.file_type?.toUpperCase() || ""] || "text-slate-400 bg-slate-500/10"}`}
                    >
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {report.file_type?.toUpperCase() || "FILE"} •{" "}
                      {formatSize(report.file_size)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#dae2fd] mb-1 line-clamp-2 group-hover:text-[#adc6ff] transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-[11px] text-[#c6c6cd] line-clamp-2 mb-3">
                    {report.description || "Không có mô tả"}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{report.author_name}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> {report.view_count}
                    </span>
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
