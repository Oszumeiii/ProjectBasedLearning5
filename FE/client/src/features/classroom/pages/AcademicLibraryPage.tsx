import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Download,
  Eye,
  BookOpen,
  Filter,
  Sparkles,
  MessageSquare,
  Calendar,
  User,
  GraduationCap,
  HardDrive,
  Star,
  ChevronRight,
  FileArchive,
  Tag,
  Building2,
  Users,
  ChevronDown,
  X,
  Brain,
  Zap,
} from "lucide-react";
import {
  listReports,
  type Report,
  type ListReportsParams,
  downloadReportInBrowser,
  semanticSearchReports,
  type SemanticMatch,
} from "../services/report.service";

/* ─── Constants ─── */

const FILE_ICON_STYLES: Record<string, { bg: string; text: string }> = {
  PDF: { bg: "bg-red-50", text: "text-red-600" },
  DOCX: { bg: "bg-blue-50", text: "text-blue-600" },
  DOC: { bg: "bg-blue-50", text: "text-blue-600" },
  ZIP: { bg: "bg-amber-50", text: "text-amber-600" },
  PPT: { bg: "bg-orange-50", text: "text-orange-600" },
  PPTX: { bg: "bg-orange-50", text: "text-orange-600" },
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  project: "Đồ án môn học",
  thesis: "Khóa luận TN",
  research: "NCKH",
  internship: "Thực tập",
};

const REPORT_TYPE_STYLES: Record<string, string> = {
  project: "border-blue-200 bg-blue-50 text-blue-700",
  thesis: "border-purple-200 bg-purple-50 text-purple-700",
  research: "border-teal-200 bg-teal-50 text-teal-700",
  internship: "border-orange-200 bg-orange-50 text-orange-700",
};

const selectClass =
  "cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#0F172A] shadow-sm transition-colors hover:border-slate-300";

/* ─── Helpers ─── */

const formatSize = (bytes: number | null | undefined) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const resolveReportType = (r: Report) =>
  r.report_type || r.course_type || null;

const resolveAcademicYear = (r: Report) =>
  r.academic_year || r.course_academic_year || null;

const resolveSemester = (r: Report) =>
  r.semester || r.course_semester || null;

/* ─── Small components ─── */

const FileIcon = ({ type }: { type: string | null }) => {
  const key = type?.toUpperCase() || "";
  const style = FILE_ICON_STYLES[key] || { bg: "bg-slate-100", text: "text-slate-500" };
  const IconComp = key === "ZIP" ? FileArchive : FileText;
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
      <IconComp size={24} className={style.text} />
    </div>
  );
};

const MetaItem = ({
  icon: Icon,
  value,
  title,
}: {
  icon: React.ElementType;
  value: string | null | undefined;
  title?: string;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5" title={title}>
      <Icon size={12} className="shrink-0 text-slate-400" />
      <span className="truncate">{value}</span>
    </div>
  );
};

/* ─── Main page ─── */

