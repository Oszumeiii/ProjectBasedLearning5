import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  Users,
  MessageSquare,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Download,
  Send,
  Pin,
  X,
} from "lucide-react";
import { getCourseById } from "../../classroom/services/course.service";
import { downloadReportInBrowser } from "../../classroom/services/report.service";
import { useAssignments } from "../../../context/AssignmentContext";
import {
  downloadAssignmentAttachmentInBrowser,
  type AssignmentAttachmentInput,
  type AssignmentSubmission,
  type AssignmentType,
} from "../../classroom/services/assignment.service";
import {
  downloadClassPostAttachmentInBrowser,
  type ClassPost,
  type ClassPostAttachmentInput,
  type ClassPostComment,
} from "../../classroom/services/classPost.service";

interface CourseDetail {
  id: number;
  name: string;
  code: string;
  description: string | null;
  lecturer_name: string | null;
  student_count: number;
  report_count: number;
  students: Array<{
    id: number;
    full_name: string;
    email: string;
    major: string | null;
  }>;
}

type Tab = "posts" | "assignments" | "students";
type AssignmentPanelTab = "submissions" | "feedback";

/** Backend vẫn lưu cột max_score; ẩn khỏi UI, dùng giá trị cố định. */
const ASSIGNMENT_DEFAULT_MAX_SCORE = 10;

const TYPE_LABEL: Record<string, string> = {
  report: "Báo cáo",
  exercise: "Bài tập",
  project: "Đồ án",
  quiz: "Kiểm tra",
};
const TYPE_COLOR: Record<string, string> = {
  report: "bg-blue-500/15 text-blue-400",
  exercise: "bg-amber-500/15 text-amber-400",
  project: "bg-purple-500/15 text-purple-400",
  quiz: "bg-emerald-500/15 text-emerald-400",
};

