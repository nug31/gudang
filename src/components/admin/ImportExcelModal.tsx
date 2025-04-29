import React, { useState, useRef } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { read, utils } from "xlsx";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Item } from "../../types";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<Item, "id">[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileExtension || "")) {
      setErrors([
        "Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)",
      ]);
      setFile(null);
      setPreviewData([]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    parseExcel(selectedFile);
  };

  const parseExcel = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Validate the data structure
      const validationErrors = validateExcelData(jsonData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setPreviewData([]);
      } else {
        setPreviewData(jsonData.slice(0, 5)); // Preview first 5 rows
        setErrors([]);
      }
    } catch (error) {
      setErrors(["Failed to parse Excel file. Please check the file format."]);
      console.error("Excel parsing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateExcelData = (data: any[]): string[] => {
    if (!data || data.length === 0) {
      return ["The file contains no data."];
    }

    const errors: string[] = [];
    const requiredFields = ["name", "category"];
    const firstRow = data[0];

    // Check if required fields exist
    const missingFields = requiredFields.filter(
      (field) =>
        !Object.keys(firstRow).some(
          (key) => key.toLowerCase() === field.toLowerCase()
        )
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(", ")}`);
    }

    return errors;
  };

  const handleImport = () => {
    if (!file || errors.length > 0) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = utils.sheet_to_json(worksheet);

          // Map Excel data to Item format
          const items = jsonData.map((row: any) => {
            // Handle different possible column names by checking case-insensitive
            const getField = (fieldName: string) => {
              const key = Object.keys(row).find(
                (k) => k.toLowerCase() === fieldName.toLowerCase()
              );
              return key ? row[key] : undefined;
            };

            return {
              name: getField("name") || "",
              description: getField("description") || "",
              totalStock: parseInt(
                getField("totalStock") || getField("total_stock") || "0",
                10
              ),
              availableStock: parseInt(
                getField("availableStock") ||
                  getField("available_stock") ||
                  getField("totalStock") ||
                  getField("total_stock") ||
                  "0",
                10
              ),
              reservedStock: parseInt(
                getField("reservedStock") || getField("reserved_stock") || "0",
                10
              ),
              lowStockThreshold: parseInt(
                getField("lowStockThreshold") ||
                  getField("low_stock_threshold") ||
                  "5",
                10
              ),
              category: getField("category") || "Uncategorized",
            };
          });

          // Filter out items with empty names
          const validItems = items.filter((item) => item.name.trim() !== "");

          if (validItems.length === 0) {
            setErrors(["No valid items found in the file."]);
          } else {
            onImport(validItems);
            onClose();
            resetState();
          }
        } catch (error) {
          setErrors(["Failed to process Excel data."]);
          console.error("Excel processing error:", error);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setErrors(["Failed to read the file."]);
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setErrors(["An unexpected error occurred."]);
      console.error("Import error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title="Import Items from Excel"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              resetState();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!file || errors.length > 0 || isLoading}
            isLoading={isLoading}
          >
            Import Items
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Excel Import Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your Excel file should include these columns:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    <strong>name</strong> (required): Item name
                  </li>
                  <li>
                    <strong>category</strong> (required): Item category
                  </li>
                  <li>
                    <strong>description</strong>: Item description
                  </li>
                  <li>
                    <strong>totalStock</strong>: Total quantity
                  </li>
                  <li>
                    <strong>availableStock</strong>: Available quantity
                  </li>
                  <li>
                    <strong>reservedStock</strong>: Reserved quantity
                  </li>
                  <li>
                    <strong>lowStockThreshold</strong>: Low stock alert
                    threshold
                  </li>
                </ul>
                <div className="mt-3">
                  <a
                    href="/templates/item_import_template.csv"
                    download
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download template
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Upload className="h-12 w-12" />
            </div>
            <div className="text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                <span onClick={() => fileInputRef.current?.click()}>
                  Upload a file
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Excel or CSV files only (max 10MB)
                </p>
              </label>
            </div>
          </div>
          {file && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There were errors with your file
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewData.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Preview</h4>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((cell: any, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3 py-2 whitespace-nowrap text-sm text-gray-500"
                        >
                          {cell?.toString() || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Showing first {previewData.length} rows of {file?.name}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
