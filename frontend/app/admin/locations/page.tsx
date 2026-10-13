'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CrudPage, { FormField } from '@/components/CrudPage';
import { MapPin } from 'lucide-react';

const formFields: FormField[] = [
  { key: 'locationName', label: 'Location Name', type: 'text', required: true },
  { key: 'building', label: 'Building', type: 'text' },
  { key: 'floor', label: 'Floor', type: 'text' },
  { key: 'room', label: 'Room', type: 'text' },
  {
    key: 'roomType',
    label: 'Room Type',
    type: 'select',
    options: [
      { value: '', label: 'Select Type' },
      { value: 'Hall', label: 'Hall' },
      { value: 'Community Room', label: 'Community Room' },
      { value: 'Floor', label: 'Floor' },
      { value: 'Office', label: 'Office' },
      { value: 'Storage', label: 'Storage' },
      { value: 'Conference Room', label: 'Conference Room' },
    ]
  },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export default function LocationsPage() {
  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-1.5 sm:px-2 lg:px-3 overflow-x-hidden">
      <CrudPage
        title="Locations"
        subtitle="Manage location records"
        apiUrl="/api/locations"
        formFields={formFields}
        tableColumns={[
          { key: 'locationName', label: 'Location Name' },
          { key: 'building', label: 'Building' },
          { key: 'floor', label: 'Floor' },
          { key: 'room', label: 'Room' },
          { key: 'roomType', label: 'Room Type' },
        ]}
        icon={MapPin}
        getInitialFormData={() => ({ locationName: '', building: '', floor: '', room: '', roomType: '', description: '' })}
        gradientFrom="from-green-100"
        gradientTo="to-emerald-100"
        iconColor="text-green-600"
        badgeLabel="Administration"
        modalHeaderGradient="from-green-600 to-emerald-600"
      />
      </div>
    </DashboardLayout>
  );
}

