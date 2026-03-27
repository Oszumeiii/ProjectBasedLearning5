// src/features/auth/components/RoleSelector.tsx

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
    activeBg: "peer-checked:bg-primary/5",
    activeRing: "peer-checked:ring-2",
    activeText: "peer-checked:text-primary",
  },
  {
    value: "lecturer",
    label: "Giảng viên",
    icon: "person_book",
    activeColor: "peer-checked:border-secondary peer-checked:ring-secondary",
    activeBg: "peer-checked:bg-secondary/5",
    activeRing: "peer-checked:ring-2",
    activeText: "peer-checked:text-secondary",
  },
  {
    value: "admin",
    label: "Quản trị",
    icon: "admin_panel_settings",
    activeColor: "peer-checked:border-white",
    activeBg: "peer-checked:bg-white/5",
    activeRing: "peer-checked:ring-2",
    activeText: "peer-checked:text-white",
  },
];

const RoleSelector = ({ selectedRole, onChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
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
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
              {role.label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RoleSelector;
