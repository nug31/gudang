import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export const LowStockItems: React.FC = () => {
  const { getLowStockItems } = useInventory();
  const navigate = useNavigate();

  const lowStockItems = getLowStockItems();

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/inventory")}
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {lowStockItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-md"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Available:{" "}
                  <span className="text-red-600 font-medium">
                    {item.availableStock}
                  </span>
                  {item.lowStockThreshold > 0 && (
                    <> (Threshold: {item.lowStockThreshold})</>
                  )}
                </p>
              </div>
            </div>

            <div className="text-sm font-medium text-red-600">Low Stock</div>
          </div>
        ))}

        {lowStockItems.length > 3 && (
          <div className="text-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/inventory")}
            >
              {lowStockItems.length - 3} more items with low stock
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
