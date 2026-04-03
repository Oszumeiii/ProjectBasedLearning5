import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "../features/classroom/services/notification.service";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listNotifications({ limit: 10 });
        const items = data.items || [];
        setNotifications(items);
        setUnreadCount(items.filter((n: Notification) => !n.is_read).length);
      } catch {
        // silently fail
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-white relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-[#131b2e] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-sm font-bold text-[#dae2fd]">Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-400 hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Không có thông báo
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`px-4 py-3 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/30 transition-colors ${
                    !n.is_read ? "bg-indigo-900/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm text-[#dae2fd] font-medium">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
