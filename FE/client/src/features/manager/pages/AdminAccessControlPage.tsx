import { Navigate } from "react-router-dom";
import { useAccessControl, type ModuleKey } from "../../../context/AccessControlContext";
import { useAuth } from "../../auth/context/AuthContext";
import { Layers, Shield, Users, Info, Eye } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  student: "Sinh viên",
  lecturer: "Giảng viên",
  manager: "Quản lý",
  admin: "Quản trị viên",
};

const MODULE_LABEL: Record<ModuleKey, string> = {
  dashboard: "Tổng quan / Dashboard",
  courses: "Khóa học & lớp",
  reports: "Báo cáo & hồ sơ",
  users: "Người dùng (danh sách)",
  access: "Phân quyền & truy cập",
  import: "Import CSV / hàng loạt",
};

export const AdminAccessControlPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const {
    access,
    setManagerCanViewUsers,
    setManagerCanViewAccessSettings,
    setModuleForRole,
    resetToDefaults,
  } = useAccessControl();

  if (isManager && !access.managerCanViewAccessSettings) {
    return <Navigate to="/manager/lobby" replace />;
  }

  const modules: ModuleKey[] = [
    "dashboard",
    "courses",
    "reports",
    "users",
    "access",
    "import",
  ];

  const roles = ["student", "lecturer", "manager", "admin"] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-heading">
          <Shield className="text-mint" size={28} />
          Phân quyền & phạm vi truy cập
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {isAdmin ? (
            <>
              Chỉ <strong className="text-ink-heading">Quản trị viên</strong> chỉnh được. Cấu hình lưu
              trên trình duyệt (demo) — sau này đồng bộ API.
            </>
          ) : (
            <>
              <Eye size={14} className="mr-1 inline text-amber-600" />
              Bạn đang xem theo quyền được Admin ủy quyền — chỉ xem, không chỉnh sửa.
            </>
          )}
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-app-line bg-app-elevated p-5">
        <Info className="mt-0.5 shrink-0 text-brand" size={20} />
        <div className="text-sm leading-relaxed text-ink-body">
          <p className="mb-2 flex items-center gap-2 font-bold text-ink-heading">
            <Layers size={16} /> Phân cấp đề xuất
          </p>
          <ul className="list-disc space-y-1 pl-5 text-ink-muted">
            <li>
              <strong className="text-ink-heading">Admin</strong> — toàn quyền hệ thống, cấu hình quyền
              cho các role khác.
            </li>
            <li>
              <strong className="text-ink-heading">Quản lý</strong> — vận hành dữ liệu (lớp, báo cáo),
              có thể được ủy quyền xem danh sách người dùng hoặc không.
            </li>
            <li>
              <strong className="text-ink-heading">Giảng viên / Sinh viên</strong> — không vào trang
              này; quyền module được minh họa ở bảng dưới cho tài liệu nghiệp vụ.
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-app-line bg-app-card p-6 shadow-whisper">
        <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800">
          <Users size={18} /> Ủy quyền cho tài khoản Quản lý
        </h3>
        <p className="text-xs text-ink-muted">
          Khi bật, menu tương ứng sẽ xuất hiện ở giao diện{" "}
          <span className="font-mono text-ink-heading">/manager</span> sau khi đăng nhập vai trò Quản
          lý.
        </p>
        <label
          className={`flex items-center justify-between gap-4 rounded-lg border border-app-line bg-app-inset p-4 ${isAdmin ? "cursor-pointer hover:border-amber-300" : "opacity-90"}`}
        >
          <span className="text-sm text-ink-body">
            Cho phép Quản lý xem trang <strong>Người dùng</strong> (danh sách, không xóa / không đổi
            quyền hệ thống)
          </span>
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={access.managerCanViewUsers}
            onChange={(e) => setManagerCanViewUsers(e.target.checked)}
            className="h-5 w-5 rounded border-app-line text-brand focus:ring-brand disabled:opacity-50"
          />
        </label>
        <label
          className={`flex items-center justify-between gap-4 rounded-lg border border-app-line bg-app-inset p-4 ${isAdmin ? "cursor-pointer hover:border-amber-300" : "opacity-90"}`}
        >
          <span className="text-sm text-ink-body">
            Cho phép Quản lý xem trang <strong>Phân quyền</strong> (chỉ đọc — khuyến nghị tắt)
          </span>
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={access.managerCanViewAccessSettings}
            onChange={(e) => setManagerCanViewAccessSettings(e.target.checked)}
            className="h-5 w-5 rounded border-app-line text-brand focus:ring-brand disabled:opacity-50"
          />
        </label>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-heading">Ma trận module theo vai trò (minh họa)</h3>
        <div className="overflow-x-auto rounded-xl border border-app-line bg-app-card">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="bg-app-inset text-left text-[10px] uppercase text-ink-faint">
                <th className="px-4 py-3 font-semibold">Module</th>
                {roles.map((r) => (
                  <th key={r} className="px-3 py-3 font-semibold text-center">
                    {ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod} className="border-t border-app-line">
                  <td className="px-4 py-3 text-ink-body">{MODULE_LABEL[mod]}</td>
                  {roles.map((r) => {
                    if (r === "admin") {
                      return (
                        <td key={r} className="px-3 py-3 text-center">
                          <span className="text-xs font-bold text-mint">✓</span>
                        </td>
                      );
                    }
                    const enabled = !!access.modulesByRole[r]?.[mod];
                    return (
                      <td key={r} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={enabled}
                          onChange={(e) =>
                            setModuleForRole(r, mod, e.target.checked)
                          }
                          className="rounded border-app-line disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Đặt lại cấu hình mặc định?"))
                resetToDefaults();
            }}
            className="text-xs text-ink-muted hover:text-red-600"
          >
            Đặt lại mặc định
          </button>
        </div>
      )}
    </div>
  );
};
