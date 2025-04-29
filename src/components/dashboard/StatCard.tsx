import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700'
  };
  
  const iconClasses = {
    default: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-amber-400',
    danger: 'text-red-400'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
      <div className={`p-3 rounded-full mr-4 ${variantClasses[variant]}`}>
        <div className={iconClasses[variant]}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};