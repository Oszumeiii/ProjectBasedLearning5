import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getOverviewStats,
  type OverviewStats,
} from "../services/stats.service";

export const ManagerLobbyPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOverviewStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Tổng người dùng",
          value: stats.totalStudents,
          icon: "group",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          label: "Tổng đồ án",
          value: stats.totalProjects,
          icon: "folder_open",
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          label: "Tổng báo cáo",
          value: stats.totalReports,
          icon: "description",
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
        {
          label: "Kiểm tra đạo văn",
          value: stats.totalPlagiarismChecks,
          icon: "plagiarism",
          color: "text-red-400",
          bg: "bg-red-500/10",
        },
        {
          label: "Phản hồi",
          value: stats.totalFeedback,
          icon: "rate_review",
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          label: "Truy vấn RAG",
          value: stats.totalRagQueries,
          icon: "smart_toy",
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
        },
      ]
    : [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div
        className={`p-8 rounded-xl border bg-gradient-to-br from-[#131b2e] to-[#171f33] ${
          user?.role === "admin"
            ? "border-violet-500/25"
            : "border-amber-500/20"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              user?.role === "admin"
                ? "bg-violet-500/20 text-violet-300"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {user?.role === "admin" ? "Quản trị viên" : "Quản lý vận hành"}
          </span>
        </div>
        <h3 className="font-headline text-3xl font-extrabold text-[#dae2fd] tracking-tight">
          Xin chào, {user?.full_name}
        </h3>
        <p className="text-[#c6c6cd] mt-2 max-w-3xl">
          {user?.role === "admin" ? (
            <>
              Bạn có <strong className="text-violet-300">quyền cao nhất</strong>{" "}
              trong không gian này: xem thống kê toàn hệ thống, quản lý{" "}
              <strong className="text-violet-300">người dùng</strong> và{" "}
              <strong className="text-violet-300">phân quyền truy cập</strong>{" "}
              cho các vai trò. Quản lý chỉ thấy phần vận hành trừ khi bạn ủy quyền
              thêm trong menu Phân quyền.
            </>
          ) : (
            <>
              <strong className="text-amber-400">Vai trò Quản lý</strong> tập
              trung vào khóa học, báo cáo và giám sát hoạt động. Các mục{" "}
              <strong className="text-slate-400">Người dùng / Phân quyền</strong>{" "}
              chỉ hiện khi Admin bật ủy quyền trong trang quản trị.
            </>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-400">Đang tải thống kê...</span>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50 hover:border-slate-700/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <span
                    className={`material-symbols-outlined ${card.color} text-xl`}
                  >
                    {card.icon}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#c6c6cd]">
                  {card.label}
                </h4>
              </div>
              <p className="text-3xl font-black text-[#dae2fd]">
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Không thể tải thống kê
        </div>
      )}
    </div>
  );
};
