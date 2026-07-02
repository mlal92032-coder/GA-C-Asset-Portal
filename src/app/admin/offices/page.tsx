'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CrudPage, { FormField } from '@/components/CrudPage';
import { Building2 } from 'lucide-react';

const formFields: FormField[] = [
  { key: 'companyName', label: 'Office Name', type: 'text', required: true },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'email', label: 'Email (Optional)', type: 'email' },
];

export default function OfficesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <CrudPage
        title="Offices"
        subtitle="Manage office records"
        apiUrl="/api/companies"
        formFields={formFields}
        tableColumns={[
          { key: 'companyName', label: 'Office Name' },
          { key: 'address', label: 'Address' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
        ]}
        icon={Building2}
        getInitialFormData={() => ({ companyName: '', address: '', phone: '', email: '' })}
        gradientFrom="from-cyan-100"
        gradientTo="to-sky-100"
        iconColor="text-cyan-600"
        badgeLabel="Administration"
        modalHeaderGradient="from-cyan-600 to-sky-600"
      />
      </div>
    </DashboardLayout>
  );
}

