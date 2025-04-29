import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { useInventory } from "../context/InventoryContext";
import { Search, Package, Tag, ShoppingCart, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  Card3D,
  ItemCard3D,
  Button3D,
  EnhancedCard3D,
  EnhancedButton3D,
  Notification3D,
  ProgressBar3D,
} from "../components/3d";

export const BrowseItemsPage: React.FC = () => {
  const { items, categories } = useInventory();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: "success" | "warning" | "info" | "error";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  // Use useMemo to optimize filtering performance
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Safely handle null or undefined values
      const itemName = item.name || "";
      const itemDescription = item.description || "";
      const itemCategory = item.category || "";
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        itemName.toLowerCase().includes(search) ||
        itemDescription.toLowerCase().includes(search) ||
        itemCategory.toLowerCase().includes(search);

      const matchesCategory = selectedCategory
        ? itemCategory === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  // Update search results when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate search delay for better UX
    const timer = setTimeout(() => {
      const search = searchTerm.toLowerCase();
      const results = items
        .filter((item) => {
          // Safely handle null or undefined values
          const itemName = item.name || "";
          const itemDescription = item.description || "";
          const itemCategory = item.category || "";

          return (
            itemName.toLowerCase().includes(search) ||
            itemDescription.toLowerCase().includes(search) ||
            itemCategory.toLowerCase().includes(search)
          );
        })
        .slice(0, 5); // Limit to 5 results for dropdown

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, items]);

  // Handle search item selection
  const handleSearchItemSelect = (item: any) => {
    setSearchTerm(item.name);
    setSearchResults([]);
    setSearchFocused(false);
    setSelectedResultIndex(-1);
  };

  // Handle keyboard navigation for search results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    // Only handle keyboard navigation if there are search results
    if (searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedResultIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (
          selectedResultIndex >= 0 &&
          selectedResultIndex < searchResults.length
        ) {
          handleSearchItemSelect(searchResults[selectedResultIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSearchFocused(false);
        setSelectedResultIndex(-1);
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedResultIndex(-1);
    setIsSearching(false);
  };

  // Highlight search term in text
  const highlightSearchTerm = (
    text: string | null | undefined,
    searchTerm: string
  ) => {
    // Handle null or undefined text
    if (!text) return "";
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 font-medium">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Get unique categories from items
  const uniqueCategories = Array.from(
    new Set(items.map((item) => item.category))
  );

  // Handle request item action
  const handleRequestItem = (item: any) => {
    // Show notification
    setNotification({
      visible: true,
      type: "success",
      title: "Item Selected",
      message: `${item.name} has been added to your request.`,
    });

    // Navigate to the request form page with the item pre-selected
    setTimeout(() => {
      navigate("/request/new", {
        state: {
          selectedItem: {
            id: item.id,
            name: item.name,
            quantity: 1,
          },
        },
      });
    }, 1000);
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Items</h1>

      <Notification3D
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        duration={3000}
      />

      {/* Search status indicator */}
      {searchTerm && (
        <div className="mb-2 text-sm text-gray-500">
          {isSearching ? (
            <span>Searching...</span>
          ) : (
            <span>
              Found {filteredItems.length} item
              {filteredItems.length !== 1 ? "s" : ""} matching "
              <span className="font-medium">{searchTerm}</span>"
            </span>
          )}
        </div>
      )}

      <EnhancedCard3D className="mb-6 p-4" variant="glass" elevation="low">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="relative md:flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedResultIndex(-1); // Reset selection on typing
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // Delay hiding the dropdown to allow for item selection
                setTimeout(() => {
                  setSearchFocused(false);
                  setSelectedResultIndex(-1);
                }, 200);
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />

            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-2">
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {/* Show managed categories first */}
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                {/* Show unique categories from items that aren't in the managed categories */}
                {uniqueCategories
                  .filter((cat) => !categories.some((c) => c.name === cat))
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            <EnhancedButton3D
              variant="gradient"
              size="md"
              rounded={true}
              animation="float"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
              className="w-full sm:w-auto"
            >
              Reset Filters
            </EnhancedButton3D>

            {/* Search results dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {searchResults.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-4 py-2 cursor-pointer flex items-start ${
                      index === selectedResultIndex
                        ? "bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSearchItemSelect(item)}
                    onMouseEnter={() => setSelectedResultIndex(index)}
                  >
                    <div className="w-full">
                      <div className="font-medium text-gray-900">
                        {highlightSearchTerm(item.name, searchTerm)}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {highlightSearchTerm(item.description, searchTerm)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex justify-between">
                        <span>Category: {item.category}</span>
                        <span
                          className={
                            item.availableStock <= 0
                              ? "text-red-500"
                              : "text-green-600"
                          }
                        >
                          {item.availableStock > 0
                            ? `${item.availableStock} available`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </EnhancedCard3D>

      {filteredItems.length === 0 ? (
        <EnhancedCard3D
          className="text-center py-12"
          variant="glass"
          elevation="low"
        >
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Items Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm
              ? `No items match your search for "${searchTerm}"`
              : selectedCategory
              ? `No items found in the "${selectedCategory}" category`
              : "No items are currently available in the inventory"}
          </p>
          <div className="mt-6">
            <EnhancedButton3D
              variant="gradient"
              size="md"
              rounded={true}
              animation="float"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              Reset Filters
            </EnhancedButton3D>
          </div>
        </EnhancedCard3D>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => {
            // Find the category object for this item if it exists
            const categoryObj = categories.find(
              (c) => c.name === item.category
            );
            const categoryColor = categoryObj?.color || "#CBD5E1";

            return (
              <ItemCard3D
                key={item.id}
                item={item}
                onClick={handleRequestItem}
                className="h-full"
              />
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default BrowseItemsPage;
