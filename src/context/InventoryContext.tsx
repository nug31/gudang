import React, { createContext, useState, useContext, useEffect } from "react";
import { Item } from "../types";
import { mockItems } from "../data/mockData";
import * as api from "../services/api";

// Define Category type
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface InventoryContextType {
  items: Item[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  updateItemStock: (
    itemId: string,
    availableChange: number,
    reservedChange: number
  ) => void;
  addItem: (item: Omit<Item, "id">) => Promise<Item>;
  getLowStockItems: () => Item[];
  addCategory: (category: Omit<Category, "id">) => Promise<Category>;
  updateCategory: (
    categoryId: string,
    categoryData: Partial<Omit<Category, "id">>
  ) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch items and categories from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("InventoryContext: Fetching inventory data...");

        // Try to fetch items from the API first
        try {
          const apiItems = await api.fetchItems();
          console.log("InventoryContext: API items received:", apiItems);

          if (apiItems && apiItems.length > 0) {
            setItems(apiItems);
            console.log("InventoryContext: Items state updated with API data");
          } else {
            // Fallback to mock data if API returns empty
            console.warn("API returned no items, falling back to mock data");
            setItems(mockItems);
            console.log("InventoryContext: Items state updated with mock data");
          }

          // Fetch categories from the API
          try {
            const apiCategories = await api.fetchCategories();
            console.log(
              "InventoryContext: API categories received:",
              apiCategories
            );

            if (apiCategories && apiCategories.length > 0) {
              setCategories(apiCategories);
              console.log(
                "InventoryContext: Categories state updated with API data"
              );
            } else {
              console.log("InventoryContext: No categories found in API");
            }
          } catch (categoryError) {
            console.warn("API category fetch failed:", categoryError);
          }
        } catch (apiError) {
          // Fallback to mock data if API fails
          console.warn(
            "API fetch failed, falling back to mock data:",
            apiError
          );
          setItems(mockItems);
          console.log(
            "InventoryContext: Items state updated with mock data due to API error"
          );
        }
      } catch (err) {
        console.error("InventoryContext: Error in fetchData:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch inventory data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateItemStock = (
    itemId: string,
    availableChange: number,
    reservedChange: number
  ) => {
    try {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                availableStock: Math.max(
                  0,
                  item.availableStock + availableChange
                ),
                reservedStock: Math.max(0, item.reservedStock + reservedChange),
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update item stock"
      );
    }
  };

  const addItem = async (item: Omit<Item, "id">) => {
    try {
      setLoading(true);
      console.log("InventoryContext: Adding item:", item);

      // Direct fetch call to the API
      const response = await fetch("http://localhost/simple_add_item.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          totalStock: item.totalStock,
          availableStock: item.availableStock,
          reservedStock: item.reservedStock,
          lowStockThreshold: item.lowStockThreshold,
          category: item.category,
        }),
      });

      console.log("InventoryContext: API response status:", response.status);

      // Parse the response
      const data = await response.json();
      console.log("InventoryContext: API response data:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add item");
      }

      // Create the new item from the response
      const newItem: Item = {
        id: data.data.id,
        name: data.data.name,
        description: data.data.description,
        totalStock: data.data.totalStock,
        availableStock: data.data.availableStock,
        reservedStock: data.data.reservedStock,
        lowStockThreshold: data.data.lowStockThreshold,
        category: data.data.category,
      };

      console.log("InventoryContext: Item added successfully:", newItem);

      // Add the new item to the state
      setItems((prev) => [...prev, newItem]);
      console.log("InventoryContext: Updated items state");

      return newItem;
    } catch (err) {
      console.error("InventoryContext: Error adding item:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLowStockItems = () => {
    return items.filter(
      (item) => item.availableStock <= item.lowStockThreshold
    );
  };

  // Category management functions
  const addCategory = async (
    category: Omit<Category, "id">
  ): Promise<Category> => {
    try {
      setLoading(true);
      console.log("InventoryContext: Adding category:", category);

      // Call the API to add the category
      const newCategory = await api.addCategory(category);
      console.log("InventoryContext: Category created:", newCategory);

      // Add the new category to the state
      setCategories((prev) => [...prev, newCategory]);
      console.log("InventoryContext: Updated categories state");

      return newCategory;
    } catch (err) {
      console.error("InventoryContext: Error adding category:", err);
      setError(err instanceof Error ? err.message : "Failed to add category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    categoryId: string,
    categoryData: Partial<Omit<Category, "id">>
  ): Promise<Category> => {
    try {
      setLoading(true);
      console.log(
        "InventoryContext: Updating category:",
        categoryId,
        categoryData
      );

      // Find the category to update
      const categoryToUpdate = categories.find((cat) => cat.id === categoryId);

      // Call the API to update the category
      const updatedCategory = await api.updateCategory(
        categoryId,
        categoryData
      );
      console.log("InventoryContext: Category updated:", updatedCategory);

      // Update the category in the state
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
      );
      console.log("InventoryContext: Updated categories state");

      // If the category name changed, update all items with this category
      if (
        categoryToUpdate &&
        categoryData.name &&
        categoryData.name !== categoryToUpdate.name
      ) {
        setItems((prev) =>
          prev.map((item) =>
            item.category === categoryToUpdate.name
              ? {
                  ...item,
                  category: categoryData.name || categoryToUpdate.name,
                }
              : item
          )
        );
        console.log("InventoryContext: Updated items with new category name");
      }

      return updatedCategory;
    } catch (err) {
      console.error("InventoryContext: Error updating category:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update category"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("InventoryContext: Deleting category:", categoryId);

      // Find the category to delete
      const categoryToDelete = categories.find((cat) => cat.id === categoryId);

      if (!categoryToDelete) {
        throw new Error("Category not found");
      }

      // Call the API to delete the category
      await api.deleteCategory(categoryId);
      console.log("InventoryContext: Category deleted via API");

      // Remove the category from the state
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      console.log("InventoryContext: Updated categories state");

      // Update all items with this category to "Uncategorized"
      setItems((prev) =>
        prev.map((item) =>
          item.category === categoryToDelete.name
            ? { ...item, category: "Uncategorized" }
            : item
        )
      );
      console.log(
        "InventoryContext: Updated items with Uncategorized category"
      );
    } catch (err) {
      console.error("InventoryContext: Error deleting category:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items,
    categories,
    loading,
    error,
    updateItemStock,
    addItem,
    getLowStockItems,
    addCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
