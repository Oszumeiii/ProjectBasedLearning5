import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
  Download,
  ChevronRight,
  BookOpen,
  User,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Save,
  ExternalLink,
} from "lucide-react";
import {
  listReports,
  checkReportPlagiarism,
  patchReportReviewNote,
  downloadReportInBrowser,
  type Report,
  type PlagiarismCheckResult,
} from "../../classroom/services/report.service";
import { getMyCourses, type Course } from "../../classroom/services/course.service";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  under_review: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  revision_needed: "Cần sửa",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-900",
  processing: "border-blue-200 bg-blue-50 text-blue-800",
  under_review: "border-violet-200 bg-violet-50 text-violet-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
  rejected: "border-red-200 bg-red-50 text-red-800",
  revision_needed: "border-orange-200 bg-orange-50 text-orange-900",
};

function normalizeReport(row: Record<string, unknown>): Report {
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    description: row.description != null ? String(row.description) : null,
    status: String(row.status ?? ""),
    file_url: row.file_url != null ? String(row.file_url) : null,
    file_name: row.file_name != null ? String(row.file_name) : null,
    file_type: row.file_type != null ? String(row.file_type) : null,
    file_size: row.file_size != null ? Number(row.file_size) : null,
    visibility: String(row.visibility ?? ""),
    view_count: Number(row.view_count ?? 0),
    content: row.content != null ? String(row.content) : null,
    project_id: row.project_id != null ? Number(row.project_id) : null,
    course_id: row.course_id != null ? Number(row.course_id) : null,
    course_name: row.course_name != null ? String(row.course_name) : null,
    research_paper_id: row.research_paper_id != null ? Number(row.research_paper_id) : null,
    author_id: Number(row.author_id),
    author_name: String(row.author_name ?? ""),
    author_email: String(row.author_email ?? ""),
    reviewer_name: row.reviewer_name != null ? String(row.reviewer_name) : null,
    review_note: row.review_note != null ? String(row.review_note) : null,
    reviewed_at: row.reviewed_at != null ? String(row.reviewed_at) : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export const InstructorGradingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState<number | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismCheckResult | null>(null);
  const lastHydratedReportId = useRef<number | null>(null);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const loadCourses = useCallback(async () => {
    try {
      const items = await getMyCourses();
      setCourses(items);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReports({
        limit: 100,
        sort: "newest",
        courseId: courseFilter === "all" ? undefined : courseFilter,
        search: searchApplied.trim() || undefined,
      });
      const items = (data.items || []).map((row: Record<string, unknown>) => normalizeReport(row));
      setReports(items);
      setSelectedId((prev) => {
        if (prev != null && items.some((r: Report) => r.id === prev)) return prev;
        return items[0]?.id ?? null;
      });
    } catch (e) {
      console.error(e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [courseFilter, searchApplied]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (selectedId == null) {
      lastHydratedReportId.current = null;
      setReviewDraft("");
      setPlagiarismResult(null);
      return;
    }
    const r = reports.find((x) => x.id === selectedId);
    if (!r) return;
    if (lastHydratedReportId.current !== selectedId) {
      lastHydratedReportId.current = selectedId;
      setReviewDraft(r.review_note ?? "");
      setPlagiarismResult(null);
    }
  }, [selectedId, reports]);

  const applySearch = () => {
    setSearchApplied(searchInput);
  };

  const runPlagiarismCheck = async () => {
    if (!selected) return;
    setPlagiarismLoading(true);
    setPlagiarismResult(null);
    try {
      const res = await checkReportPlagiarism(selected.id);
      setPlagiarismResult(res);
    } catch (e) {
      console.error(e);
      alert("Không chạy được kiểm tra RAG. Thử lại sau.");
    } finally {
      setPlagiarismLoading(false);
    }
  };

  const saveReviewNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    try {
      await patchReportReviewNote(selected.id, reviewDraft.trim());
      setReports((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, review_note: reviewDraft.trim() || null } : r
        )
      );
    } catch (e) {
      console.error(e);
      alert("Không lưu được nhận xét.");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-heading tracking-tight">
            Trung tâm chấm bài
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Danh sách báo cáo sinh viên đã nộp, lọc theo lớp, kiểm tra trùng lặp nội dung (RAG nội bộ) và
            ghi nhận xét.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted font-semibold uppercase tracking-wider">Lọc lớp</span>
          <div className="flex items-center gap-2 rounded-xl bg-app-card border border-app-line px-3 py-2">
            <GraduationCap size={16} className="text-mint shrink-0" />
            <select
              value={courseFilter === "all" ? "all" : String(courseFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setCourseFilter(v === "all" ? "all" : Number(v));
              }}
              className="bg-transparent text-sm text-ink-heading focus:outline-none min-w-[200px]"
            >
              <option value="all">Tất cả lớp của tôi</option>
              {courses.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[560px]">
        {/* Danh sách */}
        <section className="lg:w-[380px] shrink-0 flex flex-col rounded-2xl border border-app-line bg-app-card overflow-hidden">
          <div className="p-3 border-b border-app-line space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Tìm theo tiêu đề, mô tả..."
                className="min-w-0 flex-1 rounded-lg border border-app-line bg-app-inset px-3 py-2 text-xs text-ink-heading placeholder:text-ink-faint"
              />
              <button
                type="button"
                onClick={applySearch}
                className="shrink-0 p-2 rounded-lg bg-brand text-white hover:bg-brand-hover"
                aria-label="Tìm"
              >
                <Search size={16} />
              </button>
            </div>
            <p className="text-[10px] text-ink-muted px-1">
              {loading ? "Đang tải…" : `${reports.length} báo cáo`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-ink-muted text-sm gap-2">
                <Loader2 className="animate-spin" size={18} />
                Đang tải…
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-ink-muted text-sm">
                Không có báo cáo phù hợp. Thử đổi lớp hoặc bỏ tìm kiếm.
              </div>
            ) : (
              <ul className="divide-y divide-app-line">
                {reports.map((r) => {
                  const active = r.id === selectedId;
                  const st =
                    STATUS_CLASS[r.status] || "border-app-line bg-app-inset text-ink-muted";
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                          active ? "border-l-2 border-brand bg-brand/5" : "hover:bg-app-elevated"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-app-inset border border-app-line flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-mint" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink-heading line-clamp-2 leading-snug">{r.title}</p>
                          <p className="text-[11px] text-ink-muted mt-0.5 flex items-center gap-1 truncate">
                            <User size={11} className="shrink-0" />
                            {r.author_name}
                          </p>
                          {r.course_name && (
                            <p className="text-[10px] text-ink-muted mt-1 flex items-center gap-1 truncate">
                              <BookOpen size={10} />
                              {r.course_name}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${st}`}>
                              {STATUS_LABEL[r.status] || r.status}
                            </span>
                            <span className="text-[9px] text-ink-muted flex items-center gap-0.5">
                              <Calendar size={10} />
                              {new Date(r.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`shrink-0 mt-1 ${active ? "text-mint" : "text-ink-muted"}`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Chi tiết */}
        <section className="flex-1 rounded-2xl border border-app-line bg-app-card overflow-hidden flex flex-col min-h-[480px]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-ink-muted text-sm p-8">
              Chọn một báo cáo trong danh sách để xem chi tiết.
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-app-line bg-app-elevated">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-ink-heading leading-snug">{selected.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-mint" />
                        {selected.author_name}
                      </span>
                      {selected.course_name && (
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} className="text-emerald-400" />
                          {selected.course_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Nộp {new Date(selected.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        void downloadReportInBrowser(selected.id, selected.file_name ?? undefined).catch(
                          () => alert("Không tải được file.")
                        )
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-app-elevated border border-app-line text-xs font-semibold text-ink-heading hover:border-brand/35 hover:text-ink-heading"
                    >
                      <Download size={14} />
                      Tải file
                    </button>
                    <Link
                      to={`/instructor/grading-detail?reportId=${selected.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/15"
                    >
                      <ExternalLink size={14} />
                      Xem toàn trang
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* RAG / đạo văn */}
                <div className="rounded-xl border border-app-line bg-app-inset p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="text-amber-400" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-ink-heading">Kiểm tra trùng lặp (RAG nội bộ)</h4>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          So khớp nội dung văn bản đã trích xuất với các báo cáo khác trong cùng lớp.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={plagiarismLoading}
                      onClick={() => void runPlagiarismCheck()}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-hover disabled:opacity-50"
                    >
                      {plagiarismLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {plagiarismLoading ? "Đang chạy…" : "Chạy kiểm tra"}
                    </button>
                  </div>
                  {plagiarismResult && (
                    <div className="mt-3 space-y-3 text-xs">
                      {plagiarismResult.message && !plagiarismResult.analyzed && (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                          {plagiarismResult.message}
                        </p>
                      )}
                      {plagiarismResult.analyzed && (
                        <>
                          <p
                            className={`rounded-lg px-3 py-2 border ${
                              (plagiarismResult.maxSimilarityPercent ?? 0) >= 40
                                ? "border-red-200 bg-red-50 text-red-800"
                                : (plagiarismResult.maxSimilarityPercent ?? 0) >= 25
                                  ? "border-amber-200 bg-amber-50 text-amber-900"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
                            }`}
                          >
                            <span className="font-bold">Kết luận: </span>
                            {plagiarismResult.summary}
                            {typeof plagiarismResult.comparedCount === "number" && (
                              <span className="ml-1 text-ink-muted">
                                (Đã so {plagiarismResult.comparedCount} báo cáo trong lớp)
                              </span>
                            )}
                          </p>
                          {plagiarismResult.matches.length > 0 ? (
                            <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                              {plagiarismResult.matches.map((m) => (
                                <li
                                  key={m.reportId}
                                  className="flex items-center justify-between gap-2 bg-app-card border border-app-line rounded-lg px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-ink-heading font-medium truncate">{m.title}</p>
                                    <p className="text-[10px] text-ink-muted">{m.authorName}</p>
                                  </div>
                                  <span
                                    className={`shrink-0 font-mono font-bold ${
                                      m.similarityPercent >= 40
                                        ? "text-red-400"
                                        : m.similarityPercent >= 25
                                          ? "text-amber-400"
                                          : "text-ink-muted"
                                    }`}
                                  >
                                    {m.similarityPercent}%
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-ink-muted">Không có cặp trùng lặp đáng kể trong tập đã quét.</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Nhận xét */}
                <div className="rounded-xl border border-app-line bg-app-inset p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={18} className="text-mint" />
                    <h4 className="text-sm font-bold text-ink-heading">Nhận xét cho sinh viên</h4>
                  </div>
                  <p className="text-[11px] text-ink-muted mb-2">
                    Ghi chú hiển thị cùng báo cáo (trường nhận xét — không đổi trạng thái duyệt tự động).
                  </p>
                  <textarea
                    value={reviewDraft}
                    onChange={(e) => setReviewDraft(e.target.value)}
                    rows={5}
                    placeholder="Viết nhận xét, hướng chỉnh sửa…"
                    className="w-full resize-none rounded-lg border border-app-line bg-app-card px-3 py-2.5 text-sm text-ink-heading placeholder:text-ink-faint focus:ring-1 focus:ring-brand/25"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      disabled={savingNote}
                      onClick={() => void saveReviewNote()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {savingNote ? "Đang lưu…" : "Lưu nhận xét"}
                    </button>
                  </div>
                </div>

                {/* Trích xuất nhanh */}
                {selected.content && (
                  <div className="rounded-xl border border-app-line bg-app-inset p-4">
                    <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                      Đoạn văn bản trích xuất
                    </h4>
                    <div className="custom-scrollbar max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-ink-muted">
                      {selected.content.slice(0, 4000)}
                      {selected.content.length > 4000 ? "…" : ""}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
