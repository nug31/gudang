import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { RequestForm } from '../components/request/RequestForm';

export const RequestFormPage: React.FC = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Item Request</h1>
      <RequestForm />
    </MainLayout>
  );
};