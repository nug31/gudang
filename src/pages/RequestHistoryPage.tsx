import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { RequestList } from '../components/request/RequestList';
import { useAuth } from '../context/AuthContext';
import { useRequest } from '../context/RequestContext';

export const RequestHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { requests, getUserRequests } = useRequest();
  
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const requestsToShow = isAdmin ? requests : getUserRequests();

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isAdmin ? 'All Requests' : 'My Request History'}
      </h1>
      <RequestList 
        title={isAdmin ? 'All Requests' : 'My Requests'} 
        requests={requestsToShow}
        emptyMessage={isAdmin ? 'No requests found' : 'You haven\'t submitted any requests yet'}
      />
    </MainLayout>
  );
};