export const InstructorClassroomPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const cid = Number(courseId) || 1;

  const {
    getAssignmentsByCourse,
    getPostsByCourse,
    ensureCourseData,
    createAssignment,
    gradeSubmission,
    addPost,
    addComment,
    getAssignmentStats,
  } = useAssignments();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("posts");

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formType, setFormType] = useState<AssignmentType>("report");
  const [formAttachments, setFormAttachments] = useState<AssignmentAttachmentInput[]>([]);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [assignmentPanelTab, setAssignmentPanelTab] = useState<Record<number, AssignmentPanelTab>>({});
  const [newPostContent, setNewPostContent] = useState("");
  const [postAttachments, setPostAttachments] = useState<ClassPostAttachmentInput[]>([]);
  const postAttachmentInputRef = useRef<HTMLInputElement>(null);

  const assignments = getAssignmentsByCourse(cid);
  const posts = getPostsByCourse(cid);

  useEffect(() => {
    if (!courseId) return;
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(Number(courseId));
        setCourse(courseData);
        await ensureCourseData(cid);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [courseId, cid, ensureCourseData]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next: AssignmentAttachmentInput[] = [...formAttachments];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (next.some((a) => a.name === f.name)) continue;
      next.push({ file: f, name: f.name, size: formatFileSize(f.size) });
    }
    setFormAttachments(next);
    e.target.value = "";
  };

  const removeFormAttachment = (name: string) => {
    setFormAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handlePostAttachmentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next: ClassPostAttachmentInput[] = [...postAttachments];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (next.some((a) => a.name === f.name)) continue;
      next.push({ file: f, name: f.name, size: formatFileSize(f.size) });
    }
    setPostAttachments(next);
    e.target.value = "";
  };

  const removePostAttachment = (name: string) => {
    setPostAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handleCreateAssignment = async () => {
    if (!formTitle.trim()) return;
    setSavingAssignment(true);
    try {
      await createAssignment({
        courseId: cid,
        title: formTitle,
        description: formDesc,
        deadline: formDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        maxScore: ASSIGNMENT_DEFAULT_MAX_SCORE,
        type: formType,
        attachments: formAttachments,
      });
      setShowForm(false);
      setFormTitle("");
      setFormDesc("");
      setFormDeadline("");
      setFormType("report");
      setFormAttachments([]);
    } catch (e) {
      console.error(e);
      alert("Không tạo được bài tập");
    } finally {
      setSavingAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-ink-muted">Đang tải...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-red-400">Không tìm thấy lớp học</div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "posts", label: "Bảng tin", icon: <MessageSquare size={16} /> },
    {
      key: "assignments",
      label: "Bài tập",
      icon: <ClipboardList size={16} />,
      count: assignments.length,
    },
    {
      key: "students",
      label: "Sinh viên",
      icon: <Users size={16} />,
      count: course.student_count,
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/instructor/lobby")}
          className="text-xs text-ink-muted hover:text-brand mb-2 flex items-center gap-1"
        >
          ← Quay lại danh sách lớp
        </button>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-1">
              {course.code}
            </p>
            <h2 className="text-2xl font-extrabold text-ink-heading tracking-tight">
              {course.name}
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              {course.lecturer_name} • {course.student_count} sinh viên
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-app-line mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink-body"
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span className="rounded-full bg-app-track px-1.5 py-0.5 text-[10px] text-ink-heading">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Bảng tin ── */}
      {tab === "posts" && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 bg-app-card rounded-xl border border-app-line">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-app-elevated text-xs font-bold text-ink-heading">
                {course.lecturer_name?.charAt(0) || "G"}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Đăng thông báo cho lớp học..."
                  rows={2}
                  className="w-full bg-app-inset border border-app-line rounded-lg px-4 py-2.5 text-sm text-ink-heading placeholder:text-ink-muted focus:ring-1 focus:ring-brand/25 resize-none"
                />
                <div className="flex justify-between items-center mt-2 gap-3">
                  <div className="flex-1">
                    <input
                      ref={postAttachmentInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handlePostAttachmentPick}
                    />
                    <button
                      type="button"
                      onClick={() => postAttachmentInputRef.current?.click()}
                      className="text-xs text-ink-muted hover:text-ink-body flex items-center gap-1"
                    >
                      <Paperclip size={14} /> Đính kèm
                    </button>
                    {postAttachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {postAttachments.map((att) => (
                          <li
                            key={att.name}
                            className="flex items-center justify-between gap-2 rounded-lg bg-app-inset border border-app-line px-3 py-1.5 text-xs text-ink-body"
                          >
                            <span className="truncate flex items-center gap-1.5">
                              <Paperclip size={12} className="shrink-0 text-mint" />
                              <span className="truncate">{att.name}</span>
                              <span className="text-ink-muted shrink-0">{att.size}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removePostAttachment(att.name)}
                              className="p-0.5 rounded text-ink-muted hover:text-red-400 hover:bg-red-500/10 shrink-0"
                              aria-label="Xóa file"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (!newPostContent.trim()) return;
                      void addPost({
                        courseId: cid,
                        content: newPostContent,
                        isPinned: false,
                        attachments: postAttachments,
                      });
                      setNewPostContent("");
                      setPostAttachments([]);
                    }}
                    disabled={!newPostContent.trim()}
                    className="px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-hover disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send size={12} /> Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {[...posts]
            .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
            .map((post) => (
              <PostCard key={post.id} post={post} onAddComment={(content) => addComment(post.id, content)} />
            ))}
        </div>
      )}

      {/* ── Tab: Bài tập ── */}
      {tab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-ink-muted">
              {assignments.length} bài tập đã tạo
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-whisper"
            >
              <Plus size={16} /> Tạo bài tập mới
            </button>
          </div>

          {showForm && (
            <div className="p-6 bg-app-card rounded-xl border border-brand/20 animate-in slide-in-from-top-2 duration-300">
              <h4 className="text-ink-heading font-bold mb-4 text-sm">
                Tạo bài tập mới
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Nộp báo cáo tiến độ Sprint 2"
                    className="w-full bg-app-inset border border-app-line rounded-lg px-4 py-2.5 text-sm text-ink-heading placeholder:text-ink-muted focus:ring-1 focus:ring-brand/25"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Loại</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AssignmentType)}
                    className="w-full bg-app-inset border border-app-line rounded-lg px-3 py-2.5 text-sm text-ink-heading focus:ring-1 focus:ring-brand/25"
                  >
                    <option value="report">Báo cáo</option>
                    <option value="exercise">Bài tập</option>
                    <option value="project">Đồ án</option>
                    <option value="quiz">Kiểm tra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-app-inset border border-app-line rounded-lg px-4 py-2.5 text-sm text-ink-heading focus:ring-1 focus:ring-brand/25"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Đính kèm</label>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleAttachmentPick}
                  />
                  <button
                    type="button"
                    onClick={() => attachmentInputRef.current?.click()}
                    className="w-full bg-app-inset border border-dashed border-app-line rounded-lg px-4 py-2.5 text-sm text-ink-muted hover:text-brand hover:border-brand/30 flex items-center gap-2 justify-center transition-colors"
                  >
                    <Paperclip size={14} /> Chọn file (PDF, Office, ảnh…)
                  </button>
                  {formAttachments.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {formAttachments.map((att) => (
                        <li
                          key={att.name}
                          className="flex items-center justify-between gap-2 rounded-lg bg-app-inset border border-app-line px-3 py-1.5 text-xs text-ink-body"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <Paperclip size={12} className="shrink-0 text-mint" />
                            <span className="truncate">{att.name}</span>
                            <span className="text-ink-muted shrink-0">{att.size}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFormAttachment(att.name)}
                            className="p-0.5 rounded text-ink-muted hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            aria-label="Xóa file"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-ink-muted mb-1">Mô tả & yêu cầu</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                    placeholder="Mô tả chi tiết yêu cầu bài tập..."
                    className="w-full bg-app-inset border border-app-line rounded-lg px-4 py-2.5 text-sm text-ink-heading placeholder:text-ink-muted focus:ring-1 focus:ring-brand/25 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormAttachments([]);
                  }}
                  className="px-4 py-2 text-sm text-ink-muted hover:text-ink-heading"
                >
                  Hủy
                </button>
                <button
                  onClick={() => void handleCreateAssignment()}
                  disabled={!formTitle.trim() || savingAssignment}
                  className="px-5 py-2 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-hover disabled:opacity-50"
                >
                  {savingAssignment ? "Đang tạo..." : "Tạo bài tập"}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {assignments.map((a) => {
              const stats = getAssignmentStats(a);
              const isExpanded = expandedAssignment === a.id;
              return (
                <div key={a.id} className="bg-app-card rounded-xl border border-app-line overflow-hidden">
                  <div
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedAssignment(null);
                      } else {
                        setExpandedAssignment(a.id);
                        setAssignmentPanelTab((prev) => ({ ...prev, [a.id]: prev[a.id] ?? "submissions" }));
                      }
                    }}
                    className="p-5 cursor-pointer hover:bg-app-elevated transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLOR[a.assignment_type]}`}>
                          <ClipboardList size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-ink-heading text-sm">{a.title}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${TYPE_COLOR[a.assignment_type]}`}>
                              {TYPE_LABEL[a.assignment_type]}
                            </span>
                          </div>
                          {a.description && (
                            <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-2">
                              {a.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-ink-muted">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {stats.isOverdue ? (
                                <span className="text-red-400">Đã hết hạn {new Date(a.deadline).toLocaleDateString("vi-VN")}</span>
                              ) : (
                                <span>Hạn: {new Date(a.deadline).toLocaleDateString("vi-VN")} {new Date(a.deadline).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                              )}
                            </span>
                            {a.attachments.length > 0 && (
                              <span className="flex items-center gap-1"><Paperclip size={12} /> {a.attachments.length} file</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-ink-heading">{stats.submitted}/{stats.total}</div>
                          <div className="text-[10px] text-ink-muted">đã nộp</div>
                        </div>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-app-track">
                          <div
                            className="h-full bg-gradient-to-r from-brand to-mint rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-app-line animate-in slide-in-from-top-1 duration-200">
                      {a.description && (
                        <div className="px-5 pt-4 pb-2">
                          <p className="text-sm text-ink-muted leading-relaxed">{a.description}</p>
                        </div>
                      )}
                      {a.attachments.length > 0 && (
                        <div className="px-5 py-2 flex gap-2 flex-wrap">
                          {a.attachments.map((att, index) => (
                            <button
                              key={`${att.name}-${index}`}
                              type="button"
                              onClick={() => {
                                void downloadAssignmentAttachmentInBrowser(a.id, index, att.name).catch(
                                  (error) => {
                                    console.error(error);
                                    alert("Không tải được file đính kèm");
                                  }
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-app-inset rounded-lg text-xs text-ink-muted border border-app-line hover:border-brand/30 hover:text-brand"
                            >
                              <Paperclip size={12} /> {att.name} <span className="text-ink-muted">{att.size}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="px-5 py-3 flex gap-6 text-xs border-t border-app-line">
                        <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> {stats.graded} đã nhận xét</span>
                        <span className="flex items-center gap-1 text-blue-400"><FileText size={14} /> {stats.submitted - stats.graded} chờ nhận xét</span>
                        <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={14} /> {stats.total - stats.submitted} chưa nộp</span>
                      </div>
                      <div className="px-5 flex gap-1 border-b border-app-line">
                        {(["submissions", "feedback"] as const).map((key) => {
                          const active = (assignmentPanelTab[a.id] ?? "submissions") === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignmentPanelTab((prev) => ({ ...prev, [a.id]: key }));
                              }}
                              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-colors ${
                                active
                                  ? "border-brand text-brand bg-app-inset"
                                  : "border-transparent text-ink-muted hover:text-ink-body"
                              }`}
                            >
                              {key === "submissions" ? "Bài nộp" : "Nhận xét"}
                            </button>
                          );
                        })}
                      </div>
                      {(assignmentPanelTab[a.id] ?? "submissions") === "submissions" ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-app-inset text-[10px] text-ink-muted uppercase tracking-wider">
                                <th className="text-left px-5 py-2 font-semibold">Sinh viên</th>
                                <th className="text-left px-3 py-2 font-semibold">Trạng thái</th>
                                <th className="text-left px-3 py-2 font-semibold">Nộp lúc</th>
                                <th className="text-left px-3 py-2 font-semibold">File</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(a.submissions ?? []).map((sub) => (
                                <SubmissionSummaryRow key={sub.id} submission={sub} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="px-5 py-4 space-y-4 max-h-[480px] overflow-y-auto">
                          {(a.submissions ?? []).map((sub) => (
                            <FeedbackEntryRow
                              key={sub.id}
                              submission={sub}
                              onSave={(payload) => gradeSubmission(a.id, sub.id, payload)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Sinh viên ── */}
      {tab === "students" && (
        <div className="max-w-3xl">
          <p className="text-sm text-ink-muted mb-4">{course.student_count} sinh viên</p>
          {course.students.length === 0 ? (
            <div className="p-12 bg-app-card rounded-xl text-center text-ink-muted">Chưa có sinh viên</div>
          ) : (
            <div className="bg-app-card rounded-xl border border-app-line overflow-hidden">
              {course.students.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-app-elevated transition-colors ${i < course.students.length - 1 ? "border-b border-app-line" : ""}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-app-line bg-app-elevated text-xs font-bold text-ink-heading">
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-heading truncate">{s.full_name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{s.email}{s.major && ` • ${s.major}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

/* ────────── Sub-components ────────── */

const SUBMISSION_STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  not_submitted: { label: "Chưa nộp", color: "text-red-400", bg: "bg-red-500/10" },
  submitted: { label: "Đã nộp", color: "text-blue-400", bg: "bg-blue-500/10" },
  late: { label: "Nộp muộn", color: "text-amber-400", bg: "bg-amber-500/10" },
  graded: { label: "Đã nhận xét", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

function SubmissionSummaryRow({ submission }: { submission: AssignmentSubmission }) {
  const st = SUBMISSION_STATUS_STYLE[submission.status] || SUBMISSION_STATUS_STYLE.not_submitted;
  return (
    <tr className="border-t border-app-line hover:bg-app-elevated transition-colors">
      <td className="px-5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-app-elevated text-[10px] font-bold text-ink-heading">
            {(submission.student_name ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-xs font-medium text-ink-heading">{submission.student_name}</p>
            <p className="text-[10px] text-ink-muted">{submission.student_email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.color}`}>
          {st.label}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-ink-muted">
        {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString("vi-VN") : "—"}
      </td>
      <td className="px-3 py-2.5">
        {submission.report_id && submission.report_file_name ? (
          <button
            type="button"
            onClick={() => void downloadReportInBrowser(submission.report_id!, submission.report_file_name)}
            className="text-xs text-ink-muted flex items-center gap-1 hover:text-brand"
          >
            <Download size={12} />
            {submission.report_file_name.length > 25
              ? `${submission.report_file_name.slice(0, 25)}...`
              : submission.report_file_name}
          </button>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        )}
      </td>
    </tr>
  );
}

function FeedbackEntryRow({
  submission,
  onSave,
}: {
  submission: AssignmentSubmission;
  onSave: (payload: { feedback: string }) => Promise<void>;
}) {
  const [text, setText] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(submission.feedback ?? "");
  }, [submission.id, submission.feedback]);

  const st = SUBMISSION_STATUS_STYLE[submission.status] || SUBMISSION_STATUS_STYLE.not_submitted;
  const canEdit = submission.status === "submitted" || submission.status === "late" || submission.status === "graded";

  return (
    <div className="rounded-xl border border-app-line bg-app-inset p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-elevated text-[10px] font-bold text-ink-heading">
            {(submission.student_name ?? "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-heading truncate">{submission.student_name}</p>
            <p className="text-[10px] text-ink-muted truncate">{submission.student_email}</p>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.color}`}>
          {st.label}
        </span>
      </div>
      {submission.report_id && submission.report_file_name && (
        <button
          type="button"
          onClick={() => void downloadReportInBrowser(submission.report_id!, submission.report_file_name)}
          className="mb-3 text-[11px] text-brand flex items-center gap-1 hover:text-brand"
        >
          <Download size={12} />
          {submission.report_file_name}
        </button>
      )}
      {!canEdit ? (
        <p className="text-xs text-ink-muted">Sinh viên chưa nộp bài — chưa thể gửi nhận xét.</p>
      ) : (
        <>
          <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
            Nhận xét của giảng viên
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Viết nhận xét cho bài nộp..."
            className="w-full bg-app-card border border-app-line rounded-lg px-3 py-2 text-xs text-ink-heading placeholder:text-ink-muted focus:ring-1 focus:ring-brand/25 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              disabled={!text.trim() || saving}
              onClick={() => {
                void (async () => {
                  setSaving(true);
                  try {
                    await onSave({ feedback: text.trim() });
                  } catch (err) {
                    console.error(err);
                    const msg =
                      err && typeof err === "object" && "response" in err
                        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                        : undefined;
                    alert(
                      typeof msg === "string" && msg.trim()
                        ? msg
                        : "Không lưu được nhận xét. Kiểm tra kết nối hoặc thử đăng nhập lại."
                    );
                  } finally {
                    setSaving(false);
                  }
                })();
              }}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu nhận xét"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PostCard({ post, onAddComment }: { post: ClassPost; onAddComment: (content: string) => void }) {
  const [showComments, setShowComments] = useState(post.comments.length <= 2);
  const [replyText, setReplyText] = useState("");

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="bg-app-card rounded-xl border border-app-line overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${post.author_role === "lecturer" ? "border border-brand/30 bg-app-elevated text-ink-heading" : "border border-app-line bg-app-elevated text-ink-heading"}`}>
            {(post.author_name ?? "?").charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink-heading">{post.author_name}</span>
              {post.author_role === "lecturer" && <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-bold">Giảng viên</span>}
              {post.is_pinned && <Pin size={12} className="text-amber-400" />}
              <span className="text-[10px] text-ink-muted">{timeAgo(post.created_at)}</span>
            </div>
            <p className="text-sm text-ink-body mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {post.attachments.map((att: { name: string; size?: string }, index: number) => (
                  <button
                    key={`${att.name}-${index}`}
                    type="button"
                    onClick={() => {
                      void downloadClassPostAttachmentInBrowser(post.id, index, att.name).catch(
                        (error) => {
                          console.error(error);
                          alert("Không tải được file đính kèm");
                        }
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-app-inset rounded-lg text-xs text-ink-muted border border-app-line hover:border-brand/30 hover:text-brand"
                  >
                    <Paperclip size={12} /> {att.name} <span className="text-ink-muted">{att.size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-app-line bg-app-inset">
        {post.comments.length > 0 && (
          <>
            {!showComments && post.comments.length > 2 && (
              <button onClick={() => setShowComments(true)} className="w-full py-2 text-xs text-brand hover:text-brand">
                Xem {post.comments.length} bình luận
              </button>
            )}
            {showComments && (
              <div className="px-5 py-3 space-y-3">
                {post.comments.map((c: ClassPostComment) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${c.author_role === "lecturer" ? "border border-brand/25 bg-app-elevated text-ink-heading" : "bg-app-elevated text-ink-heading"}`}>{(c.author_name ?? "?").charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink-body">{c.author_name}</span>
                        {c.author_role === "lecturer" && <span className="text-[8px] bg-brand/10 text-brand px-1 py-0.5 rounded font-bold">GV</span>}
                        <span className="text-[10px] text-ink-muted">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div className="px-5 py-2 flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && replyText.trim()) {
                onAddComment(replyText);
                setReplyText("");
              }
            }}
            placeholder="Trả lời..."
            className="flex-1 bg-transparent border-none text-xs text-ink-body placeholder:text-ink-muted focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onAddComment(replyText);
              setReplyText("");
            }}
            disabled={!replyText.trim()}
            className="text-brand hover:text-brand disabled:text-ink-faint"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
