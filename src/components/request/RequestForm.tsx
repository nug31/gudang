import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRequest } from "../../context/RequestContext";
import { useInventory } from "../../context/InventoryContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { RequestItem } from "../../types";

export const RequestForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { submitRequest } = useRequest();
  const { items } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();

  const [projectName, setProjectName] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [requestItems, setRequestItems] = useState<RequestItem[]>([
    { itemId: "", itemName: "", quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there's a pre-selected item from the BrowseItemsPage
  useEffect(() => {
    if (location.state && location.state.selectedItem) {
      const selectedItem = location.state.selectedItem;
      console.log("RequestForm: Pre-selected item received:", selectedItem);

      // Update the request items with the pre-selected item
      setRequestItems([
        {
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: selectedItem.quantity || 1,
        },
      ]);
    }
  }, [location.state]);

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!projectName.trim()) {
        alert("Project name is required");
        setIsSubmitting(false);
        return;
      }

      if (!reason.trim()) {
        alert("Reason is required");
        setIsSubmitting(false);
        return;
      }

      const filteredItems = requestItems.filter((item) => item.itemId !== "");

      if (filteredItems.length === 0) {
        alert("Please select at least one item for your request");
        setIsSubmitting(false);
        return;
      }

      // Make sure all items have a valid quantity
      for (const item of filteredItems) {
        if (!item.quantity || item.quantity <= 0) {
          alert("All items must have a quantity greater than 0");
          setIsSubmitting(false);
          return;
        }
      }

      console.log("RequestForm: Submitting request with data:", {
        projectName,
        requesterId: currentUser.id,
        items: filteredItems,
        reason,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      await submitRequest({
        projectName,
        requesterId: currentUser.id,
        items: filteredItems,
        reason,
        priority,
        ...(dueDate && { dueDate: new Date(dueDate) }),
      });

      alert("Request submitted successfully!");
      navigate("/history");
    } catch (error) {
      console.error("RequestForm: Error submitting request:", error);
      alert(
        "Failed to submit request: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof RequestItem,
    value: string | number
  ) => {
    const newItems = [...requestItems];

    if (field === "itemId" && typeof value === "string") {
      const selectedItem = items.find((item) => item.id === value);
      newItems[index] = {
        ...newItems[index],
        itemId: value,
        itemName: selectedItem ? selectedItem.name : "",
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }

    setRequestItems(newItems);
  };

  const addItemRow = () => {
    setRequestItems([
      ...requestItems,
      { itemId: "", itemName: "", quantity: 1 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter((_, i) => i !== index));
    }
  };

  return (
    <Card title="New Item Request">
      <form onSubmit={handleSubmit} className="request-form">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Name *
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Smart Home Prototype"
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason / Description *
            </label>
            <textarea
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you need these items and how they will be used"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority Level *
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-auto"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date (Optional)
              </label>
              <div className="relative">
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItemRow}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {requestItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-grow">
                    <select
                      value={item.itemId}
                      onChange={(e) =>
                        handleItemChange(index, "itemId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-auto"
                      required
                    >
                      <option value="">Select an item</option>
                      {items.map((inventoryItem) => (
                        <option
                          key={inventoryItem.id}
                          value={inventoryItem.id}
                          disabled={inventoryItem.availableStock === 0}
                        >
                          {inventoryItem.name} ({inventoryItem.availableStock}{" "}
                          available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max={
                        items.find((i) => i.id === item.itemId)
                          ?.availableStock || 999
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                    disabled={requestItems.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
};
