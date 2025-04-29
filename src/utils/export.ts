import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Request, RequestStatus } from "../types";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to prepare request data for export
const prepareRequestData = (requests: Request[]) => {
  return requests.map((request) => ({
    "Project Name": request.projectName,
    Requester: request.requester.name,
    Department: request.requester.department || "N/A",
    Status:
      request.status.charAt(0).toUpperCase() +
      request.status.slice(1).replace("_", " "),
    Priority:
      request.priority.charAt(0).toUpperCase() + request.priority.slice(1),
    "Created Date": formatDate(request.createdAt),
    "Due Date": request.dueDate ? formatDate(request.dueDate) : "N/A",
    Items: request.items
      .map((item) => `${item.itemName} (${item.quantity})`)
      .join(", "),
    "Pickup Location": request.pickupDetails?.location || "N/A",
    Delivered: request.pickupDetails?.delivered ? "Yes" : "No",
  }));
};

// Export to Excel
export const exportToExcel = (
  requests: Request[],
  fileName: string = "requests"
) => {
  const data = prepareRequestData(requests);
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Requests");

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof typeof row]).length)
    ),
  }));
  ws["!cols"] = colWidths;

  writeFile(wb, `${fileName}.xlsx`);
};

// Export to PDF
export const exportToPDF = (
  requests: Request[],
  fileName: string = "requests"
) => {
  // Import the improved PDF export functions
  import("./pdfExport")
    .then((module) => {
      module.exportRequestsToPDF(requests, fileName);
    })
    .catch((error) => {
      console.error("Error importing PDF export module:", error);

      // Fallback to basic PDF export if module import fails
      const doc = new jsPDF();
      const data = prepareRequestData(requests);

      // Add title
      doc.setFontSize(16);
      doc.text("Request Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

      // Add table
      autoTable(doc, {
        head: [Object.keys(data[0] || {})],
        body: data.map((row) => Object.values(row)),
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 30 }, // Project Name
          7: { cellWidth: 40 }, // Items
        },
        didDrawPage: (data) => {
          // Add page number
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        },
      });

      doc.save(`${fileName}.pdf`);
    });
};

// Generate summary statistics
export const generateSummaryData = (requests: Request[]) => {
  const totalRequests = requests.length;
  const statusCounts: Record<RequestStatus, number> = {
    pending: 0,
    approved: 0,
    denied: 0,
    fulfilled: 0,
    out_of_stock: 0,
  };

  const priorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  requests.forEach((request) => {
    statusCounts[request.status]++;
    priorityCounts[request.priority]++;
  });

  return {
    totalRequests,
    statusCounts,
    priorityCounts,
  };
};
