'use client';

import { motion } from 'framer-motion';

interface RadioOption {
  value: string | number;
  label: string;
}

interface FormRadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}

export default function FormRadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  direction = 'vertical',
}: FormRadioGroupProps) {
  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium mb-3 text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <motion.div
        className={`space-y-2 ${direction === 'horizontal' ? 'flex gap-4' : ''}`}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {options.map((option, idx) => (
          <motion.label
            key={option.value}
            className="flex items-center cursor-pointer group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <motion.input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              className="sr-only"
            />

            <motion.div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                value === option.value
                  ? 'bg-blue-600 border-blue-600 shadow-md'
                  : 'border-gray-300 bg-white group-hover:border-blue-400'
              }`}
              animate={{
                scale: value === option.value ? 1 : 0.95,
              }}
            >
              {value === option.value && (
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </motion.div>

            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{option.label}</span>
          </motion.label>
        ))}
      </motion.div>

      {error && (
        <motion.p
          className="text-red-500 text-sm mt-2"
          role="alert"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
