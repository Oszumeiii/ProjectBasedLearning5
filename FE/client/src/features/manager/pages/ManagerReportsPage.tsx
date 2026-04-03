import { useEffect, useState } from "react";
import { FileText, Eye, Calendar } from "lucide-react";
import { listReports, type Report } from "../../classroom/services/report.service";

export const ManagerReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listReports({ limit: 100, sort: "newest" });
        setReports(data.items || []);
      } catch (e: unknown) {
        setError("Không tải được danh sách báo cáo.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
          <FileText className="text-amber-400" size={28} /> Báo cáo
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Theo dõi báo cáo gần đây trên toàn hệ thống
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#131b2e] px-8 py-16 text-center text-slate-500">
          Chưa có báo cáo nào.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#131b2e]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0b1326] text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">Tiêu đề</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Tác giả</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={12} /> Lượt xem
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} /> Ngày
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-800/80 hover:bg-[#171f33] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[#dae2fd] max-w-[200px] truncate">
                    {r.title}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {r.author_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                    {r.view_count}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
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
