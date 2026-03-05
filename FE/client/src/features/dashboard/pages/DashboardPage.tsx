import DashboardLayout from "../../../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import ProjectTable from "../components/ProjectTable";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Dashboard Quản lý & Thống kê
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Hệ thống phân tích NCKH tích hợp RAG Engine
          </p>
        </div>
        <div className="flex gap-2">{/* Buttons... */}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng đồ án"
          value="2,482"
          trend="+12.5% so với tháng trước"
          icon="folder_special"
          variant="blue"
        />
        <StatCard
          title="Đề tài NCKH"
          value="156"
          trend="+4 đề tài mới tuần này"
          icon="science"
          variant="purple"
        />
        <StatCard
          title="Token AI đã dùng"
          value="4.2M"
          trend="Hạn mức còn lại: 1.8M"
          icon="generating_tokens"
          variant="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Bạn có thể tạo tiếp component ChartProgress.tsx */}
        </div>
      </div>

      <ProjectTable />
    </DashboardLayout>
  );
};

export default DashboardPage;
