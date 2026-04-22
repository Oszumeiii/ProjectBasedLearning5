import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Search, ShieldAlert, UserCog } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useAccessControl } from "../../../context/AccessControlContext";
import {
  listAdminUsers,
  resendActivationEmail,
  updateUserAccountStatus,
  type AdminUserRow,
} from "../services/admin.service";

const STATUS_LABEL: Record<string, string> = {
  active: "Hoạt động",
  pending_activation: "Chờ kích hoạt",
  locked: "Khóa",
  suspended: "Tạm ngưng",
  graduated: "Đã tốt nghiệp",
};

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const { access } = useAccessControl();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const unauthorizedManager =
    isManager && !access.managerCanViewUsers;

  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    if (unauthorizedManager) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        limit: 50,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      setError("Không tải được danh sách người dùng.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unauthorizedManager) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load() uses search/roleFilter; search applied via form submit
  }, [roleFilter, unauthorizedManager]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleStatusChange = async (id: number, accountStatus: string) => {
    if (!isAdmin) return;
    setUpdatingId(id);
    try {
      await updateUserAccountStatus(id, accountStatus);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResendActivation = async (email: string) => {
    if (!isAdmin) return;
    setUpdatingId(-1);
    try {
      const result = await resendActivationEmail(email);
      alert(result.message || "Đã gửi lại email kích hoạt");
    } catch (err: any) {
      alert(err.response?.data?.message || "Không gửi lại được email kích hoạt");
    } finally {
      setUpdatingId(null);
    }
  };

  if (unauthorizedManager) {
    return <Navigate to="/manager/lobby" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-heading">
            <UserCog className="text-violet-700" size={28} />
            Người dùng hệ thống
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin
              ? "Quản trị viên: xem, lọc và cập nhật trạng thái tài khoản."
              : "Quản lý: xem danh sách theo phạm vi được cấp (chỉ đọc / hạn chế thao tác)."}
          </p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-2 text-amber-400/90 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <ShieldAlert size={14} />
            Chế độ quản lý — không xóa tài khoản
          </div>
        )}
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs text-ink-faint">Tìm kiếm</label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên, email, mã SV..."
              className="w-full rounded-lg border border-app-line bg-app-inset py-2 pl-9 pr-3 text-sm text-ink-heading"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-faint">Vai trò</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="min-w-[140px] rounded-lg border border-app-line bg-app-inset px-3 py-2 text-sm text-ink-heading"
          >
            <option value="">Tất cả</option>
            <option value="student">Sinh viên</option>
            <option value="lecturer">Giảng viên</option>
            <option value="manager">Quản lý</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-hover"
        >
          Tìm
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">
          {error}
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-muted">Tổng: {total} tài khoản</p>
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-app-line bg-app-card">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-app-inset text-left text-[10px] uppercase tracking-wider text-ink-faint">
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Đăng nhập</th>
                  {isAdmin && <th className="px-4 py-3 w-48">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-app-line hover:bg-app-elevated"
                  >
                    <td className="px-4 py-3 font-medium text-ink-heading">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-app-inset px-2 py-0.5 text-[10px] font-bold uppercase text-ink-body">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {STATUS_LABEL[u.account_status] || u.account_status}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-muted lg:table-cell">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 max-w-[180px]">
                          <select
                            disabled={updatingId === u.id}
                            value={u.account_status}
                            onChange={(e) =>
                              handleStatusChange(u.id, e.target.value)
                            }
                            className="rounded border border-app-line bg-app-inset px-2 py-1.5 text-xs text-ink-heading"
                          >
                            {Object.entries(STATUS_LABEL).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                          {u.account_status === "pending_activation" && (
                            <button
                              type="button"
                              disabled={updatingId === -1}
                              onClick={() => handleResendActivation(u.email)}
                              className="rounded border border-brand/25 bg-brand/10 px-2 py-1.5 text-xs text-brand hover:bg-brand/15 disabled:opacity-50"
                            >
                              Gửi lại kích hoạt
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
