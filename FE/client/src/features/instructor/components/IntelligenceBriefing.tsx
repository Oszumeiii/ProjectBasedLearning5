// features/instructor/components/IntelligenceBriefing.tsx
import React from "react";

const BriefingItem = ({ type, title, time, description }: any) => {
  const isUrgent = type === "urgent";
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10 hover:bg-surface-container-highest transition-colors cursor-pointer">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? "bg-error-container/20" : "bg-tertiary-container/20"}`}
      >
        <span
          className={`material-symbols-outlined ${isUrgent ? "text-error" : "text-tertiary"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isUrgent ? "priority_high" : "verified"}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span
            className={`text-xs font-bold tracking-widest uppercase ${isUrgent ? "text-error" : "text-tertiary"}`}
          >
            {title}
          </span>
          <span className="text-[10px] text-outline">{time}</span>
        </div>
        <p className="text-sm text-on-surface font-medium mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export const IntelligenceBriefing = () => {
  return (
    <div className="mt-16 bg-surface-container rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-indigo-400">
          auto_awesome
        </span>
        <h3 className="font-manrope font-bold text-xl tracking-tight text-on-surface">
          Intelligence Briefing
        </h3>
      </div>
      <div className="space-y-4">
        <BriefingItem
          type="urgent"
          title="Urgent Grading"
          time="14m ago"
          description={
            <>
              4 new submissions in{" "}
              <span className="text-indigo-400">ARM-2024</span> require human
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
