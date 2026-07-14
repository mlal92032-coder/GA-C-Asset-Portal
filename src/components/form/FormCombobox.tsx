'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useState, useRef, useEffect } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange'> {
  label: string;
  name: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
  placeholder?: string;
}

export default function FormCombobox({
  label,
  name,
  options,
  value,
  onChange,
  error,
  icon,
  required,
  placeholder,
  disabled,
}: FormComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div ref={containerRef} className="relative" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <motion.label
        className={`block text-sm font-medium mb-2 transition-colors ${
          error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-700'
        }`}
        animate={{ y: isFocused ? -2 : 0 }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 0 0 0px rgba(59, 130, 246, 0)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isOpen);
          }}
          disabled={disabled}
          className={`w-full px-3 py-2 pl-10 text-left border-2 rounded-lg transition-colors outline-none flex items-center justify-between ${
            error
              ? 'border-red-300 bg-red-50'
              : isFocused
                ? 'border-blue-500 bg-white'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <span className={selectedLabel ? 'text-gray-900' : 'text-gray-500'}>{selectedLabel || placeholder}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </button>

        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}

        {value && (
          <motion.button
            onClick={() => {
              onChange?.(value === '' ? '' : '');
              setSearchValue('');
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            <X size={18} />
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.p
          className="text-red-500 text-sm mt-1"
          role="alert"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      {isOpen && (
        <motion.div
          className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">No options found</div>
            ) : (
              filtered.map((option, idx) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                    setSearchValue('');
                    setIsFocused(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${
                    value === option.value ? 'bg-blue-100 text-blue-900 font-medium' : ''
                  }`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  {option.label}
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
