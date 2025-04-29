import React from 'react';
import { Request } from '../../types';

interface ResponsiveReportTableProps {
  requests: Request[];
  className?: string;
}

export const ResponsiveReportTable: React.FC<ResponsiveReportTableProps> = ({ 
  requests,
  className = ''
}) => {
  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get priority class
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Project Name
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Requester
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Created Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Pickup Location
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Delivered
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request, index) => (
              <tr key={request.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.projectName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {request.requester.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {request.requester.department || 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {request.dueDate ? formatDate(request.dueDate) : 'N/A'}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate">
                  {request.items.map(item => `${item.itemName} (${item.quantity})`).join(', ')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {request.pickupDetails?.location || 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {request.pickupDetails?.delivered ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
