import React, { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { InventoryList } from "../components/admin/InventoryList";
import { CategoryManager } from "../components/admin/CategoryManager";
import { Button } from "../components/ui/Button";
import { Tag, Package } from "lucide-react";

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "items" ? "primary" : "secondary"}
            onClick={() => setActiveTab("items")}
            className="flex items-center"
          >
            <Package className="h-5 w-5 mr-2" />
            Items
          </Button>
          <Button
            variant={activeTab === "categories" ? "primary" : "secondary"}
            onClick={() => setActiveTab("categories")}
            className="flex items-center"
          >
            <Tag className="h-5 w-5 mr-2" />
            Categories
          </Button>
        </div>
      </div>

      {activeTab === "items" ? <InventoryList /> : <CategoryManager />}
    </MainLayout>
  );
};
