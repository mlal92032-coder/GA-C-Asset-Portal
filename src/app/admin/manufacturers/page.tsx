'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CrudPage, { FormField } from '@/components/CrudPage';
import { Factory } from 'lucide-react';

const formFields: FormField[] = [
  { key: 'manufacturerName', label: 'Manufacturer Name', type: 'text', required: true },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'supportEmail', label: 'Support Email (Optional)', type: 'email' },
  { key: 'supportPhone', label: 'Support Phone', type: 'tel' },
];

export default function ManufacturersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <CrudPage
        title="Manufacturers"
        subtitle="Manage manufacturer records"
        apiUrl="/api/manufacturers"
        formFields={formFields}
        tableColumns={[
          { key: 'manufacturerName', label: 'Name' },
          { key: 'country', label: 'Country' },
          { key: 'supportEmail', label: 'Support Email' },
          { key: 'supportPhone', label: 'Support Phone' },
        ]}
        icon={Factory}
        getInitialFormData={() => ({ manufacturerName: '', country: '', supportEmail: '', supportPhone: '' })}
        gradientFrom="from-pink-100"
        gradientTo="to-rose-100"
        iconColor="text-pink-600"
      />
      </div>
    </DashboardLayout>
  );
}

