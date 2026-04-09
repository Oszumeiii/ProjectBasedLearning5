import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  School,
  Users,
  BookOpen,
  Filter,
  Plus,
  Loader2,
  KeyRound,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  listCourses,
  createCourse,
  deleteCourse,
  type Course,
  type CreateCourseBody,
} from "../../classroom/services/course.service";

const COURSE_TYPES = [
  { value: "", label: "Tất cả loại" },
  { value: "project", label: "Đồ án" },
  { value: "thesis", label: "Khóa luận" },
  { value: "research", label: "NCKH" },
  { value: "internship", label: "Thực tập" },
];

export const ManagerCoursesPage = () => {
  const location = useLocation();
  const base = location.pathname.startsWith("/admin")
    ? "/admin"
    : location.pathname.startsWith("/instructor")
      ? "/instructor"
      : "/manager";
  const isAdmin = location.pathname.startsWith("/admin");
  const isInstructor = location.pathname.startsWith("/instructor");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semester, setSemester] = useState("");
  const [courseType, setCourseType] = useState("");
  const [lecturerId, setLecturerId] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<{
    name: string;
    enrollment_code: string;
    code: string;
  } | null>(null);
  const [form, setForm] = useState<CreateCourseBody>({
    name: "",
    code: "",
    semester: "",
    academicYear: "",
    courseType: "project",
    description: "",
    maxStudents: 30,
  });

  const load = useCallback(
    async (filters?: { semester?: string; courseType?: string; lecturerId?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listCourses({
          semester: filters?.semester?.trim() || undefined,
          course_type: filters?.courseType || undefined,
          lecturer_id: filters?.lecturerId ? Number(filters.lecturerId) : undefined,
        });
        setCourses(data);
      } catch (e: unknown) {
        setError("Không tải được danh sách khóa học.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void load({ semester, courseType, lecturerId });
  }, [load, semester, courseType, lecturerId]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    void load({ semester, courseType, lecturerId });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createCourse({
        ...form,
        code: form.code?.trim() || undefined,
        courseType: form.courseType,
      });
      setJustCreated({
        name: created.name,
        enrollment_code: String(created.enrollment_code || ""),
        code: String(created.code || ""),
      });
      setShowCreate(false);
      setForm({
        name: "",
        code: "",
        semester: "",
        academicYear: "",
        courseType: isInstructor ? "project" : "project",
        description: "",
        maxStudents: 30,
      });
      await load({ semester, courseType, lecturerId });
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Không tạo được lớp"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (courseId: number, courseName: string) => {
    if (
      !window.confirm(
        `Lưu trữ lớp "${courseName}"? Lớp sẽ ẩn khỏi danh sách (xóa mềm).`
      )
    )
      return;
    try {
      await deleteCourse(courseId);
      await load({ semester, courseType, lecturerId });
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Không xóa được lớp."
      );
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
            <School className="text-amber-400" size={28} /> Lớp học phần
          </h2>
        <p className="text-slate-400 text-sm mt-1">
          Mỗi lớp có <strong className="text-slate-300">mã học phần</strong> (code) để quản trị và{" "}
          <strong className="text-[#4fdbc8]">mã tham gia 6 ký tự</strong> (ngẫu nhiên, duy nhất) để sinh viên nhập
          khi tham gia — giống Google Classroom / LMS trường.
        </p>
      </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm text-white ${
            isAdmin
              ? "bg-violet-600 hover:bg-violet-500"
              : isInstructor
                ? "bg-indigo-600 hover:bg-indigo-500"
                : "bg-amber-600 hover:bg-amber-500"
          }`}
        >
          <Plus size={18} /> Tạo lớp
        </button>
      </div>

      {justCreated && justCreated.enrollment_code && (
        <div className="rounded-xl border border-[#4fdbc8]/35 bg-[#0f1729] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4fdbc8]/90">
              Đã tạo lớp thành công
            </p>
            <p className="text-sm text-slate-400 mt-1">{justCreated.name}</p>
            {justCreated.code && (
              <p className="text-xs text-slate-400 mt-1">
                Mã học phần: <span className="font-mono text-slate-200">{justCreated.code}</span>
              </p>
            )}
            <p className="text-2xl font-mono font-black tracking-[0.2em] text-[#4fdbc8] mt-2">
              {justCreated.enrollment_code}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Gửi mã tham gia (6 ký tự) cho sinh viên. SV nhập mã này hoặc mã học phần đầy đủ trên thanh Sinh viên.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(justCreated.enrollment_code);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700"
            >
              <KeyRound size={16} />
              Sao chép mã
            </button>
            <button
              type="button"
              onClick={() => setJustCreated(null)}
              className="px-4 py-2 rounded-lg text-slate-500 text-sm hover:text-slate-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleFilter}
        className="rounded-xl border border-slate-800 bg-[#131b2e] p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter size={16} /> Lọc
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase">Học kỳ</label>
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="HK1-2025"
            className="mt-0.5 rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200 w-36"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase">Loại</label>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            className="mt-0.5 rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200 min-w-[140px]"
          >
            {COURSE_TYPES.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase">lecturer_id</label>
          <input
            type="number"
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
            placeholder="ID GV"
            className="mt-0.5 rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200 w-28"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100 text-sm font-semibold hover:bg-slate-600"
        >
          Áp dụng
        </button>
      </form>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#131b2e] border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#dae2fd]">Tạo lớp học phần</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Tên lớp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm"
              />
              <div>
                <input
                  placeholder="Mã lớp (để trống → tự sinh)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Bỏ trống để hệ thống tự sinh mã dạng DA-HK12025-XXXX
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="Học kỳ (semester)"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Năm học"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <select
                value={form.courseType}
                onChange={(e) =>
                  setForm({ ...form, courseType: e.target.value as CreateCourseBody["courseType"] })
                }
                className="w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200"
              >
                <option value="project">project (đồ án)</option>
                {!isInstructor && <option value="thesis">thesis (khóa luận — Manager/Admin)</option>}
                <option value="research">research (NCKH)</option>
                <option value="internship">internship</option>
              </select>
              <textarea
                placeholder="Mô tả (tuỳ chọn)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm min-h-[72px]"
              />
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Sĩ số tối đa</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.maxStudents ?? 30}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxStudents: Math.min(500, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                  className="mt-0.5 w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold disabled:opacity-50"
                >
                  {creating && <Loader2 className="animate-spin" size={16} />}
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#131b2e] px-8 py-16 text-center text-slate-500">
          Chưa có lớp nào hoặc không khớp bộ lọc.
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border border-slate-800/80 bg-[#131b2e] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                isAdmin
                  ? "hover:border-violet-500/30"
                  : isInstructor
                    ? "hover:border-indigo-500/30"
                    : "hover:border-amber-500/30"
              }`}
            >
              <Link to={`${base}/courses/${c.id}`} className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                  <BookOpen size={12} /> {c.code}
                  {c.enrollment_code && (
                    <span className="font-mono text-[#4fdbc8] normal-case tracking-widest">
                      · mã tham gia: {c.enrollment_code}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#dae2fd] mt-1">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {c.lecturer_name || "—"} · {c.semester} {c.academic_year}
                </p>
              </Link>
              <div className="flex items-center gap-4 text-sm shrink-0">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users size={16} className="text-[#4fdbc8]" />
                  <span className="font-semibold text-[#dae2fd]">
                    {c.student_count}
                    {c.max_students != null ? (
                      <span className="text-slate-500 font-normal"> / {c.max_students}</span>
                    ) : null}
                  </span>
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400 capitalize">
                  {c.course_type}
                </span>
                <Link
                  to={`${base}/courses/${c.id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-[#adc6ff] hover:bg-slate-800 transition-colors"
                  title="Xem & sửa chi tiết"
                >
                  <ExternalLink size={16} />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(c.id, c.name);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Lưu trữ lớp (xóa mềm)"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
