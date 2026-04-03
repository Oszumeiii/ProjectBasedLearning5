import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClassHeader } from "../components/ClassHeader";
import {
  FolderOpen,
  MessageSquareQuote,
  ListTodo,
  BellRing,
  BookOpenCheck,
  FileText,
  Eye,
  Upload,
  MessageSquare,
  Clock,
  Paperclip,
  Pin,
  Send,
} from "lucide-react";
import { getCourseById } from "../services/course.service";
import { listReports, type Report } from "../services/report.service";
import { getAssignmentStats, type ClassPost } from "../../../mocks/assignments";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignments } from "../../../context/AssignmentContext";

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
    enrolled_at: string;
  }>;
}

type Tab = "posts" | "assignments" | "library";

export const ClassroomDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cid = Number(classId) || 1;

  const {
    getAssignmentsByCourse,
    getPostsByCourse,
    ensureCourseData,
    addPost,
    addComment,
  } = useAssignments();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("posts");
  const [publicReports, setPublicReports] = useState<Report[]>([]);
  const [newComment, setNewComment] = useState("");

  const assignments = getAssignmentsByCourse(cid);
  const posts = getPostsByCourse(cid);

  useEffect(() => {
    if (!classId) return;
    ensureCourseData(cid);
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(Number(classId));
        setCourse(courseData);
        try {
          const pubData = await listReports({
            status: "approved",
            limit: 6,
            sort: "newest",
          });
          setPublicReports(pubData.items || []);
        } catch {
          /* ignore */
        }
      } catch (err) {
        console.error("Failed to load course detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, cid, ensureCourseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#0b1326] min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#0b1326] min-h-screen">
        <p className="text-red-400">Không tìm thấy lớp học</p>
      </div>
    );
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "posts", label: "Bảng tin", icon: <MessageSquare size={16} /> },
    { key: "assignments", label: "Bài tập", icon: <ListTodo size={16} /> },
    { key: "library", label: "Tài liệu", icon: <BookOpenCheck size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b1326] animate-in fade-in duration-500 pb-12">
      <ClassHeader
        title={course.name}
        teacher={course.lecturer_name || "Chưa phân công"}
        action={
          <button
            onClick={() => navigate(`/student/class/${classId}/submit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0566d9] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#0566d9]/20 hover:scale-105 transition-all"
          >
            <Upload size={18} /> Nộp bài tập
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 pt-4">
        <div className="flex gap-1 border-b border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                tab === t.key
                  ? "border-[#0566d9] text-[#adc6ff]"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.icon} {t.label}
              {t.key === "assignments" && assignments.length > 0 && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {assignments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* ── Tab: Bảng tin ── */}
          {tab === "posts" && (
            <>
              <div className="p-4 bg-[#131b2e] rounded-xl border border-slate-800/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {user?.full_name?.charAt(0) || "S"}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết gì đó cho lớp..."
                      rows={2}
                      className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-[#0566d9] resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                        <Paperclip size={14} /> Đính kèm
                      </button>
                      <button
                        onClick={() => {
                          if (!newComment.trim()) return;
                          addPost({
                            courseId: cid,
                            authorName: user?.full_name || "Sinh viên",
                            authorRole: "student",
                            content: newComment,
                            isPinned: false,
                            attachments: [],
                            comments: [],
                          });
                          setNewComment("");
                        }}
                        disabled={!newComment.trim()}
                        className="px-4 py-1.5 bg-[#0566d9] text-white text-xs font-bold rounded-lg hover:bg-[#004395] disabled:opacity-40 flex items-center gap-1.5"
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
                  <PostCard
                    key={post.id}
                    post={post}
                    onAddComment={(content) =>
                      addComment(
                        post.id,
                        user?.full_name || "Sinh viên",
                        "student",
                        content
                      )
                    }
                    timeAgo={timeAgo}
                  />
                ))}

              {posts.length === 0 && (
                <div className="p-12 bg-[#131b2e] rounded-xl text-center text-slate-500">
                  Chưa có bài đăng nào. Hãy là người đầu tiên!
                </div>
              )}
            </>
          )}

          {/* ── Tab: Bài tập ── */}
          {tab === "assignments" && (
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="p-12 bg-[#131b2e] rounded-xl border border-slate-800/50 text-center">
                  <ListTodo size={40} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-500">Chưa có bài tập nào trong lớp</p>
                </div>
              ) : (
                assignments.map((a) => {
                  const stats = getAssignmentStats(a);
                  const mySubmission = a.submissions.find(
                    (s) => s.studentEmail === user?.email || s.studentId === 1
                  );
                  const myStatus: "pending" | "submitted" | "graded" =
                    mySubmission?.status === "graded"
                      ? "graded"
                      : mySubmission?.status === "submitted" || mySubmission?.status === "late"
                        ? "submitted"
                        : "pending";

                  return (
                    <div key={a.id} className="bg-[#131b2e] rounded-xl border border-slate-800/50 overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              a.type === "report" ? "bg-blue-500/15 text-blue-400"
                                : a.type === "exercise" ? "bg-amber-500/15 text-amber-400"
                                : a.type === "project" ? "bg-purple-500/15 text-purple-400"
                                : "bg-emerald-500/15 text-emerald-400"
                            }`}>
                              <ListTodo size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-[#dae2fd] text-sm">{a.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {stats.isOverdue
                                    ? <span className="text-red-400">Đã hết hạn</span>
                                    : <span>Hạn: {new Date(a.deadline).toLocaleDateString("vi-VN")}</span>}
                                </span>
                                <span>Điểm: {a.maxScore}</span>
                                {a.attachments.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Paperclip size={12} /> {a.attachments.length} tài liệu
                                  </span>
                                )}
                              </div>
                              {a.attachments.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                  {a.attachments.map((att) => (
                                    <span key={att.name} className="inline-flex items-center gap-1 px-2 py-1 bg-[#0b1326] rounded text-[10px] text-slate-400 border border-slate-800 cursor-pointer hover:border-[#0566d9]/30">
                                      <Paperclip size={10} /> {att.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 ml-4 flex flex-col items-end gap-2">
                            <StatusBadge
                              status={myStatus}
                              score={mySubmission?.score !== null && mySubmission?.score !== undefined ? `${mySubmission.score}/${a.maxScore}` : undefined}
                            />
                            {myStatus === "pending" && !stats.isOverdue && (
                              <button
                                onClick={() => navigate(`/student/class/${classId}/submit`)}
                                className="px-4 py-1.5 bg-[#0566d9] text-white text-xs font-bold rounded-lg hover:bg-[#004395] transition-colors"
                              >
                                Nộp bài
                              </button>
                            )}
                            {mySubmission?.feedback && (
                              <p className="text-[10px] text-slate-500 max-w-[160px] text-right">
                                "{mySubmission.feedback}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Tab: Tài liệu ── */}
          {tab === "library" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Báo cáo công khai đã được phê duyệt</p>
              {publicReports.length === 0 ? (
                <div className="p-12 bg-[#131b2e] rounded-xl border border-slate-800/50 text-center text-slate-500">Chưa có tài liệu</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => navigate(`/student/feedback?reportId=${report.id}`)}
                      className="p-4 bg-[#131b2e] rounded-xl border border-slate-800/50 hover:border-[#4fdbc8]/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mt-0.5 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-[#dae2fd] line-clamp-1 group-hover:text-[#4fdbc8] transition-colors">{report.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{report.author_name} • {new Date(report.created_at).toLocaleDateString("vi-VN")}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-600">
                            <span className="flex items-center gap-0.5"><Eye size={10} /> {report.view_count}</span>
                            <span className="uppercase font-mono">{report.file_type || "file"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center">
                <button onClick={() => navigate("/student/library")} className="text-sm text-[#adc6ff] hover:text-white font-semibold transition-colors">
                  Xem tất cả tại thư viện →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#131b2e] border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold text-sm mb-3 flex items-center gap-2">
              <FolderOpen className="text-[#adc6ff]" size={16} /> Thông tin lớp
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Mã lớp</span><span className="text-[#adc6ff] font-mono font-bold">{course.code}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sinh viên</span><span className="text-[#dae2fd] font-bold">{course.student_count}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Bài tập</span><span className="text-[#dae2fd] font-bold">{assignments.length}</span></div>
            </div>
            {course.description && (
              <p className="mt-3 text-xs text-slate-500 border-t border-slate-800/50 pt-3">{course.description}</p>
            )}
          </div>

          {assignments.filter((a) => !getAssignmentStats(a).isOverdue).length > 0 && (
            <div className="p-5 rounded-xl bg-[#131b2e] border border-slate-800/50">
              <h3 className="text-[#dae2fd] font-bold text-sm mb-3 flex items-center gap-2">
                <Clock className="text-amber-400" size={16} /> Sắp đến hạn
              </h3>
              <div className="space-y-2">
                {assignments
                  .filter((a) => !getAssignmentStats(a).isOverdue)
                  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                  .slice(0, 3)
                  .map((a) => {
                    const daysLeft = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={a.id} onClick={() => setTab("assignments")} className="p-3 bg-[#0b1326] rounded-lg border border-slate-800 cursor-pointer hover:border-amber-500/20">
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1">{a.title}</p>
                        <p className="text-[10px] text-amber-400 mt-1">Còn {daysLeft} ngày</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="p-5 rounded-xl bg-[#222a3d] border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold text-sm mb-3 flex items-center gap-2">
              <BellRing className="text-[#4fdbc8]" size={16} /> Sinh viên ({course.student_count})
            </h3>
            {course.students.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có sinh viên</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {course.students.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">{s.full_name.charAt(0)}</div>
                    <span className="text-slate-300 truncate">{s.full_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-[#131b2e] to-[#0566d9]/10 border border-[#0566d9]/20">
            <h3 className="text-[#adc6ff] font-bold flex items-center gap-2 mb-2 text-sm">
              <MessageSquareQuote size={16} /> Trợ lý AI
            </h3>
            <p className="text-[11px] text-[#c6c6cd] leading-relaxed mb-3">Hỏi AI về tài liệu lớp học.</p>
            <button className="w-full py-2 bg-[#0566d9] text-white rounded-lg font-bold text-xs hover:bg-[#004395] transition-colors">Mở khung Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────── Sub-components ────────── */

function StatusBadge({ status, score }: { status: "pending" | "submitted" | "graded"; score?: string }) {
  const config = {
    pending: { label: "Chưa nộp", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    submitted: { label: "Đã nộp", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    graded: { label: score ? `Điểm: ${score}` : "Đã chấm", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  };
  const c = config[status];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.color}`}>{c.label}</span>;
}

function PostCard({
  post,
  onAddComment,
  timeAgo,
}: {
  post: ClassPost;
  onAddComment: (content: string) => void;
  timeAgo: (date: string) => string;
}) {
  const [showComments, setShowComments] = useState(true);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="bg-[#131b2e] rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${post.authorRole === "lecturer" ? "bg-indigo-900 border border-indigo-500/30 text-indigo-300" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>
            {post.authorName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#dae2fd]">{post.authorName}</span>
              {post.authorRole === "lecturer" && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">Giảng viên</span>}
              {post.isPinned && <Pin size={12} className="text-amber-400" />}
              <span className="text-[10px] text-slate-600">{timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {post.attachments.map((att) => (
                  <span key={att.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1326] rounded-lg text-xs text-slate-400 border border-slate-800 cursor-pointer">
                    <Paperclip size={12} /> {att.name} <span className="text-slate-600">{att.size}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/50 bg-[#0e1627]">
        {post.comments.length > 0 && showComments && (
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
            className="flex-1 bg-transparent border-none text-xs text-slate-300 placeholder:text-slate-600 focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onAddComment(replyText);
              setReplyText("");
            }}
            disabled={!replyText.trim()}
            className="text-[#0566d9] disabled:text-slate-700 hover:text-[#adc6ff]"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
