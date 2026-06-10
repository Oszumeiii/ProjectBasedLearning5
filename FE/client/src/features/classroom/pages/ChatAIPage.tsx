import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Send, Bot, User, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReportById, type Report } from "../services/report.service";
import { askRagQA } from "../services/rag.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function formatRagAskError(err: unknown): string {
  const fallback =
    "Không thể gửi câu hỏi tới hệ thống RAG. Vui lòng thử lại sau.";
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data;
  if (!data || typeof data !== "object") {
    return err.message === "Network Error"
      ? "Không kết nối được máy chủ. Kiểm tra backend đang chạy."
      : fallback;
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") {
    const d = obj.detail.trim();
    if (d.startsWith("{")) {
      try {
        const inner = JSON.parse(d) as { detail?: unknown };
        if (typeof inner.detail === "string") return inner.detail;
      } catch {
        /* use raw detail string */
      }
    }
    if (d) return d;
  }
  if (typeof obj.message === "string" && obj.message) return obj.message;
  return fallback;
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

        const msgs: Message[] = [];

        if (data.summary) {
          msgs.push({
            id: "summary",
            role: "assistant",
            content: `📋 Tóm tắt báo cáo:\n\n${data.summary}`,
            timestamp: new Date(),
          });
        }

        msgs.push({
          id: "welcome",
          role: "assistant",
          content: `Xin chào! Tôi là trợ lý AI cho tài liệu "${data.title}". Bạn có thể hỏi tôi bất kỳ câu hỏi gì về nội dung báo cáo này.`,
          timestamp: new Date(),
        });

        setMessages(msgs);
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
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await askRagQA({
        question: userMessage.content,
        reportId: reportId ? Number(reportId) : null,
      });

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("Failed to ask RAG QA", err);
      const aiResponse: Message = {
        id: `ai-error-${Date.now()}`,
        role: "assistant",
        content: formatRagAskError(err),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-app">
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
                  {msg.timestamp.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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

      <div className="border-t border-app-line bg-app-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hoi ve noi dung tai lieu..."
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
