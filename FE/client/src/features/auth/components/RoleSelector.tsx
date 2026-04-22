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
    activeColor: "peer-checked:border-brand",
    activeBg: "peer-checked:bg-brand/5",
    activeRing: "peer-checked:shadow-[0_0_0_1px_rgb(124,58,237)]",
    activeText: "peer-checked:text-brand",
  },
  {
    value: "lecturer",
    label: "Giảng viên",
    icon: "person_book",
    activeColor: "peer-checked:border-mint",
    activeBg: "peer-checked:bg-mint/5",
    activeRing: "peer-checked:shadow-[0_0_0_1px_rgb(20,184,166)]",
    activeText: "peer-checked:text-mint",
  },
  {
    value: "manager",
    label: "Quản lý",
    icon: "supervisor_account",
    activeColor: "peer-checked:border-ink-body",
    activeBg: "peer-checked:bg-app-inset",
    activeRing: "peer-checked:shadow-[0_0_0_1px_rgb(51,65,85)]",
    activeText: "peer-checked:text-ink-heading",
  },
  {
    value: "admin",
    label: "Quản trị",
    icon: "admin_panel_settings",
    activeColor: "peer-checked:border-ink-heading",
    activeBg: "peer-checked:bg-slate-900",
    activeRing: "peer-checked:shadow-[0_0_0_1px_rgb(15,23,42)]",
    activeText: "peer-checked:text-white",
  },
];

const RoleSelector = ({ selectedRole, onChange }: RoleSelectorProps) => {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ROLE_OPTIONS.map((role) => (
        <label key={role.value} className="group cursor-pointer">
          <input
            className="peer hidden"
            name="role"
            type="radio"
            value={role.value}
            checked={selectedRole === role.value}
            onChange={() => onChange(role.value)}
          />
          <div
            className={`role-card flex flex-col items-center justify-center rounded-claude-lg border border-app-line bg-app-card p-4 transition-all ${role.activeColor} ${role.activeBg} ${role.activeRing}`}
          >
            <span
              className={`material-symbols-outlined mb-2 text-2xl text-ink-faint transition-colors ${role.activeText}`}
            >
              {role.icon}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted transition-colors group-hover:text-ink-heading sm:text-xs">
              {role.label}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RoleSelector;
