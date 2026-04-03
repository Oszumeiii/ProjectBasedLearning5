import type { Role, RoleOption } from "../types/auth.types";

interface RoleSelectorProps {
  selectedRole: Role;
  onChange: (role: Role) => void;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "student",
    label: "Sinh viên",
    icon: "school",
    activeColor: "peer-checked:border-primary peer-checked:ring-primary",
    activeBg: "peer-checked:bg-primary/10",
    activeRing: "peer-checked:ring-1",
    activeText: "peer-checked:text-primary group-hover:text-primary",
  },
  {
    value: "lecturer",
    label: "Giảng viên",
    icon: "person_book",
    activeColor:
      "peer-checked:border-secondary-green peer-checked:ring-secondary-green",
    activeBg: "peer-checked:bg-secondary-green/10",
    activeRing: "peer-checked:ring-1",
    activeText:
      "peer-checked:text-secondary-green group-hover:text-secondary-green",
  },
  {
    value: "manager",
    label: "Quản lý",
    icon: "supervisor_account",
    activeColor:
      "peer-checked:border-amber-400 peer-checked:ring-amber-400",
    activeBg: "peer-checked:bg-amber-400/10",
    activeRing: "peer-checked:ring-1",
    activeText:
      "peer-checked:text-amber-400 group-hover:text-amber-400",
  },
  {
    value: "admin",
    label: "Quản trị",
    icon: "admin_panel_settings",
    activeColor: "peer-checked:border-white dark:peer-checked:border-white",
    activeBg: "peer-checked:bg-white/10",
    activeRing: "",
    activeText: "peer-checked:text-white group-hover:text-white",
  },
];

const RoleSelector = ({ selectedRole, onChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-3 mb-8">
      {ROLE_OPTIONS.map((role) => (
        <label key={role.value} className="cursor-pointer group">
          <input
            className="hidden peer"
            name="role"
            type="radio"
            value={role.value}
            checked={selectedRole === role.value}
            onChange={() => onChange(role.value)}
          />
          <div
            className={`role-card flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 ${role.activeColor} ${role.activeBg} ${role.activeRing} transition-all`}
          >
            <span
              className={`material-symbols-outlined text-2xl mb-2 text-slate-400 ${role.activeText} transition-colors`}
            >
              {role.icon}
            </span>
            <span className="text-xs font-bold uppercase tracking-tight">
              {role.label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RoleSelector;
