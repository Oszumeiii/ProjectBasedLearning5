const AuthHeader = () => {
  return (
    <header
      className="w-full z-50"
      style={{
        background: "rgba(16,22,34,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #135bec, #1e40af)" }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: "18px" }}
            >
              auto_awesome
            </span>
          </div>
          <span className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
            RAG
            <span style={{ color: "#135bec" }}>-NCKH</span>
          </span>
        </div>

        {/* Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            type="button"
            className="text-sm font-medium transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#135bec")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            Hướng dẫn
          </button>
          <button
            type="button"
            className="text-sm font-medium transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#135bec")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            Về chúng tôi
          </button>
          <button
            className="text-sm font-bold text-white px-5 py-2 rounded-lg transition-all"
            style={{ background: "#135bec" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1048cc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#135bec")}
          >
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
