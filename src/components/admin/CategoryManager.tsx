import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { useInventory } from "../../context/InventoryContext";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export const CategoryManager: React.FC = () => {
  const { items, addCategory, updateCategory, deleteCategory, categories } = useInventory();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6" // Default blue color
  });

  // Get unique categories from items
  const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
  
  // Count items per category
  const categoryItemCounts = uniqueCategories.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  const handleOpenAddModal = () => {
    setCategoryFormData({
      name: "",
      description: "",
      color: "#3B82F6"
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCurrentCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowEditModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value
    });
  };

  const handleAddCategory = async () => {
    // Validate form data
    if (!categoryFormData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      console.log("CategoryManager: Adding category with data:", categoryFormData);

      // Add new category
      await addCategory({
        name: categoryFormData.name,
        description: categoryFormData.description || "",
        color: categoryFormData.color
      });

      // Show success message
      alert("Category added successfully!");

      // Close the modal
      setShowAddModal(false);

      // Reset form data
      setCategoryFormData({
        name: "",
        description: "",
        color: "#3B82F6"
      });
    } catch (error) {
      console.error("CategoryManager: Error adding category:", error);

      // Show detailed error message
      alert(
        "Failed to add category: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory || !categoryFormData.name.trim()) return;

    try {
      console.log("CategoryManager: Updating category with data:", categoryFormData);

      // Update category
      await updateCategory(currentCategory.id, {
        name: categoryFormData.name,
        description: categoryFormData.description,
        color: categoryFormData.color
      });

      // Show success message
      alert("Category updated successfully!");

      // Close the modal
      setShowEditModal(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error("CategoryManager: Error updating category:", error);

      // Show detailed error message
      alert(
        "Failed to update category: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category? Items in this category will be moved to 'Uncategorized'.")) {
      return;
    }

    try {
      console.log("CategoryManager: Deleting category:", categoryId);

      // Delete category
      await deleteCategory(categoryId);

      // Show success message
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("CategoryManager: Error deleting category:", error);

      // Show detailed error message
      alert(
        "Failed to delete category: " +
          (error instanceof Error ? error.message : "Unknown error") +
          "\n\nPlease check the browser console for more details."
      );
    }
  };

  return (
    <>
      <Card title="Category Management">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Manage categories for inventory items
          </p>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Category
          </Button>
        </div>

        {categories.length === 0 && uniqueCategories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show managed categories first */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {categoryItemCounts[category.name] || 0} items
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Show categories from items that aren't in the managed categories */}
            {uniqueCategories
              .filter(cat => !categories.some(c => c.name === cat))
              .map((category) => (
                <div
                  key={category}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: '#CBD5E1', borderLeftWidth: '4px' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{category}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Auto-generated category
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {categoryItemCounts[category]} items
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleOpenEditModal({
                          id: category,
                          name: category,
                          description: '',
                          color: '#CBD5E1'
                        })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Add Category
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
              Category Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={categoryFormData.name}
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
              value={categoryFormData.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="color"
                name="color"
                type="color"
                value={categoryFormData.color}
                onChange={handleFormChange}
                className="h-10 w-10 border-0 p-0"
              />
              <input
                type="text"
                name="color"
                value={categoryFormData.color}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Category"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateCategory}>
              Update Category
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
              Category Name *
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={categoryFormData.name}
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
              value={categoryFormData.description}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-color"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="edit-color"
                name="color"
                type="color"
                value={categoryFormData.color}
                onChange={handleFormChange}
                className="h-10 w-10 border-0 p-0"
              />
              <input
                type="text"
                name="color"
                value={categoryFormData.color}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
