// features/instructor/components/IntelligenceBriefing.tsx
import React from "react";

const BriefingItem = ({
  type,
  title,
  time,
  description,
}: {
  type: string;
  title: string;
  time: string;
  description: React.ReactNode;
}) => {
  const isUrgent = type === "urgent";
  return (
    <div className="flex cursor-pointer items-start gap-4 rounded-xl border border-app-line bg-app-inset/60 p-4 transition-colors hover:bg-app-elevated">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isUrgent ? "bg-red-100" : "bg-app-track"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isUrgent ? "text-red-700" : "text-mint"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isUrgent ? "priority_high" : "verified"}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${isUrgent ? "text-red-700" : "text-mint"}`}
          >
            {title}
          </span>
          <span className="text-[10px] text-ink-faint">{time}</span>
        </div>
        <p className="mt-1 text-sm font-medium text-ink-body">{description}</p>
      </div>
    </div>
  );
};

export const IntelligenceBriefing = () => {
  return (
    <div className="relative mt-16 overflow-hidden rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/5 blur-[80px]" />
      <div className="mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-brand">auto_awesome</span>
        <h3 className="text-xl font-bold tracking-tight text-ink-heading">Intelligence Briefing</h3>
      </div>
      <div className="space-y-4">
        <BriefingItem
          type="urgent"
          title="Urgent Grading"
          time="14m ago"
          description={
            <>
              4 new submissions in <span className="font-semibold text-brand">ARM-2024</span> require human
              verification on AI citations.
            </>
          }
        />
        <BriefingItem
          type="info"
          title="System Update"
          time="2h ago"
          description="New RAG model 'Curator-v4' is now available for thesis cross-referencing."
        />
      </div>
    </div>
  );
};
