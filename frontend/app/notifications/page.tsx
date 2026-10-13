'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setNotifications(result.data.map((notif: any) => ({
          ...notif,
          time: formatTime(new Date(notif.createdAt)),
          type: notif.type.toLowerCase(),
        })));
        setError(null);
      } else if (result.success) {
        // Show welcome message with no notifications
        setNotifications([]);
        setError(null);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setNotifications(notifications.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeIcons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    alert: <AlertCircle className="w-5 h-5 text-red-600" />,
  };

  const typeColors = {
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    alert: 'bg-red-50 border-red-200',
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 py-2 overflow-x-hidden">
        <PageHeader
          title="Notifications"
          subtitle="View all system notifications and alerts"
          icon={Bell}
          badge="Alerts"
          gradientFrom="from-blue-100"
          gradientTo="to-indigo-100"
          iconColor="text-blue-600"
          stats={[{ label: 'Unread', value: unreadCount }]}
        />

        <div className="w-full">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">All Notifications</h2>
              <p className="text-sm text-slate-600 mt-1">{unreadCount} unread</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-4 py-1 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-600 font-semibold">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-12 text-center"
            >
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold">No notifications</p>
              <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-2"
            >
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative bg-white rounded-lg border-2 p-4 flex items-start gap-4 transition-all hover:shadow-md ${
                    notif.isRead ? 'border-slate-200' : typeColors[notif.type as keyof typeof typeColors]
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {typeIcons[notif.type as keyof typeof typeIcons]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h3 className={`font-bold text-slate-900 ${!notif.isRead ? 'text-base' : 'text-sm'}`}>
                          {notif.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{notif.time}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
