const Header = () => {
  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">
              search_spark
            </span>
          </div>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
            placeholder="Tìm kiếm ngữ nghĩa..."
            type="text"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 ml-8">
        <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0f172a]"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">GS. Nguyễn Văn A</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">
              Giảng viên / Admin
            </p>
          </div>
          <div className="relative group cursor-pointer">
            <div
              className="size-11 rounded-xl bg-slate-200 dark:bg-slate-700 bg-cover bg-center ring-2 ring-offset-2 ring-primary/20 group-hover:ring-primary transition-all"
              style={{
                backgroundImage:
                  'url("https://ui-avatars.com/api/?name=Admin")',
              }}
            ></div>
            <span className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
