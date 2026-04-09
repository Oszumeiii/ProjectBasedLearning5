import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, AlertCircle, ChevronLeft, Upload, X, ListTodo } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useAssignments } from "../../../context/AssignmentContext";

export const AssignmentSubmissionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();
  const assignmentIdParam = searchParams.get("assignmentId");
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-[#0b1326] animate-in fade-in duration-500 pb-12">
      <div className="bg-[#131b2e] border-b border-slate-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() =>
              classId ? navigate(`/student/class/${classId}`) : navigate(-1)
            }
            className="p-2 hover:bg-[#1c253d] rounded-lg text-slate-400 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-[#dae2fd] font-bold">Nộp báo cáo</h2>
            <p className="text-xs text-[#798098]">
              {selectedAssignment
                ? selectedAssignment.title
                : "Chọn bài tập và nộp báo cáo"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl text-emerald-400">
              Nộp bài thành công! Đang chuyển về lớp học...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Chọn bài tập */}
          {upcomingAssignments.length > 0 && (
            <div className="p-5 bg-[#131b2e] rounded-xl border border-slate-800/50">
              <h3 className="text-sm font-bold text-[#dae2fd] mb-3 flex items-center gap-2">
                <ListTodo size={16} className="text-[#adc6ff]" /> Chọn bài tập
                cần nộp
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
                      onClick={() => {
                        setSelectedAssignmentId(a.id);
                        if (!title) setTitle(a.title);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-800 bg-[#0b1326] hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? "text-indigo-300" : "text-slate-300"
                            }`}
                          >
                            {a.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Điểm: {Number(a.max_score)} • Còn {daysLeft} ngày
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form nộp */}
          <div className="p-6 bg-[#131b2e] rounded-xl border border-slate-800/50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tiêu đề báo cáo *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề báo cáo..."
                className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mô tả (tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung báo cáo..."
                rows={4}
                className="w-full bg-[#0b1326] border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Thông tin bài tập đã chọn */}
          {selectedAssignment && (
            <div className="p-5 rounded-xl bg-indigo-900/20 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                Bài tập đã chọn
              </h4>
              <p className="text-sm font-bold text-[#dae2fd] mb-1">
                {selectedAssignment.title}
              </p>
              <p className="text-[11px] text-slate-400 mb-2 line-clamp-3">
                {selectedAssignment.description}
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <p>
                  Hạn nộp:{" "}
                  <span className="text-amber-400">
                    {new Date(selectedAssignment.deadline).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </p>
                <p>
                  Điểm tối đa:{" "}
                  <span className="text-[#4fdbc8]">
                    {selectedAssignment.max_score}
                  </span>
                </p>
              </div>
              {selectedAssignment.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-indigo-500/10 space-y-1">
                  <p className="text-[10px] text-slate-500">Tài liệu đính kèm:</p>
                  {selectedAssignment.attachments.map((att) => (
                    <p
                      key={att.name}
                      className="text-[10px] text-indigo-300 cursor-pointer hover:underline"
                    >
                      📎 {att.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-6 rounded-2xl bg-[#1c253d] border border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm italic">Trạng thái:</span>
              <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                <AlertCircle size={14} /> Chưa nộp
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#dae2fd]">
              <Clock className="text-[#adc6ff]" size={20} />
              <div>
                <p className="text-xs text-slate-400">File đính kèm:</p>
                <p className="text-sm font-bold">
                  {file ? file.name : "Chưa chọn file"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#131b2e] border border-dashed border-slate-700 text-center">
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
                  <span className="material-symbols-outlined text-indigo-400">
                    description
                  </span>
                  <div className="text-left">
                    <p className="text-sm text-slate-200 font-medium">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 w-full py-8 text-slate-500 hover:text-indigo-400 transition-colors"
              >
                <Upload size={32} />
                <p className="text-sm font-medium">
                  Kéo thả hoặc nhấn để chọn file
                </p>
                <p className="text-xs">PDF, DOCX, PPTX (tối đa 50MB)</p>
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading || !title.trim() || success}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
