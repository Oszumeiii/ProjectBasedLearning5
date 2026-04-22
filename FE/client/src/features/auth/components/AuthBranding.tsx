const AuthBranding = () => {
  return (
    <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-brand/5 via-app to-app-card p-12 lg:flex">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute left-[-10%] top-[-15%] h-[480px] w-[480px] rounded-full bg-brand/10"
          style={{ filter: "blur(64px)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-mint/10"
          style={{ filter: "blur(56px)" }}
        />
      </div>

      <div
        className="absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-app-line bg-app-card px-4 py-1.5 shadow-whisper">
          <span className="material-symbols-outlined text-sm text-brand">verified</span>
          <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            Hệ thống AI thông minh
          </span>
        </div>

        <h1 className="mb-4 font-headline text-4xl font-semibold leading-tight tracking-tight text-ink-heading">
          Quản lý &amp; Truy vấn
          <br />
          <span className="text-brand">Nghiên cứu khoa học</span>
        </h1>

        <div className="mb-6 h-1 w-16 rounded-full bg-brand" />

        <p className="mb-10 text-base leading-relaxed text-ink-muted">
          Tối ưu hóa quy trình quản lý đồ án và nghiên cứu khoa học với công nghệ{" "}
          <span className="font-medium text-ink-heading">Retrieval-Augmented Generation (RAG)</span>. Tra cứu
          thông tin chính xác, nhanh chóng từ kho dữ liệu học thuật.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: "database",
              title: "Kho dữ liệu tập trung",
              desc: "Lưu trữ hàng ngàn báo cáo chất lượng.",
            },
            {
              icon: "psychology",
              title: "Hỗ trợ bởi AI",
              desc: "Hỏi đáp trực tiếp dựa trên nội dung đồ án.",
            },
          ].map((card) => (
            <div
              key={card.icon}
              className="rounded-claude-lg border border-app-line bg-app-card p-5 shadow-whisper"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-claude-sm bg-brand/10">
                <span className="material-symbols-outlined text-lg text-brand">{card.icon}</span>
              </div>
              <h4 className="mb-1 font-headline text-sm font-semibold text-ink-heading">{card.title}</h4>
              <p className="text-xs leading-relaxed text-ink-muted">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-app-line pt-8">
          {[
            { value: "2,400+", label: "Đồ án" },
            { value: "98%", label: "Chính xác" },
            { value: "< 2s", label: "Phản hồi" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-1 font-headline text-xl font-semibold text-mint">{stat.value}</div>
              <div className="text-xs text-ink-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthBranding;
