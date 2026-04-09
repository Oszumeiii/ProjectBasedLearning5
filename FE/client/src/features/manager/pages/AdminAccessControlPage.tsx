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
        <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
          <Shield className="text-violet-400" size={28} />
          Phân quyền & phạm vi truy cập
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin ? (
            <>
              Chỉ <strong className="text-violet-300">Quản trị viên</strong>{" "}
              chỉnh được. Cấu hình lưu trên trình duyệt (demo) — sau này đồng bộ
              API.
            </>
          ) : (
            <>
              <Eye size={14} className="inline mr-1 text-amber-400" />
              Bạn đang xem theo quyền được Admin ủy quyền — chỉ xem, không chỉnh
              sửa.
            </>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 flex gap-3">
        <Info className="text-violet-400 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-slate-300 leading-relaxed">
          <p className="font-bold text-[#dae2fd] mb-2 flex items-center gap-2">
            <Layers size={16} /> Phân cấp đề xuất
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong className="text-violet-300">Admin</strong> — toàn quyền
              hệ thống, cấu hình quyền cho các role khác.
            </li>
            <li>
              <strong className="text-amber-300">Quản lý</strong> — vận hành
              dữ liệu (lớp, báo cáo), có thể được ủy quyền xem danh sách người
              dùng hoặc không.
            </li>
            <li>
              <strong className="text-indigo-300">Giảng viên / Sinh viên</strong>{" "}
              — không vào trang này; quyền module được minh họa ở bảng dưới cho
              tài liệu nghiệp vụ.
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#131b2e] p-6 space-y-4">
        <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2">
          <Users size={18} /> Ủy quyền cho tài khoản Quản lý
        </h3>
        <p className="text-xs text-slate-500">
          Khi bật, menu tương ứng sẽ xuất hiện ở giao diện{" "}
          <span className="text-amber-300">/manager</span> sau khi đăng nhập
          vai trò Quản lý.
        </p>
        <label className={`flex items-center justify-between gap-4 p-4 rounded-lg bg-[#0b1326] border border-slate-800 ${isAdmin ? "cursor-pointer hover:border-amber-500/30" : "opacity-90"}`}>
          <span className="text-sm text-slate-300">
            Cho phép Quản lý xem trang <strong>Người dùng</strong> (danh sách,
            không xóa / không đổi quyền hệ thống)
          </span>
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={access.managerCanViewUsers}
            onChange={(e) => setManagerCanViewUsers(e.target.checked)}
            className="w-5 h-5 rounded border-slate-600 text-violet-600 focus:ring-violet-500 disabled:opacity-50"
          />
        </label>
        <label className={`flex items-center justify-between gap-4 p-4 rounded-lg bg-[#0b1326] border border-slate-800 ${isAdmin ? "cursor-pointer hover:border-amber-500/30" : "opacity-90"}`}>
          <span className="text-sm text-slate-300">
            Cho phép Quản lý xem trang <strong>Phân quyền</strong> (chỉ đọc —
            khuyến nghị tắt)
          </span>
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={access.managerCanViewAccessSettings}
            onChange={(e) => setManagerCanViewAccessSettings(e.target.checked)}
            className="w-5 h-5 rounded border-slate-600 text-violet-600 focus:ring-violet-500 disabled:opacity-50"
          />
        </label>
      </div>

      <div>
        <h3 className="text-[#dae2fd] font-bold text-sm mb-3">
          Ma trận module theo vai trò (minh họa)
        </h3>
        <div className="rounded-xl border border-slate-800 overflow-x-auto bg-[#131b2e]">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-[#0b1326] text-left text-[10px] uppercase text-slate-500">
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
                <tr key={mod} className="border-t border-slate-800/80">
                  <td className="px-4 py-3 text-slate-300">{MODULE_LABEL[mod]}</td>
                  {roles.map((r) => {
                    if (r === "admin") {
                      return (
                        <td key={r} className="px-3 py-3 text-center">
                          <span className="text-violet-400 text-xs font-bold">
                            ✓
                          </span>
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
                          className="rounded border-slate-600 disabled:opacity-50"
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
            className="text-xs text-slate-500 hover:text-red-400"
          >
            Đặt lại mặc định
          </button>
        </div>
      )}
    </div>
  );
};
