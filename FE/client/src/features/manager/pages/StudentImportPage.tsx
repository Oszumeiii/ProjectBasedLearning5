import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Upload,
  Mail,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useAccessControl } from "../../../context/AccessControlContext";
import {
  importStudentsFromCsv,
  listImportBatches,
  resendActivationEmail,
  type ImportBatchRow,
  type ImportStudentsResult,
} from "../services/admin.service";

const SAMPLE_CSV = `email,full_name,student_code,class_name,major,department,intake_year
sv1@example.edu,Nguyễn Văn A,20110001,D22CQCN01,Công nghệ thông tin,Khoa CNTT,2022`;

export const StudentImportPage = () => {
  const { user } = useAuth();
  const { access } = useAccessControl();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const unauthorizedManager = isManager && !access.managerCanViewUsers;

  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportStudentsResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [batches, setBatches] = useState<ImportBatchRow[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const loadBatches = async () => {
    if (unauthorizedManager) return;
    setLoadingBatches(true);
    try {
      const items = await listImportBatches();
      setBatches(items.filter((b) => b.batch_type === "student"));
    } catch {
      /* ignore */
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    if (unauthorizedManager) return;
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ load khi quyền thay đổi
  }, [unauthorizedManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setSubmitError("Vui lòng chọn file CSV.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const data = await importStudentsFromCsv(file, semester || undefined);
      setResult(data);
      setFile(null);
      await loadBatches();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không import được. Kiểm tra file và thử lại.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = resendEmail.trim().toLowerCase();
    if (!em) return;
    setResending(true);
    setResendStatus(null);
    try {
      const r = await resendActivationEmail(em);
      setResendStatus(r.message);
      setResendEmail("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gửi không thành công.";
      setResendStatus(msg);
    } finally {
      setResending(false);
    }
  };

  if (unauthorizedManager) {
    return <Navigate to="/manager/lobby" replace />;
  }

  return (
    <div className="max-w-4xl animate-in space-y-8 duration-500 fade-in">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-heading">
          <FileSpreadsheet className={isAdmin ? "text-violet-700" : "text-amber-700"} size={28} />
          Import sinh viên (CSV)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {isAdmin ? (
            <>
              <strong className="text-ink-heading">Admin</strong> thường phụ trách nhập khối lượng lớn, đồng bộ đầu
              khóa và gửi email kích hoạt toàn trường.
            </>
          ) : (
            <>
              <strong className="text-ink-heading">Quản lý</strong> có thể thực hiện thao tác tương tự khi được phân
              quyền (cùng API với Admin).
            </>
          )}{" "}
          Hệ thống tạo tài khoản ở trạng thái &quot;chờ kích hoạt&quot; và gửi email chứa liên kết đặt mật khẩu (cần
          cấu hình SMTP trên server).
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-app-line bg-app-elevated p-4 text-sm text-ink-body">
        <Info className="mt-0.5 shrink-0 text-brand" size={18} />
        <div className="space-y-2">
          <p>
            <strong className="text-ink-heading">Cột bắt buộc:</strong>{" "}
            <code className="rounded bg-app-inset px-1.5 py-0.5 text-xs">email</code>,{" "}
            <code className="rounded bg-app-inset px-1.5 py-0.5 text-xs">full_name</code>. Tùy chọn:{" "}
            <code className="text-xs text-ink-faint">student_code</code>,{" "}
            <code className="text-xs text-ink-faint">class_name</code>, <code className="text-xs text-ink-faint">major</code>,{" "}
            <code className="text-xs text-ink-faint">department</code>,{" "}
            <code className="text-xs text-ink-faint">intake_year</code>.
          </p>
          <p className="text-xs text-ink-faint">Tối đa 5MB. Email trùng trong hệ thống sẽ bị bỏ qua.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink-muted">Học kỳ / ghi chú batch (tùy chọn)</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="VD: HK2 2025-2026"
              className="w-full rounded-lg border border-app-line bg-app-inset px-3 py-2 text-sm text-ink-heading placeholder:text-ink-faint focus:ring-1 focus:ring-brand/25"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink-muted">File CSV</label>
            <label className="flex cursor-pointer items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-app-line bg-app-elevated px-4 py-2 text-sm text-ink-heading transition-colors hover:bg-app-inset">
                <Upload size={16} />
                Chọn file
              </span>
              <span className="truncate text-sm text-ink-muted">{file?.name || "Chưa chọn file"}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !file}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isAdmin ? "bg-brand hover:bg-brand-hover" : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Đang xử lý...
            </>
          ) : (
            <>
              <Upload size={18} />
              Tải lên &amp; gửi email kích hoạt
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <CheckCircle2 size={22} />
            Import hoàn tất (batch #{result.batchId})
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-muted">Tổng dòng</dt>
              <dd className="font-mono text-ink-heading">{result.totalRows}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Tạo mới</dt>
              <dd className="font-mono text-emerald-800">{result.success}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Email đã gửi</dt>
              <dd className="flex items-center gap-1 font-mono text-brand">
                <Mail size={14} /> {result.emailsSent}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Lỗi / bỏ qua</dt>
              <dd className="font-mono text-amber-800">
                {result.failed} / {result.skipped}
              </dd>
            </div>
          </dl>
          {result.errors && result.errors.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-app-line">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-app-line text-ink-faint">
                    <th className="p-2">Dòng</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.slice(0, 50).map((er, i) => (
                    <tr key={i} className="border-b border-app-line">
                      <td className="p-2 font-mono">{er.row}</td>
                      <td className="p-2">{er.email || "—"}</td>
                      <td className="p-2 text-ink-muted">{er.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.errors.length > 50 && (
                <p className="p-2 text-center text-ink-muted">… và {result.errors.length - 50} dòng khác</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink-heading">
          <Mail size={18} className="text-mint" />
          Gửi lại email kích hoạt (một địa chỉ)
        </h3>
        <p className="text-xs text-ink-muted">
          Dùng khi sinh viên không nhận được thư hoặc liên kết hết hạn (tài khoản vẫn ở trạng thái chờ kích hoạt).
        </p>
        <form onSubmit={handleResend} className="flex flex-wrap items-end gap-3">
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="email@truong.edu.vn"
            className="min-w-[200px] flex-1 rounded-lg border border-app-line bg-app-inset px-3 py-2 text-sm text-ink-heading"
          />
          <button
            type="submit"
            disabled={resending || !resendEmail.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-app-elevated px-4 py-2 text-sm font-semibold text-ink-heading transition-colors hover:bg-app-inset disabled:opacity-50"
          >
            {resending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Gửi lại
          </button>
        </form>
        {resendStatus && <p className="text-sm text-ink-muted">{resendStatus}</p>}
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-heading">
          <FileSpreadsheet size={20} className="text-ink-muted" />
          Lịch sử import sinh viên
        </h3>
        {loadingBatches ? (
          <div className="flex items-center gap-2 py-8 text-ink-muted">
            <Loader2 className="animate-spin" size={20} />
            Đang tải...
          </div>
        ) : batches.length === 0 ? (
          <p className="py-6 text-sm text-ink-muted">Chưa có lần import nào.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-app-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-app-inset text-left text-ink-faint">
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Người thực hiện</th>
                  <th className="px-4 py-3 text-right font-medium">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-t border-app-line hover:bg-app-elevated/80">
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {new Date(b.imported_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-ink-heading">{b.file_name}</td>
                    <td className="px-4 py-3 text-ink-muted">{b.imported_by_name}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span className="text-emerald-700">{b.success_rows}</span>
                      <span className="text-ink-faint"> / </span>
                      <span className="text-ink-body">{b.total_rows}</span>
                      {b.semester && <span className="mt-1 block text-ink-faint">{b.semester}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <details className="rounded-lg border border-dashed border-app-line p-4 text-sm text-ink-muted">
        <summary className="cursor-pointer font-medium text-ink-body">Tải mẫu CSV</summary>
        <pre className="mt-3 overflow-x-auto rounded bg-app-inset p-3 font-mono text-xs text-ink-muted">
          {SAMPLE_CSV}
        </pre>
      </details>
    </div>
  );
};
