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
  BarChart3,
  X,
} from "lucide-react";
import { getCourseById } from "../../classroom/services/course.service";
import { useAssignments } from "../../../context/AssignmentContext";
import {
  getAssignmentStats,
  type Assignment,
  type AssignmentSubmission,
  type ClassPost,
} from "../../../mocks/assignments";

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

type Tab = "posts" | "assignments" | "students" | "grades";

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
  } = useAssignments();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("posts");

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formMaxScore, setFormMaxScore] = useState("10");
  const [formType, setFormType] = useState<Assignment["type"]>("report");
  const [formAttachments, setFormAttachments] = useState<
    Array<{ name: string; size: string }>
  >([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [newPostContent, setNewPostContent] = useState("");

  const assignments = getAssignmentsByCourse(cid);
  const posts = getPostsByCourse(cid);

  useEffect(() => {
    if (!courseId) return;
    ensureCourseData(cid);
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(Number(courseId));
        setCourse(courseData);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, cid, ensureCourseData]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next: Array<{ name: string; size: string }> = [...formAttachments];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (next.some((a) => a.name === f.name)) continue;
      next.push({ name: f.name, size: formatFileSize(f.size) });
    }
    setFormAttachments(next);
    e.target.value = "";
  };

  const removeFormAttachment = (name: string) => {
    setFormAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const handleCreateAssignment = () => {
    if (!formTitle.trim()) return;
    createAssignment({
      courseId: cid,
      title: formTitle,
      description: formDesc,
      deadline: formDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      maxScore: Number(formMaxScore) || 10,
      createdBy: course?.lecturer_name || "Giảng viên",
      type: formType,
      attachments: formAttachments,
      submissions:
        course?.students.map((s, i) => ({
          id: Date.now() + i,
          assignmentId: 0,
          studentId: s.id,
          studentName: s.full_name,
          studentEmail: s.email,
          submittedAt: null,
          status: "not_submitted" as const,
          score: null,
          feedback: null,
          fileName: null,
          fileSize: null,
        })) || [],
    });
    setShowForm(false);
    setFormTitle("");
    setFormDesc("");
    setFormDeadline("");
    setFormMaxScore("10");
    setFormType("report");
    setFormAttachments([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải...</span>
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
    { key: "grades", label: "Điểm số", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/instructor/lobby")}
          className="text-xs text-slate-500 hover:text-indigo-400 mb-2 flex items-center gap-1"
        >
          ← Quay lại danh sách lớp
        </button>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
              {course.code}
            </p>
            <h2 className="text-2xl font-manrope font-extrabold text-[#dae2fd] tracking-tight">
              {course.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {course.lecturer_name} • {course.student_count} sinh viên
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === t.key
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Bảng tin ── */}
      {tab === "posts" && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 bg-[#131b2e] rounded-xl border border-slate-800/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                {course.lecturer_name?.charAt(0) || "G"}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Đăng thông báo cho lớp học..."
                  rows={2}
                  className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                    <Paperclip size={14} /> Đính kèm
                  </button>
                  <button
                    onClick={() => {
                      if (!newPostContent.trim()) return;
                      addPost({
                        courseId: cid,
                        authorName: course.lecturer_name || "Giảng viên",
                        authorRole: "lecturer",
                        content: newPostContent,
                        isPinned: false,
                        attachments: [],
                        comments: [],
                      });
                      setNewPostContent("");
                    }}
                    disabled={!newPostContent.trim()}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send size={12} /> Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {[...posts]
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
            .map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
        </div>
      )}

      {/* ── Tab: Bài tập ── */}
      {tab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">
              {assignments.length} bài tập đã tạo
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} /> Tạo bài tập mới
            </button>
          </div>

          {showForm && (
            <div className="p-6 bg-[#131b2e] rounded-xl border border-indigo-500/20 animate-in slide-in-from-top-2 duration-300">
              <h4 className="text-[#dae2fd] font-bold mb-4 text-sm">
                Tạo bài tập mới
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tiêu đề *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="VD: Nộp báo cáo tiến độ Sprint 2"
                    className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Loại</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as Assignment["type"])}
                      className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="report">Báo cáo</option>
                      <option value="exercise">Bài tập</option>
                      <option value="project">Đồ án</option>
                      <option value="quiz">Kiểm tra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Điểm tối đa</label>
                    <input
                      type="number"
                      value={formMaxScore}
                      onChange={(e) => setFormMaxScore(e.target.value)}
                      className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Đính kèm</label>
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
                    className="w-full bg-[#0b1326] border border-dashed border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 flex items-center gap-2 justify-center transition-colors"
                  >
                    <Paperclip size={14} /> Chọn file (PDF, Office, ảnh…)
                  </button>
                  {formAttachments.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {formAttachments.map((att) => (
                        <li
                          key={att.name}
                          className="flex items-center justify-between gap-2 rounded-lg bg-[#0b1326] border border-slate-800 px-3 py-1.5 text-xs text-slate-300"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <Paperclip size={12} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{att.name}</span>
                            <span className="text-slate-600 shrink-0">{att.size}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFormAttachment(att.name)}
                            className="p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
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
                  <label className="block text-xs text-slate-400 mb-1">Mô tả & yêu cầu</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                    placeholder="Mô tả chi tiết yêu cầu bài tập..."
                    className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 resize-none"
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
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  disabled={!formTitle.trim()}
                  onClick={handleCreateAssignment}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                  Tạo bài tập
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {assignments.map((a) => {
              const stats = getAssignmentStats(a);
              const isExpanded = expandedAssignment === a.id;
              return (
                <div key={a.id} className="bg-[#131b2e] rounded-xl border border-slate-800/50 overflow-hidden">
                  <div
                    onClick={() => setExpandedAssignment(isExpanded ? null : a.id)}
                    className="p-5 cursor-pointer hover:bg-[#171f33] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLOR[a.type]}`}>
                          <ClipboardList size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-[#dae2fd] text-sm">{a.title}</h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${TYPE_COLOR[a.type]}`}>
                              {TYPE_LABEL[a.type]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {stats.isOverdue ? (
                                <span className="text-red-400">Đã hết hạn {new Date(a.deadline).toLocaleDateString("vi-VN")}</span>
                              ) : (
                                <span>Hạn: {new Date(a.deadline).toLocaleDateString("vi-VN")} {new Date(a.deadline).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                              )}
                            </span>
                            <span>Điểm: {a.maxScore}</span>
                            {a.attachments.length > 0 && (
                              <span className="flex items-center gap-1"><Paperclip size={12} /> {a.attachments.length} file</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#dae2fd]">{stats.submitted}/{stats.total}</div>
                          <div className="text-[10px] text-slate-500">đã nộp</div>
                        </div>
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-[#4fdbc8] rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800 animate-in slide-in-from-top-1 duration-200">
                      {a.description && (
                        <div className="px-5 pt-4 pb-2">
                          <p className="text-sm text-slate-400 leading-relaxed">{a.description}</p>
                        </div>
                      )}
                      {a.attachments.length > 0 && (
                        <div className="px-5 py-2 flex gap-2 flex-wrap">
                          {a.attachments.map((att) => (
                            <span key={att.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1326] rounded-lg text-xs text-slate-400 border border-slate-800 hover:border-indigo-500/30 cursor-pointer">
                              <Paperclip size={12} /> {att.name} <span className="text-slate-600">{att.size}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="px-5 py-3 flex gap-6 text-xs border-t border-slate-800/50">
                        <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> {stats.graded} đã chấm</span>
                        <span className="flex items-center gap-1 text-blue-400"><FileText size={14} /> {stats.submitted - stats.graded} chờ chấm</span>
                        <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={14} /> {stats.total - stats.submitted} chưa nộp</span>
                        {stats.avgScore !== null && (
                          <span className="text-[#4fdbc8]">TB: {stats.avgScore.toFixed(1)}/{a.maxScore}</span>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#0b1326] text-[10px] text-slate-500 uppercase tracking-wider">
                              <th className="text-left px-5 py-2 font-semibold">Sinh viên</th>
                              <th className="text-left px-3 py-2 font-semibold">Trạng thái</th>
                              <th className="text-left px-3 py-2 font-semibold">Nộp lúc</th>
                              <th className="text-left px-3 py-2 font-semibold">File</th>
                              <th className="text-center px-3 py-2 font-semibold">Điểm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {a.submissions.map((sub) => (
                              <SubmissionRow key={sub.id} submission={sub} maxScore={a.maxScore} assignmentId={a.id} onGrade={gradeSubmission} />
                            ))}
                          </tbody>
                        </table>
                      </div>
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
          <p className="text-sm text-slate-400 mb-4">{course.student_count} sinh viên</p>
          {course.students.length === 0 ? (
            <div className="p-12 bg-[#131b2e] rounded-xl text-center text-slate-500">Chưa có sinh viên</div>
          ) : (
            <div className="bg-[#131b2e] rounded-xl border border-slate-800/50 overflow-hidden">
              {course.students.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#171f33] transition-colors ${i < course.students.length - 1 ? "border-b border-slate-800/30" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">{s.full_name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{s.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{s.email}{s.major && ` • ${s.major}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Điểm số ── */}
      {tab === "grades" && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Tổng hợp điểm số</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-[#131b2e] rounded-xl overflow-hidden border border-slate-800/50">
              <thead>
                <tr className="bg-[#0b1326] text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold sticky left-0 bg-[#0b1326]">Sinh viên</th>
                  {assignments.map((a) => (
                    <th key={a.id} className="text-center px-3 py-3 font-semibold min-w-[100px]">
                      <div className="truncate max-w-[120px]">{a.title}</div>
                      <div className="text-slate-600 mt-0.5">/{a.maxScore}</div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-semibold">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {course.students.map((student, si) => {
                  const totalMax = assignments.reduce((s, a) => s + a.maxScore, 0);
                  let totalScore = 0;
                  let hasAnyGrade = false;
                  return (
                    <tr key={student.id} className={`${si % 2 === 0 ? "bg-[#131b2e]" : "bg-[#151d30]"} hover:bg-[#171f33]`}>
                      <td className="px-5 py-3 sticky left-0 bg-inherit">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">{student.full_name.charAt(0)}</div>
                          <span className="text-slate-200 font-medium text-xs truncate max-w-[120px]">{student.full_name}</span>
                        </div>
                      </td>
                      {assignments.map((a) => {
                        const sub = a.submissions.find((s) => s.studentId === student.id);
                        if (sub?.score !== null && sub?.score !== undefined) { totalScore += sub.score; hasAnyGrade = true; }
                        return (
                          <td key={a.id} className="text-center px-3 py-3">
                            {sub?.status === "graded" && sub.score !== null ? (
                              <span className={`font-bold ${sub.score >= a.maxScore * 0.8 ? "text-emerald-400" : sub.score >= a.maxScore * 0.5 ? "text-amber-400" : "text-red-400"}`}>{sub.score}</span>
                            ) : sub?.status === "submitted" ? (
                              <span className="text-blue-400 text-xs">Chờ chấm</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center px-4 py-3 font-bold text-[#4fdbc8]">
                        {hasAnyGrade ? <>{totalScore}<span className="text-slate-600 font-normal">/{totalMax}</span></> : <span className="text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────── Sub-components ────────── */

function SubmissionRow({
  submission,
  maxScore,
  assignmentId,
  onGrade,
}: {
  submission: AssignmentSubmission;
  maxScore: number;
  assignmentId: number;
  onGrade: (aId: number, sId: number, score: number, feedback: string) => void;
}) {
  const [grading, setGrading] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    not_submitted: { label: "Chưa nộp", color: "text-red-400", bg: "bg-red-500/10" },
    submitted: { label: "Đã nộp", color: "text-blue-400", bg: "bg-blue-500/10" },
    late: { label: "Nộp muộn", color: "text-amber-400", bg: "bg-amber-500/10" },
    graded: { label: "Đã chấm", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  };
  const st = STATUS_MAP[submission.status] || STATUS_MAP.not_submitted;

  return (
    <>
      <tr className="border-t border-slate-800/30 hover:bg-[#171f33] transition-colors">
        <td className="px-5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-300">{submission.studentName.charAt(0)}</div>
            <div>
              <p className="text-xs font-medium text-slate-200">{submission.studentName}</p>
              <p className="text-[10px] text-slate-600">{submission.studentEmail}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.color}`}>{st.label}</span>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-500">
          {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("vi-VN") : "—"}
        </td>
        <td className="px-3 py-2.5">
          {submission.fileName ? (
            <span className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer hover:text-indigo-400"><Download size={12} /> {submission.fileName.slice(0, 25)}...</span>
          ) : (
            <span className="text-xs text-slate-600">—</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center">
          {submission.status === "graded" && submission.score !== null ? (
            <span className="font-bold text-emerald-400">{submission.score}/{maxScore}</span>
          ) : submission.status === "submitted" ? (
            <button
              onClick={() => setGrading(!grading)}
              className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded hover:bg-indigo-600 hover:text-white transition-colors"
            >
              Chấm điểm
            </button>
          ) : (
            <span className="text-slate-600 text-xs">—</span>
          )}
        </td>
      </tr>
      {grading && submission.status === "submitted" && (
        <tr className="bg-[#0b1326]">
          <td colSpan={5} className="px-5 py-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={maxScore}
                placeholder={`Điểm (0-${maxScore})`}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="w-24 bg-[#131b2e] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Nhận xét..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="flex-1 bg-[#131b2e] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  const score = Number(scoreInput);
                  if (isNaN(score) || score < 0 || score > maxScore) return;
                  onGrade(assignmentId, submission.studentId, score, feedbackInput);
                  setGrading(false);
                  setScoreInput("");
                  setFeedbackInput("");
                }}
                disabled={!scoreInput}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500 disabled:opacity-50"
              >
                Lưu điểm
              </button>
              <button onClick={() => setGrading(false)} className="text-xs text-slate-500 hover:text-white">Hủy</button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PostCard({ post }: { post: ClassPost }) {
  const [showComments, setShowComments] = useState(post.comments.length <= 2);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="bg-[#131b2e] rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${post.authorRole === "lecturer" ? "bg-indigo-900 border border-indigo-500/30 text-indigo-300" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>
            {post.authorName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#dae2fd]">{post.authorName}</span>
              {post.authorRole === "lecturer" && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">Giảng viên</span>}
              {post.isPinned && <Pin size={12} className="text-amber-400" />}
              <span className="text-[10px] text-slate-600">{timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {post.attachments.map((att) => (
                  <span key={att.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1326] rounded-lg text-xs text-slate-400 border border-slate-800 hover:border-indigo-500/30 cursor-pointer">
                    <Paperclip size={12} /> {att.name} <span className="text-slate-600">{att.size}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {post.comments.length > 0 && (
        <div className="border-t border-slate-800/50 bg-[#0e1627]">
          {!showComments && post.comments.length > 2 && (
            <button onClick={() => setShowComments(true)} className="w-full py-2 text-xs text-indigo-400 hover:text-indigo-300">
              Xem {post.comments.length} bình luận
            </button>
          )}
          {showComments && (
            <div className="px-5 py-3 space-y-3">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${c.authorRole === "lecturer" ? "bg-indigo-900/60 text-indigo-300" : "bg-slate-800 text-slate-400"}`}>{c.authorName.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">{c.authorName}</span>
                      {c.authorRole === "lecturer" && <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-bold">GV</span>}
                      <span className="text-[10px] text-slate-600">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
