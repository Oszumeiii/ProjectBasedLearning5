const Sidebar = () => {
  return (
    <aside className="w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-50">
      <div className="p-6 flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-gradient-to-br from-primary to-accent size-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold leading-none tracking-tight">
              RAG Admin
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">
              Smart Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border-r-4 border-primary font-bold transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <p className="text-sm">Dashboard</p>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <p className="text-sm">Kho đồ án</p>
          </a>
          <a
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/20 my-2 transition-transform hover:scale-[1.02]"
            href="#"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">chat_spark</span>
              <p className="text-sm">AI Chat</p>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Pro
            </span>
          </a>
          {/* ... Thêm các link khác tương tự ... */}
        </nav>

        {/* Plan Status */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">
                  electric_bolt
                </span>
              </div>
              <p className="text-xs font-bold">Gói Doanh Nghiệp</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-orange-500 h-full w-[85%] rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500">
              85% dung lượng Vector Storage
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
