import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Table3DProps {
  headers: string[];
  data: any[];
  className?: string;
  onRowClick?: (row: any, index: number) => void;
}

export const Table3D: React.FC<Table3DProps> = ({
  headers,
  data,
  className = '',
  onRowClick
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className={`overflow-hidden rounded-xl shadow-3d-soft ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className={`${
                  onRowClick ? 'cursor-pointer' : ''
                } transition-colors duration-200 hover:bg-gray-50`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  transform: hoveredRow === rowIndex ? 'translateZ(5px)' : 'translateZ(0px)',
                  transition: 'transform 0.2s ease-out',
                  boxShadow: hoveredRow === rowIndex ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                }}
              >
                {Object.values(row).map((cell: any, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
