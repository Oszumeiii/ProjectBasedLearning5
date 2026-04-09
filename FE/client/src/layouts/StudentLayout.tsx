// src/layouts/StudentLayout.tsx
import { Outlet } from "react-router-dom";
import { SideNavBar } from "./components/SideNavBar";
import { TopNavBar } from "./components/TopNavBar";

export const StudentLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-[#dae2fd] font-body">
      {/* 1. Thanh điều hướng bên trái (Cố định) */}
      <SideNavBar />

      {/* 2. Khu vực nội dung bên phải */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 3. Thanh công cụ phía trên (Sticky) */}
        <TopNavBar />

        {/* 4. Vùng hiển thị nội dung các Page (Lobby, Classroom, v.v.) */}
        <main className="flex-1 overflow-y-auto bg-[#0b1326] custom-scrollbar">
          {/* Outlet là nơi React Router sẽ render StudentLobbyPage vào */}
          <Outlet />
        </main>
      </div>

      {/* Overlay cho Mobile (Nếu sau này bạn làm Responsive) */}
      <div className="fixed inset-0 bg-black/50 z-30 hidden md:hidden" />
    </div>
  );
};
