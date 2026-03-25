// src/features/materials/components/AiTutorSidebar.tsx
import { Bot, History, Send, ShieldCheck } from "lucide-react";

export const AiTutorSidebar = () => {
  return (
    <aside className="w-[420px] bg-[#0b1326]/40 backdrop-blur-xl border-l border-slate-800/50 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#0566d9] flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#dae2fd]">
                AI Tutor Assistant
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#4fdbc8] rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-[#4fdbc8] uppercase tracking-widest">
                  System Online
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-[#c6c6cd] hover:text-white transition-colors">
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tin nhắn mẫu */}
        <div className="flex gap-3 max-w-[90%]">
          <div className="bg-[#171f33] rounded-tr-xl rounded-b-xl p-4 text-sm text-[#dae2fd] border border-slate-800/30">
            Hello! I've indexed all your course materials. How can I help?
          </div>
        </div>
      </div>

      <div className="p-6 bg-[#131b2e]/50 border-t border-slate-800/50">
        <div className="relative flex items-center">
          <input
            className="w-full bg-[#2d3449]/40 border border-slate-700/50 focus:border-[#adc6ff]/50 focus:ring-0 rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#dae2fd] placeholder:text-[#798098]"
            placeholder="Ask about materials..."
          />
          <button className="absolute right-2 p-2 bg-[#adc6ff] text-[#001a42] rounded-lg">
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
