'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';

interface Process {
  id: string;
  name: string;
}

interface TimeStudyData {
  operationId: string;
  operationDescription: string;
  operator: string;
  startTime: string;
  endTime: string;
  totalTime: string;
  timeBetweenOps: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [reportData, setReportData] = useState<string[][]>([]);
  
  // Fetch processes on component mount
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('/api/processes');
        if (response.ok) {
          const data = await response.json();
          setProcesses(data);
        }
      } catch (error) {
        console.error('Error fetching processes:', error);
      }
    };
    
    fetchProcesses();
  }, []);
  
  // Fetch report data when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      if (!dateRange.start || !dateRange.end) return;
      
      setLoading(true);
      try {
        const url = new URL('/api/reports/time-study-data', window.location.origin);
        
        // Add query parameters
        if (selectedProcess) {
          url.searchParams.append('processId', selectedProcess);
        }
        url.searchParams.append('startDate', dateRange.start);
        url.searchParams.append('endDate', dateRange.end);
        
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          
          // Transform data for table display
          const tableData = data.map((item: TimeStudyData) => [
            item.operationId,
            item.operationDescription,
            item.operator,
            item.startTime,
            item.endTime || '-',
            item.totalTime || '-',
            item.timeBetweenOps || 'N/A'
          ]);
          
          setReportData(tableData);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [selectedProcess, dateRange.start, dateRange.end]);
  
  const handleExport = async () => {
    setExportLoading(true);
    
    try {
      const url = new URL('/api/reports/export', window.location.origin);
      
      // Add query parameters
      if (selectedProcess) {
        url.searchParams.append('processId', selectedProcess);
      }
      url.searchParams.append('startDate', dateRange.start);
      url.searchParams.append('endDate', dateRange.end);
      
      // Use fetch with blob response type for file download
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `time-study-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
      } else {
        throw new Error('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Time Study Reports</h1>
      </div>
      
      <Card title="Report Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-700 mb-1">
              Select Process
            </label>
            <select
              id="process"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedProcess || ''}
              onChange={(e) => setSelectedProcess(e.target.value || null)}
            >
              <option value="">All Processes</option>
              {processes.map(process => (
                <option key={process.id} value={process.id}>{process.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="primary" 
            onClick={handleExport}
            loading={exportLoading}
          >
            Export Report
          </Button>
        </div>
      </Card>
      
      <Card title="Time Study Data">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Table
            headers={[
              'Operation ID',
              'Operation Description',
              'Operator',
              'Start Time',
              'End Time',
              'Total Time',
              'Time Between Ops'
            ]}
            data={reportData}
            emptyMessage="No time study data found for the selected filters."
          />
        )}
      </Card>
    </div>
  );
}
