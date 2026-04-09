import React, { useEffect, useState } from "react";
import { MilestoneItem } from "../components/MilestoneItem";
import { CreateMilestoneForm } from "../components/CreateMilestoneForm";
import {
  listProjects,
  type Project,
} from "../../classroom/services/project.service";
import {
  listMilestones,
  type Milestone,
} from "../../classroom/services/milestone.service";

export const SchedulePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await listProjects({ limit: 50 });
        const items = data.items || [];
        setProjects(items);
        if (items.length > 0) {
          setSelectedProjectId(items[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchMilestones = async () => {
      try {
        const items = await listMilestones(selectedProjectId);
        setMilestones(items);
      } catch (err) {
        console.error("Failed to load milestones", err);
        setMilestones([]);
      }
    };
    fetchMilestones();
  }, [selectedProjectId]);

  const getMilestoneStatus = (
    m: Milestone
  ): "active" | "upcoming" | "closed" => {
    if (m.status === "completed") return "closed";
    if (m.status === "in_progress") return "active";
    return "upcoming";
  };

  const completedCount = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const activeCount = milestones.filter(
    (m) => m.status === "in_progress"
  ).length;
  const completionPct =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  return (
    <main className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-extrabold text-[#dae2fd] font-manrope tracking-tight mb-2">
            Lịch trình & Mốc tiến độ
          </h2>
          <p className="text-slate-400 max-w-lg">
            Quản lý các mốc quan trọng, tiến độ nộp báo cáo và phản hồi.
          </p>
        </div>
      </div>

      {projects.length > 1 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedProjectId === p.id
                  ? "bg-indigo-600 text-white"
                  : "bg-[#171f33] text-slate-400 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-400">Đang tải...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">
            event_note
          </span>
          <p className="text-lg">Chưa có đồ án nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8 relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent"></div>

            {milestones.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Chưa có mốc tiến độ nào cho đồ án này
              </div>
            ) : (
              <div className="space-y-12">
                {milestones.map((m) => (
                  <MilestoneItem
                    key={m.id}
                    status={getMilestoneStatus(m)}
                    title={m.milestone}
                    description={m.description || ""}
                    dateRange={
                      m.due_date
                        ? `Hạn: ${new Date(m.due_date).toLocaleDateString("vi-VN")}`
                        : "Chưa đặt hạn"
                    }
                    stats={m.status === "completed" ? "Hoàn thành" : m.status}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <CreateMilestoneForm />

            <div className="bg-[#131b2e] rounded-2xl p-8 border border-slate-800/50">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
                Tiến độ tổng thể
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    Hoàn thành
                  </span>
                  <span className="text-sm font-bold text-[#4fdbc8]">
                    {completionPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#0b1326] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4fdbc8] rounded-full shadow-[0_0_12px_rgba(79,219,200,0.3)]"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                      Tổng mốc
                    </p>
                    <p className="text-2xl font-black text-[#dae2fd]">
                      {milestones.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#171f33] border border-slate-800">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                      Đang thực hiện
                    </p>
                    <p className="text-2xl font-black text-[#adc6ff]">
                      {String(activeCount).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
