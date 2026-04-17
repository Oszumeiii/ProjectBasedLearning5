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
          <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
            <UserCog className="text-violet-400" size={28} />
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
          <label className="text-xs text-slate-500 mb-1 block">Tìm kiếm</label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên, email, mã SV..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#131b2e] border border-slate-800 text-sm text-slate-200"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Vai trò</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#131b2e] border border-slate-800 text-sm text-slate-200 min-w-[140px]"
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
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-500"
        >
          Tìm
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-300">
          {error}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">Tổng: {total} tài khoản</p>
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#131b2e] overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-[#0b1326] text-left text-[10px] uppercase tracking-wider text-slate-500">
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
                    className="border-t border-slate-800/80 hover:bg-[#171f33]"
                  >
                    <td className="px-4 py-3 font-medium text-[#dae2fd]">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{STATUS_LABEL[u.account_status] || u.account_status}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
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
                            className="text-xs bg-[#0b1326] border border-slate-700 rounded px-2 py-1.5 text-slate-200"
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
                              className="text-xs rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-1.5 text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-50"
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
