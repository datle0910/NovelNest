import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const RECONNECT_DELAY_MS = 5000;

const AdminLayout: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const connect = () => {
      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent triggering reconnect on manual close
        wsRef.current.close();
      }

      const getWsBase = () => {
        if (import.meta.env.VITE_WS_URL) {
          return import.meta.env.VITE_WS_URL;
        }
        if (typeof window !== 'undefined') {
          if (window.location.hostname === 'localhost' && window.location.port === '5173') {
            return 'ws://localhost:8080';
          }
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          return `${protocol}//${window.location.host}`;
        }
        return 'ws://localhost:8080';
      };
      const WS_BASE = getWsBase();
      const ws = new WebSocket(`${WS_BASE}/ws/admin-reports?token=${accessToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Admin WS] Connected');
        // Clear any pending reconnect timer
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CONNECTED' || data.type === 'PONG') return; // ignore handshake messages

          // New report received — show toast
          setNotifications(prev => [data, ...prev]);
          // Auto-dismiss after 12 seconds
          setTimeout(() => dismissNotification(data.id), 12000);
        } catch (e) {
          console.warn('[Admin WS] Could not parse message', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[Admin WS] Error:', err);
      };

      ws.onclose = () => {
        console.log(`[Admin WS] Disconnected. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on cleanup
        wsRef.current.close();
      }
    };
  }, [accessToken, dismissNotification]);

  return (
    <div className="flex min-h-screen bg-surface-base dark text-text-primary">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />

          {/* Event-driven Notification Toasts */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white dark:bg-surface-elevated rounded-xl shadow-2xl border border-red-500/20 overflow-hidden animate-slide-up pointer-events-auto">
                <div className="p-4 flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-between gap-2">
                      <span>Báo cáo lỗi chương mới!</span>
                      <button onClick={() => dismissNotification(notification.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </h4>
                    <p className="text-xs text-text-muted mt-1 truncate">
                      Chương {notification.chapterNumber}: {notification.chapterTitle}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                      {notification.storyTitle}
                    </p>
                    <p className="text-xs font-medium text-brand-400 mt-1 truncate">
                      {notification.reasons?.join(', ')}
                    </p>
                    <button
                      onClick={() => {
                        dismissNotification(notification.id);
                        navigate('/admin/reports');
                      }}
                      className="mt-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


