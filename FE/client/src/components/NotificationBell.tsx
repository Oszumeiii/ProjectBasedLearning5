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
        className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-app-inset hover:text-ink-heading"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-app-line bg-app-card shadow-lg">
          <div className="flex items-center justify-between border-b border-app-line px-4 py-3">
            <span className="text-sm font-semibold text-ink-heading">Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>
          <div className="custom-scrollbar max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-muted">Không có thông báo</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`cursor-pointer border-b border-app-line px-4 py-3 transition-colors hover:bg-app-inset ${
                    !n.is_read ? "bg-brand/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink-heading">{n.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{n.message}</p>
                      <p className="mt-1 text-[10px] text-ink-faint">
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
