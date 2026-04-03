import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const STORAGE_KEY = "pbl5_access_control";

export type ModuleKey =
  | "dashboard"
  | "courses"
  | "reports"
  | "users"
  | "access"
  | "import";

export interface RoleModuleAccess {
  /** Quản lý được xem trang Người dùng (chỉ đọc / hạn chế) */
  managerCanViewUsers: boolean;
  /** Quản lý được vào trang phân quyền (thường tắt) */
  managerCanViewAccessSettings: boolean;
  /** Module bật cho từng role (demo UI — sau nối API) */
  modulesByRole: Record<
    "student" | "lecturer" | "manager" | "admin",
    Partial<Record<ModuleKey, boolean>>
  >;
}

const defaultAccess: RoleModuleAccess = {
  managerCanViewUsers: false,
  managerCanViewAccessSettings: false,
  modulesByRole: {
    student: { dashboard: true, courses: true, reports: true },
    lecturer: {
      dashboard: true,
      courses: true,
      reports: true,
      import: false,
    },
    manager: { dashboard: true, courses: true, reports: true, users: false },
    admin: {
      dashboard: true,
      courses: true,
      reports: true,
      users: true,
      access: true,
      import: true,
    },
  },
};

function loadAccess(): RoleModuleAccess {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RoleModuleAccess>;
      return {
        ...defaultAccess,
        ...parsed,
        modulesByRole: {
          ...defaultAccess.modulesByRole,
          ...parsed.modulesByRole,
          student: {
            ...defaultAccess.modulesByRole.student,
            ...parsed.modulesByRole?.student,
          },
          lecturer: {
            ...defaultAccess.modulesByRole.lecturer,
            ...parsed.modulesByRole?.lecturer,
          },
          manager: {
            ...defaultAccess.modulesByRole.manager,
            ...parsed.modulesByRole?.manager,
          },
          admin: {
            ...defaultAccess.modulesByRole.admin,
            ...parsed.modulesByRole?.admin,
          },
        },
      };
    }
  } catch {
    /* ignore */
  }
  return defaultAccess;
}

interface AccessControlContextType {
  access: RoleModuleAccess;
  setManagerCanViewUsers: (v: boolean) => void;
  setManagerCanViewAccessSettings: (v: boolean) => void;
  setModuleForRole: (
    role: keyof RoleModuleAccess["modulesByRole"],
    mod: ModuleKey,
    enabled: boolean
  ) => void;
  resetToDefaults: () => void;
}

const AccessControlContext = createContext<AccessControlContextType | null>(
  null
);

export const useAccessControl = () => {
  const ctx = useContext(AccessControlContext);
  if (!ctx)
    throw new Error("useAccessControl must be used within AccessControlProvider");
  return ctx;
};

export const AccessControlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [access, setAccess] = useState<RoleModuleAccess>(loadAccess);

  const persist = useCallback((next: RoleModuleAccess) => {
    setAccess(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setManagerCanViewUsers = useCallback(
    (v: boolean) => {
      persist({
        ...access,
        managerCanViewUsers: v,
        modulesByRole: {
          ...access.modulesByRole,
          manager: {
            ...access.modulesByRole.manager,
            users: v,
          },
        },
      });
    },
    [access, persist]
  );

  const setManagerCanViewAccessSettings = useCallback(
    (v: boolean) => {
      persist({
        ...access,
        managerCanViewAccessSettings: v,
        modulesByRole: {
          ...access.modulesByRole,
          manager: {
            ...access.modulesByRole.manager,
            access: v,
          },
        },
      });
    },
    [access, persist]
  );

  const setModuleForRole = useCallback(
    (
      role: keyof RoleModuleAccess["modulesByRole"],
      mod: ModuleKey,
      enabled: boolean
    ) => {
      persist({
        ...access,
        modulesByRole: {
          ...access.modulesByRole,
          [role]: {
            ...access.modulesByRole[role],
            [mod]: enabled,
          },
        },
      });
    },
    [access, persist]
  );

  const resetToDefaults = useCallback(() => {
    persist({ ...defaultAccess });
  }, [persist]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setAccess(loadAccess());
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AccessControlContext.Provider
      value={{
        access,
        setManagerCanViewUsers,
        setManagerCanViewAccessSettings,
        setModuleForRole,
        resetToDefaults,
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
};
