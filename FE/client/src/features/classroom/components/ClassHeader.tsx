import { BookOpen } from "lucide-react";

interface ClassHeaderProps {
  title: string;
  teacher: string;
  action?: React.ReactNode;
}

export const ClassHeader = ({ title, teacher, action }: ClassHeaderProps) => (
  <div className="border-b border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-mint">
            <BookOpen size={16} /> Course Workspace
          </div>
          <h1 className="text-4xl font-black tracking-tight text-ink-heading">{title}</h1>
          <p className="mt-2 flex items-center gap-2 text-ink-body">
            Giảng viên: <span className="font-semibold text-ink-heading">{teacher}</span>
          </p>
        </div>
        {action && <div className="flex gap-4">{action}</div>}
      </div>
    </div>
  </div>
);
