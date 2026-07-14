'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

export interface Notification {
  id: string;
  type: 'asset' | 'checkout' | 'maintenance' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationDelete?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const typeColors = {
  asset: 'bg-blue-100 text-blue-800 border-blue-200',
  checkout: 'bg-green-100 text-green-800 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  system: 'bg-purple-100 text-purple-800 border-purple-200',
  alert: 'bg-red-100 text-red-800 border-red-200',
};

const typeLabels = {
  asset: 'Asset',
  checkout: 'Checkout',
  maintenance: 'Maintenance',
  system: 'System',
  alert: 'Alert',
};

export function NotificationCenter({
  notifications = [],
  onNotificationRead,
  onNotificationDelete,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | Notification['type']>('all');

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (filter === 'unread') {
      result = result.filter((n) => !n.read);
    } else if (filter !== 'all') {
      result = result.filter((n) => n.type === filter);
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groupedByType = useMemo(() => {
    const groups: Record<Notification['type'], Notification[]> = {
      asset: [],
      checkout: [],
      maintenance: [],
      system: [],
      alert: [],
    };

    filteredNotifications.forEach((n) => {
      groups[n.type].push(n);
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications ${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      onClick={onMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      whileHover={{ scale: 1.05 }}
                    >
                      Mark all as read
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-4 py-2 border-b border-gray-200 flex gap-1 overflow-x-auto">
                {['all', 'unread', 'asset', 'checkout', 'maintenance', 'system', 'alert'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setFilter(tab as any)}
                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                      filter === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab === 'all' ? 'All' : tab === 'unread' ? `Unread (${unreadCount})` : typeLabels[tab as Notification['type']]}
                  </motion.button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      className="p-6 text-center text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="divide-y divide-gray-200"
                      variants={staggerContainer.container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          variants={staggerItem}
                          onClick={() => !notification.read && onNotificationRead?.(notification.id)}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <div className="flex gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 border ${typeColors[notification.type]}`}>
                              {typeLabels[notification.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {!notification.read && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNotificationRead?.(notification.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                  whileHover={{ scale: 1.1 }}
                                  title="Mark as read"
                                >
                                  <Check size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNotificationDelete?.(notification.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                                whileHover={{ scale: 1.1 }}
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
