interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: string;
  variant: "blue" | "purple" | "orange";
}

const StatCard = ({ title, value, trend, icon, variant }: StatCardProps) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-primary",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-accent",
    orange: "bg-orange-50 dark:bg-orange-500/10 text-orange-600",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colors[variant]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-extrabold">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
        <span className="material-symbols-outlined text-sm">trending_up</span>
        <span>{trend}</span>
      </div>
    </div>
  );
};
export default StatCard;