export const AcademicLibraryPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<ListReportsParams["sort"]>("recent");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [semanticMatches, setSemanticMatches] = useState<SemanticMatch[]>([]);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [allReports, setAllReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!isSemanticMode) {
      const timer = setTimeout(() => setDebouncedSearch(search), 400);
      return () => clearTimeout(timer);
    }
  }, [search, isSemanticMode]);

  const fetchAllReports = useCallback(async () => {
    try {
      const data = await listReports({ status: "approved", limit: 200 });
      setAllReports(data.items || []);
    } catch (err) {
      console.error("Failed to load all reports", err);
    }
  }, []);

  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  const handleSemanticSearch = useCallback(async () => {
    const query = search.trim();
    if (!query) return;

    setSemanticLoading(true);
    setSemanticQuery(query);
    try {
      const result = await semanticSearchReports(query);
      setSemanticMatches(result.matches || []);

      const matchedIds = new Set(result.matches.map((m) => String(m.id)));
      const scoreMap = new Map(result.matches.map((m) => [String(m.id), m.score]));

      const matched = allReports
        .filter((r) => matchedIds.has(String(r.id)))
        .sort((a, b) => (scoreMap.get(String(b.id)) ?? 0) - (scoreMap.get(String(a.id)) ?? 0));

      setReports(matched);
    } catch (err) {
      console.error("Semantic search failed", err);
      setSemanticMatches([]);
      setReports([]);
    } finally {
      setSemanticLoading(false);
      setLoading(false);
    }
  }, [search, allReports]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: ListReportsParams = {
        status: "approved",
        search: debouncedSearch || undefined,
        limit: 50,
        sort,
        reportType: reportTypeFilter !== "all" ? reportTypeFilter : undefined,
        academicYear: academicYearFilter !== "all" ? academicYearFilter : undefined,
        semester: semesterFilter !== "all" ? semesterFilter : undefined,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
      };
      const data = await listReports(params);
      const items: Report[] = data.items || [];
      const filtered =
        fileTypeFilter === "all"
          ? items
          : items.filter((r) => r.file_type?.toLowerCase() === fileTypeFilter);
      setReports(filtered);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, fileTypeFilter, reportTypeFilter, academicYearFilter, semesterFilter, departmentFilter]);

  useEffect(() => {
    if (!isSemanticMode) {
      fetchReports();
    }
  }, [fetchReports, isSemanticMode]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isSemanticMode) {
      e.preventDefault();
      handleSemanticSearch();
    }
  };

  const toggleSearchMode = () => {
    const nextMode = !isSemanticMode;
    setIsSemanticMode(nextMode);
    setSemanticMatches([]);
    setSemanticQuery("");
    if (!nextMode) {
      setDebouncedSearch(search);
    }
  };

  const activeFilterCount = [reportTypeFilter, academicYearFilter, semesterFilter, departmentFilter].filter(
    (f) => f !== "all"
  ).length + (fileTypeFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setFileTypeFilter("all");
    setReportTypeFilter("all");
    setAcademicYearFilter("all");
    setSemesterFilter("all");
    setDepartmentFilter("all");
  };

  /* Collect unique values from loaded reports for dynamic filter dropdowns */
  const uniqueAcademicYears = Array.from(new Set(reports.map(resolveAcademicYear).filter(Boolean))) as string[];
  const uniqueSemesters = Array.from(new Set(reports.map(resolveSemester).filter(Boolean))) as string[];
  const uniqueDepartments = Array.from(new Set(reports.map((r) => r.department).filter(Boolean))) as string[];

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-[#F3F6FA] p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <h2 className="mb-2 text-3xl font-black tracking-tight text-[#0F172A] md:text-4xl">
            Thư viện tài liệu
          </h2>
          <p className="max-w-2xl text-base text-slate-500">
            Tìm kiếm và truy cập các báo cáo, tài liệu đã được phê duyệt từ hệ thống.
          </p>
        </header>

        {/* Search */}
        <div className="mb-4 space-y-2">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              {isSemanticMode ? (
                <Brain size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
              ) : (
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={
                  isSemanticMode
                    ? "Mô tả nội dung bạn muốn tìm, VD: \"đề tài sử dụng CNN để nhận dạng\"..."
                    : "Tìm kiếm theo tiêu đề, tác giả, GVHD, từ khóa..."
                }
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-20 text-sm text-[#0F172A] shadow-sm placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                  isSemanticMode
                    ? "border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                    : "border-[#E5E7EB] focus:border-brand/40 focus:ring-brand/15"
                }`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      if (isSemanticMode) {
                        setSemanticMatches([]);
                        setSemanticQuery("");
                        setReports(allReports);
                      }
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-slate-700"
                  >
                    Xóa
                  </button>
                )}
                {isSemanticMode && search.trim() && (
                  <button
                    type="button"
                    onClick={handleSemanticSearch}
                    disabled={semanticLoading}
                    className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                  >
                    {semanticLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white border-t-transparent" />
                    ) : (
                      <Zap size={11} />
                    )}
                    Tìm
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSearchMode}
              title={isSemanticMode ? "Chuyển sang tìm kiếm thường" : "Chuyển sang tìm kiếm AI thông minh"}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-all ${
                isSemanticMode
                  ? "border-purple-300 bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700"
                  : "border-[#E5E7EB] bg-white text-slate-500 shadow-sm hover:border-purple-200 hover:text-purple-600"
              }`}
            >
              <Brain size={16} />
              <span className="hidden sm:inline">{isSemanticMode ? "AI Search" : "AI Search"}</span>
            </button>
          </div>

          {isSemanticMode && (
            <div className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-2">
              <Sparkles size={14} className="shrink-0 text-purple-500" />
              <p className="text-xs text-purple-700">
                <span className="font-semibold">Tìm kiếm AI:</span> Mô tả nội dung bạn muốn tìm bằng ngôn ngữ tự nhiên, rồi nhấn{" "}
                <kbd className="rounded border border-purple-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                  Enter
                </kbd>{" "}
                hoặc nút <span className="font-semibold">Tìm</span>. Hệ thống sẽ tìm các tài liệu có nội dung liên quan nhất.
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          {/* Basic row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter size={13} /> Bộ lọc:
            </span>

            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass}>
              <option value="recent">Mới nhất</option>
              <option value="popular">Lượt xem nhiều nhất</option>
              <option value="rated">Đánh giá cao</option>
              <option value="downloads">Lượt tải nhiều nhất</option>
            </select>

            <select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)} className={selectClass}>
              <option value="all">Tất cả file</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="zip">ZIP</option>
            </select>

            <select value={reportTypeFilter} onChange={(e) => setReportTypeFilter(e.target.value)} className={selectClass}>
              <option value="all">Tất cả loại</option>
              <option value="project">Đồ án môn học</option>
              <option value="thesis">Khóa luận TN</option>
              <option value="research">NCKH</option>
              <option value="internship">Thực tập</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                showAdvanced || activeFilterCount > 0
                  ? "border-brand/30 bg-brand/5 text-brand"
                  : "border-[#E5E7EB] bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              Nâng cao
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={12} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
              >
                <X size={12} /> Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Advanced row */}
          {showAdvanced && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {uniqueAcademicYears.length > 0 && (
                <select
                  value={academicYearFilter}
                  onChange={(e) => setAcademicYearFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Tất cả năm học</option>
                  {uniqueAcademicYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}

              {uniqueSemesters.length > 0 && (
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Tất cả học kỳ</option>
                  {uniqueSemesters.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}

              {uniqueDepartments.length > 0 && (
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Tất cả khoa</option>
                  {uniqueDepartments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}

              {uniqueAcademicYears.length === 0 && uniqueSemesters.length === 0 && uniqueDepartments.length === 0 && (
                <span className="text-xs text-slate-400">
                  Chưa có dữ liệu năm học / học kỳ / khoa để lọc
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading || semanticLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className={`h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent ${semanticLoading ? "border-purple-500" : "border-brand"}`} />
            <span className="ml-3 text-sm text-slate-500">
              {semanticLoading ? "AI đang tìm kiếm nội dung liên quan..." : "Đang tìm kiếm..."}
            </span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 text-center">
            {isSemanticMode && semanticQuery ? (
              <>
                <Brain size={48} className="mx-auto mb-4 text-purple-200" />
                <p className="mb-1 text-lg font-medium text-slate-500">
                  Không tìm thấy tài liệu liên quan
                </p>
                <p className="text-sm text-slate-400">
                  Thử mô tả lại nội dung theo cách khác hoặc dùng tìm kiếm thường
                </p>
              </>
            ) : (
              <>
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="mb-1 text-lg font-medium text-slate-500">
                  {search || activeFilterCount > 0
                    ? "Không tìm thấy báo cáo phù hợp"
                    : isSemanticMode
                    ? "Nhập mô tả nội dung và nhấn Enter để tìm kiếm AI"
                    : "Chưa có báo cáo công khai nào"}
                </p>
                {(search || activeFilterCount > 0) && !isSemanticMode && (
                  <p className="text-sm text-slate-400">Thử từ khóa khác hoặc xóa bộ lọc</p>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-xs font-medium text-slate-400">
                {reports.length} kết quả
                {isSemanticMode && semanticQuery ? (
                  <> cho tìm kiếm AI &ldquo;{semanticQuery}&rdquo;</>
                ) : (
                  search && <> cho &ldquo;{search}&rdquo;</>
                )}
              </p>
              {isSemanticMode && semanticMatches.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                  <Brain size={10} /> Semantic Search
                </span>
              )}
            </div>

            <div className="space-y-3">
              {reports.map((report, idx) => {
                const rType = resolveReportType(report);
                const rYear = resolveAcademicYear(report);
                const rSemester = resolveSemester(report);
                const authorDisplay = report.student_code
                  ? `${report.author_name} (${report.student_code})`
                  : report.author_name;
                const matchScore = semanticMatches.find((m) => String(m.id) === String(report.id))?.score;

                return (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/student/feedback?reportId=${report.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/student/feedback?reportId=${report.id}`);
                    }}
                    role="button"
                    tabIndex={0}
                    className="group cursor-pointer rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-start md:gap-5">
                      {/* Left: File icon + badges */}
                      <div className="flex shrink-0 items-start gap-4 md:flex-col md:items-center md:gap-2">
                        <FileIcon type={report.file_type} />
                        <div className="flex flex-wrap gap-1.5 md:flex-col md:items-center">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {report.file_type?.toUpperCase() || "FILE"}
                          </span>
                          {idx === 0 && (
                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                              Nổi bật
                            </span>
                          )}
                          {rType && (
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${REPORT_TYPE_STYLES[rType] || "border-slate-200 bg-slate-50 text-slate-600"}`}
                            >
                              {REPORT_TYPE_LABELS[rType] || rType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center: Info & metadata */}
                      <div className="min-w-0 flex-1">
                        {/* Title + year badge */}
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#0F172A] transition-colors group-hover:text-brand md:text-lg">
                            {report.title}
                          </h3>
                          {isSemanticMode && matchScore != null && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                              <Zap size={9} />
                              {(matchScore * 100).toFixed(0)}% liên quan
                            </span>
                          )}
                          {rYear && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {rYear}
                            </span>
                          )}
                          {rSemester && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {rSemester}
                            </span>
                          )}
                        </div>

                        {/* Description / abstract */}
                        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                          {report.abstract || report.description || "Không có mô tả"}
                        </p>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
                          <MetaItem icon={User} title="Tác giả" value={authorDisplay} />
                          <MetaItem
                            icon={GraduationCap}
                            title="Giảng viên hướng dẫn"
                            value={report.supervisor_name}
                          />
                          <MetaItem
                            icon={BookOpen}
                            title="Môn học"
                            value={
                              report.course_name
                                ? report.course_code
                                  ? `${report.course_name} (${report.course_code})`
                                  : report.course_name
                                : null
                            }
                          />
                          <MetaItem
                            icon={Users}
                            title="Lớp"
                            value={report.class_name}
                          />
                          <MetaItem
                            icon={Building2}
                            title="Khoa / Ngành"
                            value={
                              report.department
                                ? report.major
                                  ? `${report.department} - ${report.major}`
                                  : report.department
                                : report.major || null
                            }
                          />
                          <MetaItem
                            icon={Calendar}
                            title="Ngày nộp"
                            value={formatDate(report.submitted_at) || formatDate(report.created_at)}
                          />
                          <MetaItem icon={HardDrive} title="Dung lượng" value={formatSize(report.file_size)} />
                          {report.project_title && (
                            <MetaItem icon={BookOpen} title="Đề tài" value={report.project_title} />
                          )}
                        </div>

                        {/* Tags */}
                        {report.tags && report.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Tag size={11} className="text-slate-400" />
                            {report.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Eye size={12} /> {report.view_count ?? 0} lượt xem
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Download size={12} /> {report.download_count ?? 0} lượt tải
                          </span>
                          {Number(report.avg_rating) > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Star size={12} className="text-amber-400" />
                              {Number(report.avg_rating).toFixed(1)} ({report.rating_count})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-stretch md:gap-2">
                        <button
                          type="button"
                          title="Chat AI với tài liệu"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/chat?reportId=${report.id}`);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                        >
                          <MessageSquare size={13} />
                          <span className="hidden sm:inline">Chat AI</span>
                        </button>
                        <button
                          type="button"
                          title="Tải báo cáo"
                          onClick={(e) => {
                            e.stopPropagation();
                            void downloadReportInBrowser(report.id, report.file_name);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand/90"
                        >
                          <Download size={13} />
                          <span className="hidden sm:inline">Tải file</span>
                        </button>
                        <div className="hidden items-center text-slate-300 md:flex">
                          <ChevronRight size={16} />
                        </div>
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
