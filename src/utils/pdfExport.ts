import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Request } from '../types';

// Helper function to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Export to PDF with improved formatting
export const exportRequestsToPDF = (requests: Request[], fileName: string = 'requests') => {
  // Create a new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Request Report', 14, 15);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray color
  doc.text(`Generated on ${formatDate(new Date())}`, 14, 22);
  
  // Prepare data for the table
  const tableData = requests.map(request => [
    request.projectName,
    request.requester.name,
    request.requester.department || 'N/A',
    request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' '),
    request.priority.charAt(0).toUpperCase() + request.priority.slice(1),
    formatDate(request.createdAt),
    request.dueDate ? formatDate(request.dueDate) : 'N/A',
    request.items.map(item => `${item.itemName} (${item.quantity})`).join(', '),
    request.pickupDetails?.location || 'N/A',
    request.pickupDetails?.delivered ? 'Yes' : 'No'
  ]);
  
  // Define table headers
  const headers = [
    'Project Name',
    'Requester',
    'Department',
    'Status',
    'Priority',
    'Created Date',
    'Due Date',
    'Items',
    'Pickup Location',
    'Delivered'
  ];
  
  // Add table to the PDF
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Project Name
      1: { cellWidth: 20 }, // Requester
      2: { cellWidth: 20 }, // Department
      3: { cellWidth: 15 }, // Status
      4: { cellWidth: 15 }, // Priority
      5: { cellWidth: 20 }, // Created Date
      6: { cellWidth: 20 }, // Due Date
      7: { cellWidth: 40 }, // Items
      8: { cellWidth: 20 }, // Pickup Location
      9: { cellWidth: 15 }  // Delivered
    },
    didDrawPage: (data) => {
      // Add page number
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Save the PDF
  doc.save(`${fileName}.pdf`);
};

// Export a simplified PDF report for better readability
export const exportSimplifiedRequestsToPDF = (requests: Request[], fileName: string = 'requests') => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Request Report', 14, 15);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Gray color
  doc.text(`Generated on ${formatDate(new Date())}`, 14, 22);
  
  // Prepare data for the table - simplified version with fewer columns
  const tableData = requests.map(request => [
    request.projectName,
    request.requester.name,
    request.status.charAt(0).toUpperCase() + request.status.slice(1),
    request.priority.charAt(0).toUpperCase() + request.priority.slice(1),
    formatDate(request.createdAt),
    request.items.map(item => `${item.itemName} (${item.quantity})`).join(', ')
  ]);
  
  // Define table headers
  const headers = [
    'Project Name',
    'Requester',
    'Status',
    'Priority',
    'Created Date',
    'Items'
  ];
  
  // Add table to the PDF
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    didDrawPage: (data) => {
      // Add page number
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Save the PDF
  doc.save(`${fileName}.pdf`);
};
