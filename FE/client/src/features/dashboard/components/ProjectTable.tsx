const ProjectTable = () => {
  const projects = [
    {
      id: 1,
      title: "Hệ thống RAG cho truy vấn văn bản luật",
      student: "Trần Thế Anh",
      tag: "AI/NLP",
      score: "9.2",
      grade: "A+",
    },
    // ... dữ liệu khác
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-bold">Đề tài nổi bật</h3>
        <button className="text-primary text-sm font-bold hover:bg-primary/5 px-3 py-1.5 rounded-lg">
          Xem tất cả
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
              <th className="px-6 py-4">Tên đề tài</th>
              <th className="px-6 py-4">Sinh viên</th>
              <th className="px-6 py-4">Phân loại</th>
              <th className="px-6 py-4">Đánh giá AI</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {projects.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group"
              >
                {/* Render các cột TD ở đây */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ProjectTable;
