import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, AlertCircle, ChevronLeft, Upload, X, ListTodo, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignments } from "../../../context/AssignmentContext";

export const AssignmentSubmissionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();
  const assignmentIdParam = searchParams.get("assignmentId");
  const navigate = useNavigate();
  useAuth();
  const { getAssignmentsByCourse, ensureCourseData, submitAssignment, getAssignmentStats } = useAssignments();

  const cid = Number(classId) || 1;
  useEffect(() => {
    void ensureCourseData(cid);
  }, [cid, ensureCourseData]);
  const assignments = getAssignmentsByCourse(cid);
  const upcomingAssignments = assignments.filter(
    (a) => !getAssignmentStats(a).isOverdue
  );

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    assignmentIdParam ? Number(assignmentIdParam) : null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "under_review">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAssignment = selectedAssignmentId
    ? assignments.find((a) => a.id === selectedAssignmentId)
    : null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề báo cáo");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      if (!selectedAssignmentId) {
        setError("Vui lòng chọn bài tập cần nộp");
        setUploading(false);
        return;
      }
      if (!file) {
        setError("Vui lòng chọn file nộp bài");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (classId) formData.append("courseId", classId);
      formData.append("file", file);

      await submitAssignment(selectedAssignmentId, formData);

      setSuccess(true);
      setSubmitStatus("under_review");
      setTitle("");
      setDescription("");
      setFile(null);

      setTimeout(() => {
        if (classId) navigate(`/student/class/${classId}`);
        else navigate(-1);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Nộp bài thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen animate-in bg-app pb-12 duration-500 fade-in">
      <div className="border-b border-app-line bg-app-card p-4 shadow-whisper">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button
            type="button"
            onClick={() => (classId ? navigate(`/student/class/${classId}`) : navigate(-1))}
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-app-inset hover:text-ink-heading"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-ink-heading">Nộp báo cáo</h2>
            <p className="text-xs text-ink-muted">
              {selectedAssignment ? selectedAssignment.title : "Chọn bài tập và nộp báo cáo"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 pt-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {success && (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} /> Nộp bài thành công
              </div>
              <p className="text-xs text-emerald-800">
                Báo cáo đã vào hàng chờ duyệt. Đang chuyển về lớp học...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {upcomingAssignments.length > 0 && (
            <div className="rounded-xl border border-app-line bg-app-card p-5 shadow-whisper">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-heading">
                <ListTodo size={16} className="text-mint" /> Chọn bài tập cần nộp
              </h3>
              <div className="space-y-2">
                {upcomingAssignments.map((a) => {
                  const isSelected = selectedAssignmentId === a.id;
                  const daysLeft = Math.ceil(
                    (new Date(a.deadline).getTime() - Date.now()) / 86400000
                  );
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignmentId(a.id);
                        if (!title) setTitle(a.title);
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-brand bg-brand/5 ring-1 ring-brand/15"
                          : "border-app-line bg-app-inset hover:border-app-track"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? "text-ink-heading" : "text-ink-body"
                            }`}
                          >
                            {a.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-ink-faint">Còn {daysLeft} ngày</p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-body">Tiêu đề báo cáo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề báo cáo..."
                className="w-full rounded-lg border border-app-line bg-app-inset px-4 py-3 text-sm text-ink-heading placeholder:text-ink-faint focus:border-brand focus:ring-1 focus:ring-brand/25"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-body">Mô tả (tùy chọn)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung báo cáo..."
                rows={4}
                className="w-full resize-none rounded-lg border border-app-line bg-app-inset px-4 py-3 text-sm text-ink-heading placeholder:text-ink-faint focus:border-brand focus:ring-1 focus:ring-brand/25"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedAssignment && (
            <div className="rounded-xl border border-app-line bg-app-elevated p-5">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-mint">Bài tập đã chọn</h4>
              <p className="mb-1 text-sm font-bold text-ink-heading">{selectedAssignment.title}</p>
              <p className="mb-2 line-clamp-3 text-[11px] text-ink-muted">{selectedAssignment.description}</p>
              <div className="space-y-1 text-[10px] text-ink-faint">
                <p>
                  Hạn nộp:{" "}
                  <span className="font-medium text-amber-800">
                    {new Date(selectedAssignment.deadline).toLocaleDateString("vi-VN")}
                  </span>
                </p>
              </div>
              {selectedAssignment.attachments.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-app-line pt-2">
                  <p className="text-[10px] text-ink-faint">Tài liệu đính kèm:</p>
                  {selectedAssignment.attachments.map((att) => (
                    <p
                      key={att.name}
                      className="cursor-pointer text-[10px] text-brand hover:underline"
                    >
                      📎 {att.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-app-line bg-app-card p-6 shadow-whisper">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm italic text-ink-muted">Trạng thái:</span>
              <span className="flex items-center gap-1 text-sm font-bold text-warn-on">
                <AlertCircle size={14} />{" "}
                {submitStatus === "under_review" ? "Đang chờ duyệt" : "Chưa nộp"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-ink-heading">
              <Clock className="text-mint" size={20} />
              <div>
                <p className="text-xs text-ink-muted">File đính kèm:</p>
                <p className="text-sm font-bold">
                  {submitStatus === "under_review"
                    ? "Đã nộp, đang chờ giảng viên duyệt"
                    : file
                      ? file.name
                      : "Chưa chọn file"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-app-line bg-app-card p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.docx,.doc,.pptx,.png,.jpg"
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-mint">description</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-ink-heading">{file.name}</p>
                    <p className="text-xs text-ink-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 py-8 text-ink-muted transition-colors hover:text-brand"
              >
                <Upload size={32} />
                <p className="text-sm font-medium">Kéo thả hoặc nhấn để chọn file</p>
                <p className="text-xs">PDF, DOCX, PPTX (tối đa 50MB)</p>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || !title.trim() || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-bold text-white transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang nộp...
              </>
            ) : (
              <>
                <Upload size={16} />
                Nộp báo cáo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
