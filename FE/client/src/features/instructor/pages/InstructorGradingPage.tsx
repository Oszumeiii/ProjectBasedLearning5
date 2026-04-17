import React, { useEffect, useState } from "react";
import { SubmissionRow } from "../components/SubmissionRow";
import {
  listReports,
  updateReportStatus,
  type Report,
} from "../../classroom/services/report.service";

export const InstructorGradingPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchReports = async () => {
    try {
      const data = await listReports({ limit: 50, sort: "recent" });
      setReports(data.items || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const handleQuickReview = async (id: number, status: "approved" | "revision_needed" | "rejected") => {
    setActingId(id);
    try {
      await updateReportStatus(id, status);
      await fetchReports();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActingId(null);
    }
  };

  const statusCounts = {
    pending: reports.filter((r) => r.status === "pending").length,
    underReview: reports.filter((r) => r.status === "under_review").length,
    approved: reports.filter((r) => r.status === "approved").length,
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-manrope font-extrabold text-[#dae2fd] tracking-tight">
            Trung tâm phản hồi
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Quản lý nhận xét, kiểm tra đạo văn và phân tích báo cáo.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-[#171f33] text-slate-300 text-sm font-semibold flex items-center gap-2 border border-slate-800 hover:bg-slate-800">
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Lọc
          </button>
        </div>
      </div>

      <div className="bg-[#131b2e] rounded-xl overflow-hidden border border-slate-800 mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Đang tải...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Chưa có báo cáo nào được nộp
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#171f33] text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded-sm bg-slate-900 border-slate-700"
                  />
                </th>
                <th className="py-4 px-4">Mã báo cáo</th>
                <th className="py-4 px-4">Tác giả</th>
                <th className="py-4 px-4">Tên báo cáo</th>
                <th className="py-4 px-4">Ngày nộp</th>
                <th className="py-4 px-4">Trạng thái</th>
                <th className="py-4 px-4">Loại file</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <SubmissionRow
                  key={report.id}
                  id={`#${report.id}`}
                  name={report.author_name}
                  fileName={report.title}
                  date={new Date(report.created_at).toLocaleDateString("vi-VN")}
                  plagiarism={0}
                  status={
                    report.status === "approved"
                      ? "Done"
                      : report.status === "under_review"
                        ? "Analyzing"
                        : "Not Run"
                  }
                  onApprove={() => handleQuickReview(report.id, "approved")}
                  onRevision={() => handleQuickReview(report.id, "revision_needed")}
                  onReject={() => handleQuickReview(report.id, "rejected")}
                  busy={actingId === report.id}
                  disableActions={report.status === "approved"}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        <div className="md:col-span-2 bg-[#131b2e] p-6 rounded-xl border border-slate-800">
          <h3 className="text-slate-100 font-bold mb-4">Tổng quan nộp bài</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800 text-center">
              <p className="text-2xl font-black text-amber-400">
                {statusCounts.pending}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                Chờ xử lý
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800 text-center">
              <p className="text-2xl font-black text-blue-400">
                {statusCounts.underReview}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                Đang duyệt
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800 text-center">
              <p className="text-2xl font-black text-emerald-400">
                {statusCounts.approved}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                Đã duyệt
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900/40 to-[#0b1326] p-6 rounded-xl border border-indigo-500/20">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-emerald-400">
              psychology
            </span>
          </div>
          <h3 className="text-white font-bold text-lg">Tổng quan</h3>
          <p className="text-slate-400 text-xs mt-2">
            Tổng cộng {reports.length} báo cáo đã được nộp.
          </p>
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>TỈ LỆ DUYỆT</span>
              <span className="text-emerald-400">
                {reports.length > 0
                  ? Math.round(
                      (statusCounts.approved / reports.length) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${reports.length > 0 ? (statusCounts.approved / reports.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
