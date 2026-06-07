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
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Tổng đồ án",
          value: stats.totalProjects,
          icon: "folder_open",
          color: "text-amber-700",
          bg: "bg-amber-50",
        },
        {
          label: "Tổng báo cáo",
          value: stats.totalReports,
          icon: "description",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
        {
          label: "Kiểm tra đạo văn",
          value: stats.totalPlagiarismChecks,
          icon: "plagiarism",
          color: "text-red-700",
          bg: "bg-red-50",
        },
        {
          label: "Phản hồi",
          value: stats.totalFeedback,
          icon: "rate_review",
          color: "text-violet-700",
          bg: "bg-violet-50",
        },
        {
          label: "Truy vấn RAG",
          value: stats.totalRagQueries,
          icon: "smart_toy",
          color: "text-cyan-700",
          bg: "bg-cyan-50",
        },
      ]
    : [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div
        className={`rounded-xl border bg-app-card p-8 shadow-whisper ${
          user?.role === "admin" ? "border-app-line ring-1 ring-brand/10" : "border-app-line"
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
              user?.role === "admin"
                ? "bg-violet-100 text-violet-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {user?.role === "admin" ? "Quản trị viên" : "Quản lý vận hành"}
          </span>
        </div>
        <h3 className="font-headline text-3xl font-extrabold tracking-tight text-ink-heading">
          Xin chào, {user?.full_name}
        </h3>
        <p className="mt-2 max-w-3xl text-ink-body">
          {user?.role === "admin" ? (
            <>
              Bạn có <strong className="text-ink-heading">quyền cao nhất</strong> trong không gian
              này: xem thống kê toàn hệ thống, quản lý{" "}
              <strong className="text-ink-heading">người dùng</strong> và{" "}
              <strong className="text-ink-heading">phân quyền truy cập</strong> cho các vai trò.
              Quản lý chỉ thấy phần vận hành trừ khi bạn ủy quyền thêm trong menu Phân quyền.
            </>
          ) : (
            <>
              <strong className="text-amber-900">Vai trò Quản lý</strong> tập trung vào khóa học,
              báo cáo và giám sát hoạt động. Các mục{" "}
              <strong className="text-ink-muted">Người dùng / Phân quyền</strong> chỉ hiện khi
              Admin bật ủy quyền trong trang quản trị.
            </>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <span className="ml-3 text-ink-muted">Đang tải thống kê...</span>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-app-line bg-app-card p-6 shadow-whisper transition-all hover:border-app-track"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <span className={`material-symbols-outlined ${card.color} text-xl`}>
                    {card.icon}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink-muted">{card.label}</h4>
              </div>
              <p className="text-3xl font-black text-ink-heading">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-ink-muted">
          Không thể tải thống kê
        </div>
      )}
    </div>
  );
};
