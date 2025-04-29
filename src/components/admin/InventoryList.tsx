import React, { useState } from "react";
import {
  Search,
  PlusCircle,
  Package,
  Edit,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Item } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { ImportExcelModal } from "./ImportExcelModal";

export const InventoryList: React.FC = () => {
  const { items, addItem, updateItemStock, categories } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    lowStockThreshold: 5,
    category: "",
  });

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setItemFormData({
      name: "",
      description: "",
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      lowStockThreshold: 5,
      category: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setCurrentItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      totalStock: item.totalStock,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock,
      lowStockThreshold: item.lowStockThreshold,
      category: item.category,
    });
    setShowEditModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // For number fields, convert the string value to a number
    if (
      [
        "totalStock",
        "availableStock",
        "reservedStock",
        "lowStockThreshold",
      ].includes(name)
    ) {
      setItemFormData({
        ...itemFormData,
        [name]: parseInt(value, 10) || 0,
      });
    } else {
      setItemFormData({
        ...itemFormData,
        [name]: value,
      });
    }
  };

  const handleAddItem = async () => {
    // Validate form data
    if (!itemFormData.name.trim()) {
      alert("Item name is required");
      return;
    }

    // Ensure category is not empty
    if (!itemFormData.category.trim()) {
      setItemFormData({
        ...itemFormData,
        category: "Uncategorized",
      });
    }

    try {
      console.log("InventoryList: Adding item with data:", itemFormData);

      // Create new item with default values for any missing fields
      const newItem = await addItem({
        name: itemFormData.name,
        description: itemFormData.description || "",
        totalStock: itemFormData.totalStock || 0,
        availableStock: itemFormData.availableStock || 0,
        reservedStock: itemFormData.reservedStock || 0,
        lowStockThreshold: itemFormData.lowStockThreshold || 0,
        category: itemFormData.category || "Uncategorized",
      });

      console.log("InventoryList: Item added successfully:", newItem);

      // Show success message
      alert("Item added successfully!");

      // Close the modal
      setShowAddModal(false);

      // Reset form data
      setItemFormData({
        name: "",
        description: "",
        totalStock: 0,
        availableStock: 0,
        reservedStock: 0,
        lowStockThreshold: 5,
        category: "",
      });
    } catch (error) {
      console.error("InventoryList: Error adding item:", error);

      // Show detailed error message
      alert(
        "Failed to add item: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  const handleUpdateItem = () => {
    if (!currentItem || !itemFormData.name.trim()) return;

    // Calculate stock changes
    const availableChange =
      itemFormData.availableStock - currentItem.availableStock;
    const reservedChange =
      itemFormData.reservedStock - currentItem.reservedStock;

    // Update item stock
    updateItemStock(currentItem.id, availableChange, reservedChange);

    setShowEditModal(false);
    setCurrentItem(null);
  };

  const handleImportItems = async (importedItems: Omit<Item, "id">[]) => {
    if (importedItems.length === 0) return;

    try {
      // Track success and failures
      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      // Process each item
      for (const item of importedItems) {
        try {
          await addItem({
            name: item.name,
            description: item.description || "",
            totalStock: item.totalStock || 0,
            availableStock: item.availableStock || 0,
            reservedStock: item.reservedStock || 0,
            lowStockThreshold: item.lowStockThreshold || 0,
            category: item.category || "Uncategorized",
          });
          successCount++;
        } catch (error) {
          failureCount++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push(`Failed to add "${item.name}": ${errorMessage}`);
        }
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        alert(`Successfully imported ${successCount} items.`);
      } else if (successCount > 0 && failureCount > 0) {
        alert(
          `Imported ${successCount} items with ${failureCount} failures.\n\nErrors:\n${errors
            .slice(0, 3)
            .join("\n")}${
            errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ""
          }`
        );
      } else {
        alert(
          `Failed to import items. All ${failureCount} items failed.\n\nErrors:\n${errors
            .slice(0, 3)
            .join("\n")}${
            errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ""
          }`
        );
      }
    } catch (error) {
      console.error("Error importing items:", error);
      alert("An unexpected error occurred while importing items.");
    }
  };

  return (
    <>
      <Card title="Inventory Management">
        <div className="mb-6 flex flex-col md:flex-row justify-between gap-3">
          <div className="relative md:flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Import from Excel
            </Button>

            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              className="flex items-center"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span
                        className={
                          item.availableStock <= item.lowStockThreshold
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }
                      >
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {item.reservedStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {item.totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Item"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Item Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={itemFormData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={itemFormData.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={itemFormData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Select a category</option>
                <option value="Uncategorized">Uncategorized</option>
                {/* Show managed categories first */}
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                {/* Show unique categories from items that aren't in the managed categories */}
                {Array.from(new Set(items.map((item) => item.category)))
                  .filter(
                    (cat) =>
                      !categories.some((c) => c.name === cat) &&
                      cat !== "Uncategorized"
                  )
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="totalStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Stock
              </label>
              <input
                id="totalStock"
                name="totalStock"
                type="number"
                min="0"
                value={itemFormData.totalStock}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="availableStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Available Stock
              </label>
              <input
                id="availableStock"
                name="availableStock"
                type="number"
                min="0"
                value={itemFormData.availableStock}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="reservedStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reserved Stock
              </label>
              <input
                id="reservedStock"
                name="reservedStock"
                type="number"
                min="0"
                value={itemFormData.reservedStock}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="lowStockThreshold"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Low Stock Threshold
              </label>
              <input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                value={itemFormData.lowStockThreshold}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Item"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateItem}>
              Update Item
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Item Name *
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={itemFormData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              value={itemFormData.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="edit-category"
                name="category"
                value={itemFormData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Select a category</option>
                <option value="Uncategorized">Uncategorized</option>
                {/* Show managed categories first */}
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                {/* Show unique categories from items that aren't in the managed categories */}
                {Array.from(new Set(items.map((item) => item.category)))
                  .filter(
                    (cat) =>
                      !categories.some((c) => c.name === cat) &&
                      cat !== "Uncategorized"
                  )
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-availableStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Available Stock
              </label>
              <input
                id="edit-availableStock"
                name="availableStock"
                type="number"
                min="0"
                value={itemFormData.availableStock}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="edit-reservedStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reserved Stock
              </label>
              <input
                id="edit-reservedStock"
                name="reservedStock"
                type="number"
                min="0"
                value={itemFormData.reservedStock}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="edit-lowStockThreshold"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Low Stock Threshold
              </label>
              <input
                id="edit-lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                value={itemFormData.lowStockThreshold}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportItems}
      />
    </>
  );
};
