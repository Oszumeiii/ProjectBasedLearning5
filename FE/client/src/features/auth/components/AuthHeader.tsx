const AuthHeader = () => {
  return (
    <header className="z-50 w-full border-b border-app-line bg-app-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-claude-sm bg-brand shadow-whisper">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>
              auto_awesome
            </span>
          </div>
          <span className="font-headline text-xl font-semibold text-ink-heading">
            RAG<span className="text-brand">-NCKH</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button type="button" className="text-sm text-ink-muted transition-colors hover:text-brand">
            Hướng dẫn
          </button>
          <button type="button" className="text-sm text-ink-muted transition-colors hover:text-brand">
            Về chúng tôi
          </button>
          <button
            type="button"
            className="rounded-claude bg-brand px-5 py-2 text-sm font-semibold text-white shadow-whisper transition-colors hover:bg-brand-hover"
          >
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
