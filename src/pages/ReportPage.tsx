import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useRequest } from '../context/RequestContext';
import { useAuth } from '../context/AuthContext';
import { ResponsiveReportTable } from '../components/reports/ResponsiveReportTable';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileSpreadsheet, FileText, Filter, RefreshCw } from 'lucide-react';
import { exportToExcel } from '../utils/export';
import { exportRequestsToPDF, exportSimplifiedRequestsToPDF } from '../utils/pdfExport';
import { Request, RequestStatus } from '../types';

export const ReportPage: React.FC = () => {
  const { requests } = useRequest();
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'detailed' | 'simplified'>('detailed');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  // Filter requests based on status and date range
  const filteredRequests = requests.filter(request => {
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const requestDate = new Date(request.createdAt);
      const today = new Date();
      
      if (dateRange === 'today') {
        return requestDate.toDateString() === today.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return requestDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return requestDate >= monthAgo;
      }
    }
    
    return true;
  });

  // Handle Excel export
  const handleExportExcel = () => {
    exportToExcel(filteredRequests, `requests_report_${new Date().toISOString().split('T')[0]}`);
  };

  // Handle PDF export
  const handleExportPDF = () => {
    if (exportFormat === 'detailed') {
      exportRequestsToPDF(filteredRequests, `requests_report_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportSimplifiedRequestsToPDF(filteredRequests, `requests_report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  // Calculate summary statistics
  const calculateStats = (requests: Request[]) => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      approved: 0,
      denied: 0,
      fulfilled: 0,
      out_of_stock: 0
    };
    
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    requests.forEach(request => {
      statusCounts[request.status as RequestStatus]++;
      priorityCounts[request.priority]++;
    });
    
    return { statusCounts, priorityCounts };
  };
  
  const stats = calculateStats(filteredRequests);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Report</h1>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>
      
      {/* Filters and Export Options */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setDateRange('all');
              }}
              className="mt-6 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
          
          <div className="flex flex-wrap items-end gap-2">
            <div className="mr-2">
              <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
                PDF Format
              </label>
              <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'detailed' | 'simplified')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="detailed">Detailed</option>
                <option value="simplified">Simplified</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Summary Statistics */}
      <Card className="mb-6 p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        status === 'approved' ? 'bg-green-500' :
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'denied' ? 'bg-red-500' :
                        status === 'fulfilled' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${filteredRequests.length ? (count / filteredRequests.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-sm text-gray-600 ml-2">{count}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                <div key={priority} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600 capitalize">{priority}</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        priority === 'high' ? 'bg-red-500' :
                        priority === 'medium' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${filteredRequests.length ? (count / filteredRequests.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-right text-sm text-gray-600 ml-2">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Report Table */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Request Details</h2>
          <p className="text-sm text-gray-600">Showing {filteredRequests.length} requests</p>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No requests found matching the selected filters.
          </div>
        ) : (
          <ResponsiveReportTable requests={filteredRequests} />
        )}
      </Card>
    </MainLayout>
  );
};
