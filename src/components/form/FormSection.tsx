'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="form-section-heading text-lg font-semibold text-slate-900">
        {icon && <span className="text-purple-600">{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}
