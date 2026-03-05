const AuthBranding = () => {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
      style={{ background: "#101622" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(19,91,236,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(19,91,236,0.15)",
            border: "1px solid rgba(19,91,236,0.4)",
          }}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ color: "#135bec" }}
          >
            verified
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#93a3b8" }}
          >
            Hệ thống AI thông minh
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-4xl font-bold leading-tight mb-4"
          style={{ color: "#ffffff" }}
        >
          Quản lý &amp; Truy vấn
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #135bec, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Nghiên cứu khoa học
          </span>
        </h1>

        {/* Gradient divider */}
        <div
          className="w-16 h-1 rounded-full mb-6"
          style={{ background: "linear-gradient(90deg, #135bec, #10b981)" }}
        />

        {/* Description */}
        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "#64748b" }}
        >
          Tối ưu hóa quy trình quản lý đồ án và nghiên cứu khoa học với công
          nghệ{" "}
          <span style={{ color: "#93a3b8", fontWeight: 500 }}>
            Retrieval-Augmented Generation (RAG)
          </span>
          . Tra cứu thông tin chính xác, nhanh chóng từ kho dữ liệu học thuật.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: "database",
              color: "#135bec",
              bg: "rgba(19,91,236,0.2)",
              title: "Kho dữ liệu tập trung",
              desc: "Lưu trữ hàng ngàn báo cáo chất lượng.",
            },
            {
              icon: "psychology",
              color: "#10b981",
              bg: "rgba(16,185,129,0.2)",
              title: "Hỗ trợ bởi AI",
              desc: "Hỏi đáp trực tiếp dựa trên nội dung đồ án.",
            },
          ].map((card) => (
            <div
              key={card.icon}
              className="p-5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: card.bg }}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: card.color }}
                >
                  {card.icon}
                </span>
              </div>
              <h4
                className="font-bold text-sm mb-1"
                style={{ color: "#e2e8f0" }}
              >
                {card.title}
              </h4>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#475569" }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="mt-8 pt-8 grid grid-cols-3 gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            { value: "2,400+", label: "Đồ án" },
            { value: "98%", label: "Chính xác" },
            { value: "< 2s", label: "Phản hồi" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-xl font-bold mb-1"
                style={{
                  background: "linear-gradient(90deg, #135bec, #10b981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "#475569" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthBranding;
