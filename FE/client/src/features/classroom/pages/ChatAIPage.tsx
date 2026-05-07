import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReportById, type Report } from "../services/report.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatAIPage = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reportId) return;
    const fetchReport = async () => {
      try {
        const data = await getReportById(Number(reportId));
        setReport(data);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Xin chào! Tôi là trợ lý AI cho tài liệu "${data.title}". Bạn có thể hỏi tôi bất kỳ câu hỏi gì về nội dung báo cáo này.`,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        console.error("Failed to load report", err);
      }
    };
    fetchReport();
  }, [reportId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // TODO: Integrate with actual RAG API endpoint
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          "Tính năng Chat AI đang được phát triển. Hệ thống sẽ sử dụng RAG (Retrieval-Augmented Generation) để trả lời câu hỏi dựa trên nội dung tài liệu của bạn.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-app">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-app-line bg-app-card px-6 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-ink-muted hover:bg-app-inset hover:text-ink-heading"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-heading">Chat AI</h2>
            {report && (
              <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                <FileText size={10} /> {report.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-brand text-white"
                    : "border border-app-line bg-app-card text-ink-body"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.role === "user" ? "text-white/60" : "text-ink-faint"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-heading/10 text-ink-heading">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl border border-app-line bg-app-card px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand/50 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand/50 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-app-line bg-app-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về nội dung tài liệu..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-app-line bg-app-inset px-4 py-3 text-sm text-ink-heading placeholder:text-ink-faint focus:border-brand/35 focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand/90 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
