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
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không import được. Kiểm tra file và thử lại.";
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
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gửi không thành công.";
      setResendStatus(msg);
    } finally {
      setResending(false);
    }
  };

  if (unauthorizedManager) {
    return <Navigate to="/manager/lobby" replace />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
          <FileSpreadsheet
            className={isAdmin ? "text-violet-400" : "text-amber-400"}
            size={28}
          />
          Import sinh viên (CSV)
        </h2>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          {isAdmin ? (
            <>
              <strong className="text-slate-300">Admin</strong> thường phụ trách
              nhập khối lượng lớn, đồng bộ đầu khóa và gửi email kích hoạt toàn
              trường.
            </>
          ) : (
            <>
              <strong className="text-slate-300">Quản lý</strong> có thể thực
              hiện thao tác tương tự khi được phân quyền (cùng API với Admin).
            </>
          )}{" "}
          Hệ thống tạo tài khoản ở trạng thái &quot;chờ kích hoạt&quot; và gửi
          email chứa liên kết đặt mật khẩu (cần cấu hình SMTP trên server).
        </p>
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-[#131b2e]/80 p-4 flex gap-3 text-sm text-slate-300">
        <Info className="text-[#adc6ff] shrink-0 mt-0.5" size={18} />
        <div className="space-y-2">
          <p>
            <strong className="text-[#dae2fd]">Cột bắt buộc:</strong>{" "}
            <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded">
              email
            </code>
            ,{" "}
            <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded">
              full_name
            </code>
            . Tùy chọn:{" "}
            <code className="text-xs text-slate-500">student_code</code>,{" "}
            <code className="text-xs text-slate-500">class_name</code>,{" "}
            <code className="text-xs text-slate-500">major</code>,{" "}
            <code className="text-xs text-slate-500">department</code>,{" "}
            <code className="text-xs text-slate-500">intake_year</code>.
          </p>
          <p className="text-slate-500 text-xs">
            Tối đa 5MB. Email trùng trong hệ thống sẽ bị bỏ qua.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-800 bg-[#131b2e] p-6 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Học kỳ / ghi chú batch (tùy chọn)
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="VD: HK2 2025-2026"
              className="w-full rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-[#0566d9]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              File CSV
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                <Upload size={16} />
                Chọn file
              </span>
              <span className="text-sm text-slate-500 truncate">
                {file?.name || "Chưa chọn file"}
              </span>
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
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !file}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdmin
              ? "bg-violet-600 hover:bg-violet-500"
              : "bg-amber-600 hover:bg-amber-500"
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
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <CheckCircle2 size={22} />
            Import hoàn tất (batch #{result.batchId})
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Tổng dòng</dt>
              <dd className="text-[#dae2fd] font-mono">{result.totalRows}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tạo mới</dt>
              <dd className="text-emerald-400 font-mono">{result.success}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email đã gửi</dt>
              <dd className="text-[#adc6ff] font-mono flex items-center gap-1">
                <Mail size={14} /> {result.emailsSent}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Lỗi / bỏ qua</dt>
              <dd className="text-amber-400 font-mono">
                {result.failed} / {result.skipped}
              </dd>
            </div>
          </dl>
          {result.errors && result.errors.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-500">
                    <th className="p-2">Dòng</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.slice(0, 50).map((er, i) => (
                    <tr key={i} className="border-b border-slate-800/80">
                      <td className="p-2 font-mono">{er.row}</td>
                      <td className="p-2">{er.email || "—"}</td>
                      <td className="p-2 text-slate-400">{er.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.errors.length > 50 && (
                <p className="p-2 text-slate-500 text-center">
                  … và {result.errors.length - 50} dòng khác
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-[#131b2e] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#dae2fd] flex items-center gap-2">
          <Mail size={18} className="text-[#adc6ff]" />
          Gửi lại email kích hoạt (một địa chỉ)
        </h3>
        <p className="text-xs text-slate-500">
          Dùng khi sinh viên không nhận được thư hoặc liên kết hết hạn (tài khoản
          vẫn ở trạng thái chờ kích hoạt).
        </p>
        <form onSubmit={handleResend} className="flex flex-wrap gap-3 items-end">
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="email@truong.edu.vn"
            className="flex-1 min-w-[200px] rounded-lg bg-[#0b1326] border border-slate-700 px-3 py-2 text-sm text-slate-200"
          />
          <button
            type="submit"
            disabled={resending || !resendEmail.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold text-slate-100 disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            Gửi lại
          </button>
        </form>
        {resendStatus && (
          <p className="text-sm text-slate-400">{resendStatus}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#dae2fd] mb-4 flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-slate-400" />
          Lịch sử import sinh viên
        </h3>
        {loadingBatches ? (
          <div className="flex items-center gap-2 text-slate-500 py-8">
            <Loader2 className="animate-spin" size={20} />
            Đang tải...
          </div>
        ) : batches.length === 0 ? (
          <p className="text-slate-500 text-sm py-6">Chưa có lần import nào.</p>
        ) : (
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-left">
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Người thực hiện</th>
                  <th className="px-4 py-3 font-medium text-right">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-slate-800 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(b.imported_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-[#dae2fd]">{b.file_name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {b.imported_by_name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span className="text-emerald-400">{b.success_rows}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-slate-300">{b.total_rows}</span>
                      {b.semester && (
                        <span className="block text-slate-500 mt-1">
                          {b.semester}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <details className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
        <summary className="cursor-pointer text-slate-400 font-medium">
          Tải mẫu CSV
        </summary>
        <pre className="mt-3 p-3 rounded bg-[#0b1326] text-xs overflow-x-auto text-slate-400 font-mono">
          {SAMPLE_CSV}
        </pre>
      </details>
    </div>
  );
};
