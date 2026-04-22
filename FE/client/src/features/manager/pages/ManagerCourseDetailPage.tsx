import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  Trash2,
  ClipboardList,
  Check,
  X,
  Copy,
  Save,
  Pencil,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getCourseById,
  getCourseStudents,
  getEvaluationCriteria,
  createEvaluationCriterion,
  updateEvaluationCriterion,
  deleteEvaluationCriterion,
  addCourseLecturer,
  removeCourseLecturer,
  updateEnrollmentStatus,
  bulkUpdateEnrollmentStatus,
  updateEnrollmentGrade,
  enrollStudentStaff,
  patchCourse,
  deleteCourse,
  reorderEvaluationCriteria,
  type EnrollmentRow,
  type EvaluationCriterion,
} from "../../classroom/services/course.service";

function getApiErrorMessage(err: unknown, fallback: string): string {
  const ax = err as {
    response?: { data?: { message?: string }; status?: number };
    message?: string;
    code?: string;
  };
  const m = ax?.response?.data?.message;
  if (typeof m === "string" && m.trim()) return m;
  if (ax?.code === "ERR_NETWORK" || ax?.message === "Network Error") {
    return "Không kết nối được máy chủ (kiểm tra backend đang chạy và REACT_APP_API_URL).";
  }
  return fallback;
}

type EditFormState = {
  name: string;
  description: string;
  semester: string;
  academicYear: string;
  maxStudents: number;
  isActive: boolean;
  courseType: "project" | "thesis" | "research" | "internship";
};

