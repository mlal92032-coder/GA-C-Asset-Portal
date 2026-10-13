'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxOption {
  value: string | number;
  label: string;
}

interface FormCheckboxGroupProps {
  label: string;
  name: string;
  options: CheckboxOption[];
  selectedValues?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  error?: string;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}

export default function FormCheckboxGroup({
  label,
  name,
  options,
  selectedValues = [],
  onChange,
  error,
  required,
  direction = 'vertical',
}: FormCheckboxGroupProps) {
  const handleChange = (value: string | number) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange?.(newValues);
  };

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
              type="checkbox"
              name={name}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleChange(option.value)}
              className="sr-only"
            />

            <motion.div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedValues.includes(option.value)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 bg-white group-hover:border-blue-400'
              }`}
              animate={{
                scale: selectedValues.includes(option.value) ? 1 : 0.95,
              }}
            >
              {selectedValues.includes(option.value) && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }}>
                  <Check size={14} className="text-white" />
                </motion.div>
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
