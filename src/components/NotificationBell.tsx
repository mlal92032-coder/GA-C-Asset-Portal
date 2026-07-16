'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Trash2, CheckCheck, AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationBellProps {
  isDarkMode?: boolean;
}

export default function NotificationBell({ isDarkMode = false }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: try with Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      });
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=false', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        const previousUnreadCount = unreadCount;
        const newUnreadCount = json.unreadCount;

        setNotifications(json.data);
        setUnreadCount(newUnreadCount);

        // Play sound if new unread notifications arrived
        if (newUnreadCount > previousUnreadCount) {
          playNotificationSound();
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen, setIsOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
        credentials: 'include',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
        credentials: 'include',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleClickNotification = (id: string, link?: string) => {
    markAsRead(id);
    setIsOpen(false);
    if (link) {
      setTimeout(() => {
        router.push(link);
      }, 100);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button - Clean minimal style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 transition-all duration-200 rounded-lg min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center ${
          isDarkMode
            ? 'text-white hover:bg-white/20'
            : 'text-slate-600 hover:text-slate-700'
        }`}
        aria-label="Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5 rounded-full animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - Absolute positioning below button */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-0 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-b-xl border border-slate-200 border-t-0 shadow-2xl z-[1000] max-h-[500px] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Solid white, no padding top */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
            <h3 className="font-semibold text-slate-700 text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group p-3 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer border-l-4 ${
                      !notification.isRead ? 'bg-slate-50/50 border-l-slate-400 hover:bg-slate-100/30' : 'border-l-transparent hover:border-l-slate-300'
                    }`}
                    onClick={() => handleClickNotification(notification.id, notification.link || undefined)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-[10px] text-slate-600 hover:text-slate-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-white text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-600 hover:text-slate-700 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