export const ManagerCourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const id = (() => {
    const n = Number(courseId);
    return Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : NaN;
  })();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const base = location.pathname.startsWith("/admin")
    ? "/admin"
    : location.pathname.startsWith("/instructor")
      ? "/instructor"
      : "/manager";
  const isInstructorView = location.pathname.startsWith("/instructor");
  const canEditThesisType = user?.role === "manager" || user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [students, setStudents] = useState<EnrollmentRow[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const [savingCourse, setSavingCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    description: "",
    semester: "",
    academicYear: "",
    maxStudents: 30,
    isActive: true,
    courseType: "project",
  });

  const [lecturerId, setLecturerId] = useState("");
  const [roleInCourse, setRoleInCourse] = useState<"reviewer" | "committee" | "supervisor">(
    "reviewer"
  );
  const [studentEmail, setStudentEmail] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<
    "all" | "pending" | "active" | "rejected" | "dropped" | "completed" | "failed"
  >("all");
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<"active" | "rejected" | "dropped">("active");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [savingGradeId, setSavingGradeId] = useState<number | null>(null);
  const [gradeDrafts, setGradeDrafts] = useState<Record<number, { finalGrade: string; finalScore: string }>>({});
  const [critName, setCritName] = useState("");
  const [critWeight, setCritWeight] = useState("");
  const [editingCrit, setEditingCrit] = useState<{
    id: number;
    name: string;
    weight: string;
  } | null>(null);
  const [copiedJoin, setCopiedJoin] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (Number.isNaN(id)) {
      setError("Đường dẫn lớp không hợp lệ (thiếu hoặc sai mã lớp).");
      setLoading(false);
      return;
    }
    try {
      const c = await getCourseById(id);
      setCourse(c);
      const [st, ev] = await Promise.all([
        getCourseStudents(id),
        isInstructorView
          ? Promise.resolve({ items: [] as EvaluationCriterion[], totalWeight: 0 })
          : getEvaluationCriteria(id).catch(() => ({ items: [], totalWeight: 0 })),
      ]);
      setStudents(st);
      setCriteria(ev.items || []);
      setTotalWeight(ev.totalWeight ?? 0);
    } catch (e: unknown) {
      setError(
        getApiErrorMessage(
          e,
          "Không tải được chi tiết lớp. Kiểm tra kết nối API, đăng nhập lại hoặc quyền truy cập."
        )
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, isInstructorView]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!course) return;
    const ct = String(course.course_type || "project").toLowerCase();
    const safeType =
      ct === "thesis" || ct === "research" || ct === "internship" ? ct : "project";
    setEditForm({
      name: String(course.name ?? ""),
      description: course.description != null ? String(course.description) : "",
      semester: String(course.semester ?? ""),
      academicYear: String(course.academic_year ?? ""),
      maxStudents: Math.min(500, Math.max(1, Number(course.max_students ?? 30))),
      isActive: course.is_active !== false,
      courseType: safeType as EditFormState["courseType"],
    });
  }, [course]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingCourse(true);
    try {
      const body: Parameters<typeof patchCourse>[1] = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        semester: editForm.semester.trim(),
        academicYear: editForm.academicYear.trim(),
        maxStudents: editForm.maxStudents,
        isActive: editForm.isActive,
      };
      if (canEditThesisType) {
        body.courseType = editForm.courseType;
      } else if (editForm.courseType !== "thesis") {
        body.courseType = editForm.courseType;
      }
      await patchCourse(id, body);
      await load();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Không lưu được thông tin lớp."
      );
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!id) return;
    if (
      !window.confirm(
        "Lưu trữ lớp này? Lớp sẽ ẩn khỏi danh sách; thao tác có thể cần hỗ trợ DB để khôi phục."
      )
    )
      return;
    setDeletingCourse(true);
    try {
      await deleteCourse(id);
      navigate(`${base}/courses`);
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Không xóa được lớp."
      );
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleApprove = async (enrollmentId: number, status: "active" | "rejected") => {
    try {
      await updateEnrollmentStatus(enrollmentId, status);
      await load();
    } catch (e) {
      console.error(e);
      alert(getApiErrorMessage(e, "Không cập nhật được trạng thái."));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedEnrollmentIds.length) return;
    setBulkBusy(true);
    try {
      await bulkUpdateEnrollmentStatus(id, {
        enrollmentIds: selectedEnrollmentIds,
        status: bulkStatus,
      });
      setSelectedEnrollmentIds([]);
      await load();
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "Không cập nhật được trạng thái hàng loạt."));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleSaveEnrollmentGrade = async (enrollmentId: number) => {
    const draft = gradeDrafts[enrollmentId] ?? { finalGrade: "", finalScore: "" };
    const score = draft.finalScore.trim() === "" ? null : Number(draft.finalScore);
    if (score != null && (!Number.isFinite(score) || score < 0 || score > 10)) {
      alert("Điểm tổng kết phải nằm trong khoảng 0-10");
      return;
    }

    setSavingGradeId(enrollmentId);
    try {
      await updateEnrollmentGrade(enrollmentId, {
        finalGrade: draft.finalGrade.trim() || null,
        finalScore: score,
      });
      await load();
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "Không lưu được điểm tổng kết."));
    } finally {
      setSavingGradeId(null);
    }
  };

  const handleDropFromCourse = async (enrollmentId: number) => {
    if (
      !window.confirm(
        "Gỡ sinh viên khỏi lớp (đánh dấu thôi học)? Họ vẫn xuất hiện trong danh sách với trạng thái «dropped»."
      )
    )
      return;
    try {
      await updateEnrollmentStatus(enrollmentId, "dropped");
      await load();
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "Không cập nhật được."));
    }
  };

  const handleAddLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    const lid = Number(lecturerId);
    if (!lid) return;
    try {
      await addCourseLecturer(id, { lecturerId: lid, roleInCourse });
      setLecturerId("");
      await load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Lỗi");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;
    try {
      await enrollStudentStaff(id, { email: studentEmail.trim() });
      setStudentEmail("");
      await load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Lỗi");
    }
  };

  const handleAddCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(critWeight);
    if (!critName.trim() || !w) return;
    try {
      await createEvaluationCriterion(id, { name: critName.trim(), weight: w });
      setCritName("");
      setCritWeight("");
      await load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Lỗi");
    }
  };

  const handleSaveCriterion = async () => {
    if (!editingCrit) return;
    const w = Number(editingCrit.weight);
    if (!editingCrit.name.trim() || !w || w <= 0) {
      alert("Tên và trọng số (>0) là bắt buộc");
      return;
    }
    try {
      await updateEvaluationCriterion(id, editingCrit.id, {
        name: editingCrit.name.trim(),
        weight: w,
      });
      setEditingCrit(null);
      await load();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Lỗi cập nhật tiêu chí (có thể tổng trọng số ≠ 100%)"
      );
    }
  };

  if (Number.isNaN(id)) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-red-300">
        Mã lớp trên URL không hợp lệ. Hãy quay lại{" "}
        <Link className="underline text-brand" to={`${base}/courses`}>
          danh sách khóa học
        </Link>
        .
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-24">
        <Loader2 className="animate-spin" />
        Đang tải...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Link
          to={`${base}/courses`}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-brand"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800">
          <p className="font-semibold text-red-900 mb-2">Không tải được chi tiết lớp</p>
          <p className="text-sm text-red-800/90 leading-relaxed">{error || "Không có dữ liệu"}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const assistants = (course.course_lecturers as Array<Record<string, unknown>>) || [];
  const joinCode = String(course.enrollment_code || "").trim();
  const maxCap = Number(course.max_students ?? 30);
  const activeForCap = students.filter((s) => s.status === "active").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;
  const keyword = studentQuery.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const matchesStatus = studentStatusFilter === "all" || student.status === studentStatusFilter;
    const haystack = `${student.full_name} ${student.email} ${student.major ?? ""}`.toLowerCase();
    const matchesQuery = !keyword || haystack.includes(keyword);
    return matchesStatus && matchesQuery;
  });
  const selectableStudents = filteredStudents.filter((s) => ["pending", "active", "rejected", "dropped"].includes(s.status));
  const allSelectableChecked =
    selectableStudents.length > 0 && selectableStudents.every((s) => selectedEnrollmentIds.includes(s.enrollment_id));

  const copyJoinCode = () => {
    if (!joinCode) return;
    void navigator.clipboard.writeText(joinCode);
    setCopiedJoin(true);
    window.setTimeout(() => setCopiedJoin(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <Link
          to={`${base}/courses`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand mb-4"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-ink-heading">
              {(course.name as string) || "Lớp học"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                document.getElementById("course-edit-section")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/90 text-white text-sm font-semibold hover:bg-amber-500"
            >
              <Save size={16} />
              Sửa / cập nhật lớp
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteCourse()}
              disabled={deletingCourse}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 text-red-300 text-sm font-semibold hover:bg-red-950/50 disabled:opacity-50"
            >
              {deletingCourse ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              Xóa lớp học phần
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Mã học phần (nội bộ):{" "}
          <span className="text-slate-300 font-mono">{(course.code as string) || "—"}</span> ·{" "}
          {(course.semester as string) || ""} {(course.academic_year as string) || ""} ·{" "}
          <span className="capitalize text-amber-400/90">{String(course.course_type)}</span>
          {" · "}
          <span className="text-slate-400">
            Sĩ số (đã duyệt): <strong className="text-slate-300">{activeForCap}</strong> / {maxCap}
          </span>
        </p>
      </div>

      {joinCode ? (
        <div className="space-y-3 rounded-xl border border-mint/25 bg-gradient-to-br from-app-card to-mint-dim p-6 shadow-whisper">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mint">
            Mã tham gia lớp (6 ký tự — phát cho sinh viên)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-3xl font-black tracking-[0.25em] text-mint sm:text-4xl">
              {joinCode}
            </span>
            <button
              type="button"
              onClick={copyJoinCode}
              className="inline-flex items-center gap-2 rounded-lg border border-app-line bg-app-elevated px-3 py-2 text-sm text-ink-heading hover:bg-app-inset"
            >
              {copiedJoin ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copiedJoin ? "Đã chép" : "Sao chép"}
            </button>
          </div>
          <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-ink-muted">
            <li>
              <strong className="text-ink-heading">Sinh viên:</strong> đăng nhập vai trò Sinh viên → nhập{" "}
              <strong className="text-ink-heading">mã 6 ký tự</strong> hoặc{" "}
              <strong className="text-ink-heading">mã học phần</strong> (code) đầy đủ trên thanh trên cùng → Tham
              gia.
            </li>
            <li>
              <strong className="text-ink-heading">Giảng viên chủ nhiệm:</strong> là người tạo lớp (hoặc được gán
              chủ nhiệm) — vào lớp qua không gian{" "}
              <span className="text-ink-body">Giảng viên / Khóa học</span>, không cần mã này.
            </li>
            <li>
              <strong className="text-ink-heading">Giảng viên phụ / hội đồng:</strong> thêm ở mục bên dưới (ID tài
              khoản GV).
            </li>
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
          Lớp chưa có mã tham gia (cần chạy migration DB hoặc tạo lại lớp trên phiên bản mới).
        </div>
      )}

      <section
        id="course-edit-section"
        className="rounded-xl border border-app-line bg-app-card p-6 space-y-4 scroll-mt-24"
      >
        <h3 className="font-bold text-ink-heading text-lg">Cập nhật &amp; lưu trữ lớp</h3>
        <form onSubmit={handleSaveCourse} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Tên lớp</label>
              <input
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Học kỳ</label>
              <input
                required
                value={editForm.semester}
                onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Năm học</label>
              <input
                required
                value={editForm.academicYear}
                onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sĩ số tối đa</label>
              <input
                type="number"
                min={1}
                max={500}
                value={editForm.maxStudents}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    maxStudents: Math.min(500, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-slate-600"
                />
                Lớp đang mở (cho phép ghi danh / tham gia bằng mã)
              </label>
            </div>
            {canEditThesisType ? (
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">Loại lớp</label>
                <select
                  value={editForm.courseType}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      courseType: e.target.value as EditFormState["courseType"],
                    })
                  }
                  className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
                >
                  <option value="project">Đồ án (project)</option>
                  <option value="thesis">Khóa luận (thesis)</option>
                  <option value="research">NCKH (research)</option>
                  <option value="internship">Thực tập (internship)</option>
                </select>
              </div>
            ) : editForm.courseType === "thesis" ? (
              <div className="sm:col-span-2 text-sm text-slate-400">
                Loại lớp: <span className="text-ink-heading">khóa luận (thesis)</span> — chỉ quản lý/Admin đổi
                loại.
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500">Loại lớp</label>
                <select
                  value={editForm.courseType}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      courseType: e.target.value as EditFormState["courseType"],
                    })
                  }
                  className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
                >
                  <option value="project">Đồ án (project)</option>
                  <option value="research">NCKH (research)</option>
                  <option value="internship">Thực tập (internship)</option>
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">Mô tả</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm min-h-[72px]"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-between items-center pt-2 border-t border-app-line/80">
            <button
              type="button"
              onClick={() => void handleDeleteCourse()}
              disabled={deletingCourse}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-300 text-sm hover:bg-red-950/40 disabled:opacity-50"
            >
              {deletingCourse ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              Lưu trữ lớp (xóa mềm)
            </button>
            <button
              type="submit"
              disabled={savingCourse}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 disabled:opacity-50"
            >
              {savingCourse ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-app-line bg-app-card p-6 space-y-4">
        <h3 className="font-bold text-ink-heading flex items-center gap-2">
          <Users size={20} className="text-mint" />
          Sinh viên &amp; duyệt ghi danh
        </h3>
        <p className="text-xs text-slate-500">
          Đã duyệt vào lớp: <strong className="text-ink-heading">{activeForCap}</strong> / {maxCap}
          {pendingCount > 0 ? (
            <span className="ml-2 text-amber-300">· Chờ duyệt: {pendingCount}</span>
          ) : null}
          {activeForCap >= maxCap ? (
            <span className="ml-2 text-red-300">· Đã chạm sĩ số tối đa</span>
          ) : null}
        </p>
        <form onSubmit={handleAddStudent} className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-xs text-slate-500">Thêm SV (email)</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="block mt-1 rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading min-w-[240px]"
              placeholder="sv@edu.vn"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-600/80 text-white text-sm font-semibold hover:bg-amber-600"
          >
            Thêm trực tiếp
          </button>
        </form>
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Tìm sinh viên</label>
            <input
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              placeholder="Tên, email, ngành"
              className="block mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Lọc trạng thái</label>
            <select
              value={studentStatusFilter}
              onChange={(e) =>
                setStudentStatusFilter(
                  e.target.value as
                    | "all"
                    | "pending"
                    | "active"
                    | "rejected"
                    | "dropped"
                    | "completed"
                    | "failed"
                )
              }
              className="block mt-1 w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
            >
              <option value="all">Tất cả</option>
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="rejected">rejected</option>
              <option value="dropped">dropped</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as "active" | "rejected" | "dropped")}
              className="w-full rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
            >
              <option value="active">Bulk → active</option>
              <option value="rejected">Bulk → rejected</option>
              <option value="dropped">Bulk → dropped</option>
            </select>
            <button
              type="button"
              disabled={bulkBusy || selectedEnrollmentIds.length === 0}
              onClick={() => void handleBulkStatusUpdate()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {bulkBusy ? "Đang cập nhật" : `Áp dụng (${selectedEnrollmentIds.length})`}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-app-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-app-line">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelectableChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEnrollmentIds(selectableStudents.map((s) => s.enrollment_id));
                      } else {
                        setSelectedEnrollmentIds([]);
                      }
                    }}
                  />
                </th>
                <th className="p-3">Sinh viên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Trạng thái</th>
                {!isInstructorView ? <th className="p-3">Điểm tổng kết</th> : null}
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.enrollment_id} className="border-b border-app-line/60">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedEnrollmentIds.includes(s.enrollment_id)}
                      onChange={(e) => {
                        setSelectedEnrollmentIds((prev) =>
                          e.target.checked
                            ? Array.from(new Set([...prev, s.enrollment_id]))
                            : prev.filter((id) => id !== s.enrollment_id)
                        );
                      }}
                    />
                  </td>
                  <td className="p-3 text-ink-heading">{s.full_name}</td>
                  <td className="p-3 text-slate-400">{s.email}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.status === "pending"
                          ? "bg-amber-500/20 text-amber-300"
                          : s.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : s.status === "dropped"
                              ? "bg-orange-950/50 text-orange-300/90"
                              : s.status === "rejected"
                                ? "bg-red-950/40 text-red-300/80"
                                : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {s.status === "dropped"
                        ? "thôi học"
                        : s.status === "rejected"
                          ? "từ chối"
                          : s.status}
                    </span>
                  </td>
                  {!isInstructorView ? (
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={gradeDrafts[s.enrollment_id]?.finalGrade ?? (s.final_grade ? String(s.final_grade) : "")}
                          onChange={(e) =>
                            setGradeDrafts((prev) => ({
                              ...prev,
                              [s.enrollment_id]: {
                                finalGrade: e.target.value,
                                finalScore:
                                  prev[s.enrollment_id]?.finalScore ??
                                  (s.final_score == null ? "" : String(s.final_score)),
                              },
                            }))
                          }
                          placeholder="Grade"
                          className="w-20 rounded bg-app-inset border border-app-line px-2 py-1 text-xs"
                        />
                        <input
                          value={gradeDrafts[s.enrollment_id]?.finalScore ?? (s.final_score == null ? "" : String(s.final_score))}
                          onChange={(e) =>
                            setGradeDrafts((prev) => ({
                              ...prev,
                              [s.enrollment_id]: {
                                finalGrade:
                                  prev[s.enrollment_id]?.finalGrade ??
                                  (s.final_grade ? String(s.final_grade) : ""),
                                finalScore: e.target.value,
                              },
                            }))
                          }
                          placeholder="0-10"
                          type="number"
                          min={0}
                          max={10}
                          step="0.01"
                          className="w-24 rounded bg-app-inset border border-app-line px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          disabled={savingGradeId === s.enrollment_id}
                          onClick={() => void handleSaveEnrollmentGrade(s.enrollment_id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-ink-heading text-xs hover:bg-slate-600 disabled:opacity-50"
                        >
                          {savingGradeId === s.enrollment_id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          Lưu
                        </button>
                      </div>
                    </td>
                  ) : null}
                  <td className="p-3 text-right space-x-2">
                    {s.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(s.enrollment_id, "active")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/30 text-emerald-300 text-xs"
                        >
                          <Check size={14} /> Duyệt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(s.enrollment_id, "rejected")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600/20 text-red-300 text-xs"
                        >
                          <X size={14} /> Từ chối
                        </button>
                      </>
                    )}
                    {(s.status === "active" || s.status === "pending") && (
                      <button
                        type="button"
                        onClick={() => void handleDropFromCourse(s.enrollment_id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700/80 text-orange-200/90 text-xs hover:bg-slate-600"
                        title="Sinh viên nghỉ hoặc cần gỡ khỏi lớp"
                      >
                        <UserMinus size={14} /> Gỡ khỏi lớp
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <p className="p-6 text-center text-slate-500 text-sm">Không có sinh viên khớp bộ lọc.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-app-line bg-app-card p-6 space-y-4">
        <h3 className="font-bold text-ink-heading flex items-center gap-2">
          <UserPlus size={20} className="text-mint" />
          Giảng viên phụ (hội đồng / phản biện)
        </h3>
        <form onSubmit={handleAddLecturer} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">ID giảng viên (users.id)</label>
            <input
              type="number"
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="block mt-1 rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm w-32"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Vai trò</label>
            <select
              value={roleInCourse}
              onChange={(e) =>
                setRoleInCourse(e.target.value as "reviewer" | "committee" | "supervisor")
              }
              className="block mt-1 rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm text-ink-heading"
            >
              <option value="supervisor">supervisor</option>
              <option value="reviewer">reviewer</option>
              <option value="committee">committee</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Thêm
          </button>
        </form>
        <ul className="space-y-2">
          {assistants.map((a) => (
            <li
              key={`${a.lecturer_id}-${a.role_in_course}`}
              className="flex items-center justify-between py-2 border-b border-app-line/50 text-sm"
            >
              <span>
                {(a.full_name as string) || ""} ·{" "}
                <span className="text-slate-500">{String(a.role_in_course)}</span>
              </span>
              {Number(a.lecturer_id) !== Number(course.lecturer_id) && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("Gỡ giảng viên này khỏi lớp?")) return;
                    try {
                      await removeCourseLecturer(id, Number(a.lecturer_id));
                      await load();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {!isInstructorView ? (
        <section className="rounded-xl border border-app-line bg-app-card p-6 space-y-4">
          <h3 className="font-bold text-ink-heading flex items-center gap-2">
            <ClipboardList size={20} className="text-brand" />
            Tiêu chí đánh giá (tổng trọng số = 100%)
          </h3>
          <p className="text-xs text-slate-500">
            Tổng hiện tại: <strong className="text-amber-400">{totalWeight}%</strong>
          </p>
          <form onSubmit={handleAddCriterion} className="flex flex-wrap gap-3 items-end">
            <input
              placeholder="Tên tiêu chí"
              value={critName}
              onChange={(e) => setCritName(e.target.value)}
              className="rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm flex-1 min-w-[180px]"
            />
            <input
              type="number"
              step="0.01"
              placeholder="% trọng số"
              value={critWeight}
              onChange={(e) => setCritWeight(e.target.value)}
              className="rounded-lg bg-app-inset border border-app-line px-3 py-2 text-sm w-28"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Thêm tiêu chí
            </button>
          </form>
          <ul className="space-y-2">
            {criteria.map((c, index) =>
              editingCrit?.id === c.id ? (
                <li
                  key={c.id}
                  className="flex items-center gap-2 py-2 border-b border-app-line/50 text-sm"
                >
                  <input
                    value={editingCrit.name}
                    onChange={(e) => setEditingCrit({ ...editingCrit, name: e.target.value })}
                    className="flex-1 rounded-lg bg-app-inset border border-app-line px-3 py-1.5 text-sm text-ink-heading min-w-0"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editingCrit.weight}
                    onChange={(e) => setEditingCrit({ ...editingCrit, weight: e.target.value })}
                    className="w-20 rounded-lg bg-app-inset border border-app-line px-2 py-1.5 text-sm text-ink-heading"
                  />
                  <span className="text-slate-500 text-xs">%</span>
                  <button
                    type="button"
                    onClick={() => void handleSaveCriterion()}
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                    title="Lưu"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCrit(null)}
                    className="p-1 text-slate-500 hover:text-slate-300"
                    title="Hủy"
                  >
                    <X size={16} />
                  </button>
                </li>
              ) : (
                <li
                  key={c.id}
                  className="flex items-center justify-between py-2 border-b border-app-line/50 text-sm text-slate-300"
                >
                  <span>
                    <span className="text-slate-500 mr-2">#{index + 1}</span>
                    {c.name}{" "}
                    <span className="text-amber-400/90">({String(c.weight)}%)</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={async () => {
                        if (index === 0) return;
                        const next = [...criteria];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        try {
                          await reorderEvaluationCriteria(
                            id,
                            next.map((item) => item.id)
                          );
                          await load();
                        } catch (e: unknown) {
                          alert(getApiErrorMessage(e, "Không sắp xếp lại được tiêu chí."));
                        }
                      }}
                      className="text-slate-500 hover:text-ink-heading p-1 disabled:opacity-30"
                      title="Đưa lên"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === criteria.length - 1}
                      onClick={async () => {
                        if (index === criteria.length - 1) return;
                        const next = [...criteria];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        try {
                          await reorderEvaluationCriteria(
                            id,
                            next.map((item) => item.id)
                          );
                          await load();
                        } catch (e: unknown) {
                          alert(getApiErrorMessage(e, "Không sắp xếp lại được tiêu chí."));
                        }
                      }}
                      className="text-slate-500 hover:text-ink-heading p-1 disabled:opacity-30"
                      title="Đưa xuống"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCrit({
                          id: c.id,
                          name: c.name,
                          weight: String(c.weight),
                        })
                      }
                      className="text-slate-500 hover:text-brand p-1"
                      title="Sửa tiêu chí"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Xóa tiêu chí này?")) return;
                        try {
                          await deleteEvaluationCriterion(id, c.id);
                          await load();
                        } catch (e: unknown) {
                          alert(
                            (e as { response?: { data?: { message?: string } } })?.response?.data
                              ?.message || "Lỗi (có thể tổng trọng số còn lại ≠ 100%)"
                          );
                        }
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
