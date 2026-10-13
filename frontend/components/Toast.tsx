'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: { label: string; onClick: () => void };
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export const Toast: React.FC<ToastProps & { onClose: () => void }> = ({
  id,
  type,
  message,
  duration = 4000,
  action,
  onClose,
}) => {
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colorMap[type]} shadow-sm`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold underline hover:opacity-75"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-50 hover:opacity-100"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={() => onClose(toast.id)} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);
