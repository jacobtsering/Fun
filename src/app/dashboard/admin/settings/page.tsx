'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('Your Company Name');
  const [contactEmail, setContactEmail] = useState('admin@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoLogout, setAutoLogout] = useState('60');
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate save delay
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1500);
  };
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Company Settings</h1>
      </div>
      
      <Card title="General Settings">
        <div className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
        </div>
      </Card>
      
      <Card title="Application Settings">
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
          
          <div>
            <label htmlFor="autoLogout" className="block text-sm font-medium text-gray-700 mb-1">
              Auto Logout Time (minutes)
            </label>
            <select
              id="autoLogout"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={autoLogout}
              onChange={(e) => setAutoLogout(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">120 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </Card>
      
      <Card title="Data Management">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage your company's data and export options.
          </p>
          
          <div className="flex space-x-3">
            <Button variant="secondary">Export All Data</Button>
            <Button variant="danger">Clear All Time Studies</Button>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="secondary" 
          onClick={() => router.push('/dashboard/admin')}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          loading={loading}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
