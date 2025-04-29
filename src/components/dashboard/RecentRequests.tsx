import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../../context/RequestContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ChevronRight } from 'lucide-react';

export const RecentRequests: React.FC = () => {
  const { requests } = useRequest();
  const navigate = useNavigate();
  
  // Sort by createdAt date (most recent first)
  const sortedRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Take only the 5 most recent

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/history')}
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      {sortedRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent requests</p>
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((request) => (
            <div 
              key={request.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/request/${request.id}`)}
            >
              <div>
                <p className="font-medium text-gray-900">{request.projectName}</p>
                <p className="text-xs text-gray-500">
                  {request.requester.name} • {' '}
                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge status={request.status} />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};