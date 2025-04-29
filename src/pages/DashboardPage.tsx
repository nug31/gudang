import React from "react";
import { Package, ShoppingBag, CheckCircle, AlertTriangle } from "lucide-react";
import { useRequest } from "../context/RequestContext";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { MainLayout } from "../components/layout/MainLayout";
import { RequestActivityEnhanced } from "../components/dashboard/RequestActivityEnhanced";
import { LowStockItems } from "../components/dashboard/LowStockItems";
import { RecentRequests } from "../components/dashboard/RecentRequests";
import { RequestList } from "../components/request/RequestList";
import {
  StatCard3D,
  EnhancedCard3D,
  EnhancedButton3D,
  ProgressBar3D,
} from "../components/3d";

export const DashboardPage: React.FC = () => {
  const { requests, getUserRequests } = useRequest();
  const { items, getLowStockItems } = useInventory();
  const { currentUser } = useAuth();

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "manager";
  const userRequests = getUserRequests();

  // Stats calculations
  const pendingRequests = requests.filter(
    (req) => req.status === "pending"
  ).length;
  const approvedRequests = requests.filter(
    (req) => req.status === "approved"
  ).length;
  const fullfilledRequests = requests.filter(
    (req) => req.status === "fulfilled"
  ).length;
  const lowStockCount = getLowStockItems().length;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {isAdmin ? (
        <>
          {/* Admin Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard3D
              title="Pending Requests"
              value={pendingRequests}
              icon={<Package className="h-6 w-6" />}
              variant={pendingRequests > 0 ? "warning" : "default"}
            />
            <StatCard3D
              title="Approved Requests"
              value={approvedRequests}
              icon={<CheckCircle className="h-6 w-6" />}
              variant="success"
            />
            <StatCard3D
              title="Items Fulfilled"
              value={fullfilledRequests}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            <StatCard3D
              title="Low Stock Items"
              value={lowStockCount}
              icon={<AlertTriangle className="h-6 w-6" />}
              variant={lowStockCount > 0 ? "danger" : "default"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <EnhancedCard3D
                title="Request Activity"
                className="h-full"
                variant="primary"
                glassEffect={true}
                elevation="medium"
              >
                <RequestActivityEnhanced />
              </EnhancedCard3D>
            </div>
            <div>
              <EnhancedCard3D
                title="Low Stock Items"
                className="h-full"
                variant="warning"
                elevation="high"
                footer={
                  <div className="flex justify-end">
                    <EnhancedButton3D
                      variant="gradient"
                      size="sm"
                      rounded={true}
                      animation="float"
                      onClick={() => navigate("/inventory")}
                    >
                      View All
                    </EnhancedButton3D>
                  </div>
                }
              >
                <LowStockItems />

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Inventory Health</p>
                  <ProgressBar3D
                    value={100 - (lowStockCount / items.length) * 100}
                    color={lowStockCount > 5 ? "warning" : "success"}
                    height={8}
                    showValue={true}
                    animated={true}
                  />
                </div>
              </EnhancedCard3D>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EnhancedCard3D
                title="Pending Requests"
                className="h-full"
                variant="default"
                elevation="medium"
              >
                <RequestList
                  requests={requests.filter((req) => req.status === "pending")}
                  showFilters={false}
                  emptyMessage="No pending requests"
                />
              </EnhancedCard3D>
            </div>
            <div>
              <EnhancedCard3D
                title="Recent Activity"
                className="h-full"
                variant="info"
                glassEffect={true}
              >
                <RecentRequests />
              </EnhancedCard3D>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Requester Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard3D
              title="My Requests"
              value={userRequests.length}
              subtitle="Total requests submitted"
              icon={<Package className="h-6 w-6" />}
            />
            <StatCard3D
              title="Pending"
              value={
                userRequests.filter((req) => req.status === "pending").length
              }
              subtitle="Awaiting approval"
              icon={<AlertTriangle className="h-6 w-6" />}
              variant="warning"
            />
            <StatCard3D
              title="Approved"
              value={
                userRequests.filter((req) =>
                  ["approved", "fulfilled"].includes(req.status)
                ).length
              }
              subtitle="Ready or fulfilled"
              icon={<CheckCircle className="h-6 w-6" />}
              variant="success"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6">
            <EnhancedCard3D
              title="My Request Activity"
              className="h-full"
              variant="primary"
              glassEffect={true}
              elevation="medium"
            >
              <RequestActivityEnhanced />
            </EnhancedCard3D>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <EnhancedCard3D
              title="My Recent Requests"
              className="h-full"
              variant="default"
              elevation="medium"
              footer={
                <div className="flex justify-end">
                  <EnhancedButton3D
                    variant="gradient"
                    size="sm"
                    rounded={true}
                    animation="float"
                    onClick={() => navigate("/request")}
                  >
                    New Request
                  </EnhancedButton3D>
                </div>
              }
            >
              <RequestList
                requests={userRequests}
                showFilters={false}
                emptyMessage="You haven't submitted any requests yet"
              />
            </EnhancedCard3D>
          </div>
        </>
      )}
    </MainLayout>
  );
};
