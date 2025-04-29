import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { RequestDetail } from '../components/request/RequestDetail';

export const RequestDetailPage: React.FC = () => {
  return (
    <MainLayout>
      <RequestDetail />
    </MainLayout>
  );
};