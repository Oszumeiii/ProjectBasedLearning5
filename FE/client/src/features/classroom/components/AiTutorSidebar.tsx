// src/features/materials/components/AiTutorSidebar.tsx
import { Bot, History, Send } from "lucide-react";

export const AiTutorSidebar = () => {
  return (
    <aside className="flex w-[420px] flex-col border-l border-app-line bg-app-card/95 shadow-whisper backdrop-blur-md">
      <div className="border-b border-app-line p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-whisper">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-heading">AI Tutor Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-mint">
                  System Online
                </span>
              </div>
            </div>
          </div>
          <button type="button" className="p-2 text-ink-muted transition-colors hover:text-ink-heading">
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex max-w-[90%] gap-3">
          <div className="rounded-tr-xl rounded-b-xl border border-app-line bg-app-inset p-4 text-sm text-ink-body">
            Hello! I&apos;ve indexed all your course materials. How can I help?
          </div>
        </div>
      </div>

      <div className="border-t border-app-line bg-app-elevated p-6">
        <div className="relative flex items-center">
          <input
            className="w-full rounded-xl border border-app-line bg-app-card py-3.5 pl-4 pr-12 text-sm text-ink-heading placeholder:text-ink-faint focus:border-brand/35 focus:ring-0"
            placeholder="Ask about materials..."
          />
          <button
            type="button"
            className="absolute right-2 rounded-lg bg-brand p-2 text-white hover:bg-brand-hover"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
