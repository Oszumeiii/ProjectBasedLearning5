import { useEffect, useState } from "react";
import { FileText, Eye, Calendar } from "lucide-react";
import {
  listReports,
  updateReportStatus,
  type Report,
} from "../../classroom/services/report.service";

export const ManagerReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await listReports({ limit: 100, sort: "recent" });
      setReports(data.items || []);
    } catch (e: unknown) {
      setError("Không tải được danh sách báo cáo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleQuickReview = async (id: number, status: "approved" | "revision_needed" | "rejected") => {
    setActingId(id);
    try {
      await updateReportStatus(id, status);
      await load();
    } catch (e) {
      console.error("Failed to update report status", e);
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <span className="ml-3 text-ink-muted">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6 duration-500 fade-in">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-heading">
          <FileText className="text-amber-600" size={28} /> Báo cáo
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Theo dõi báo cáo gần đây trên toàn hệ thống</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-app-line bg-app-card px-8 py-16 text-center text-ink-muted shadow-whisper">
          Chưa có báo cáo nào.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-app-line bg-app-card shadow-whisper">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-app-inset text-left text-[10px] uppercase tracking-wider text-ink-faint">
                <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Tác giả</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} /> Lượt xem
                  </span>
                </th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} /> Ngày
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Duyệt nhanh</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-app-line transition-colors hover:bg-app-elevated">
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-ink-heading">{r.title}</td>
                  <td className="hidden px-4 py-3 text-ink-muted md:table-cell">{r.author_name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-app-inset px-2 py-0.5 text-[10px] font-bold uppercase text-ink-body">
                      {r.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{r.view_count}</td>
                  <td className="hidden px-4 py-3 text-xs text-ink-muted lg:table-cell">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickReview(r.id, "approved")}
                        disabled={actingId === r.id || r.status === "approved"}
                        className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold disabled:opacity-40"
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReview(r.id, "revision_needed")}
                        disabled={actingId === r.id || r.status === "approved"}
                        className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold disabled:opacity-40"
                      >
                        Sửa lại
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReview(r.id, "rejected")}
                        disabled={actingId === r.id || r.status === "approved"}
                        className="px-2 py-1 rounded bg-red-500/15 text-red-300 text-[10px] font-bold disabled:opacity-40"
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
