import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Company Admin Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="User Management">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Create, edit, and manage operator accounts and their access permissions.
          </p>
          <Link href="/dashboard/admin/users">
            <Button variant="primary" fullWidth className="sm:w-auto">Manage Users</Button>
          </Link>
        </Card>
        
        <Card title="Operations Management">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Upload, edit, and manage operation sheets for time studies.
          </p>
          <Link href="/dashboard/admin/operations">
            <Button variant="primary" fullWidth className="sm:w-auto">Manage Operations</Button>
          </Link>
        </Card>
        
        <Card title="Time Study Reports">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            View and export time study data collected by operators.
          </p>
          <Link href="/dashboard/admin/reports">
            <Button variant="primary" fullWidth className="sm:w-auto">View Reports</Button>
          </Link>
        </Card>
        
        <Card title="Company Settings">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Manage company information and application settings.
          </p>
          <Link href="/dashboard/admin/settings">
            <Button variant="primary" fullWidth className="sm:w-auto">Settings</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
