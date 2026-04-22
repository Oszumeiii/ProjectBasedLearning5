// src/layouts/StudentLayout.tsx
import { Outlet } from "react-router-dom";
import { SideNavBar } from "./components/SideNavBar";
import { TopNavBar } from "./components/TopNavBar";

export const StudentLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-app font-body text-ink-body">
      <SideNavBar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavBar />

        <main className="custom-scrollbar flex-1 overflow-y-auto bg-app">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-0 z-30 hidden bg-slate-900/20 md:hidden" />
    </div>
  );
};
