const Navbar = () => {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">
              auto_awesome
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">RAG-NCKH</h2>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium hover:text-primary" href="#">
            Hướng dẫn
          </a>
          <a className="text-sm font-medium hover:text-primary" href="#">
            Về chúng tôi
          </a>
          <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold">
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
