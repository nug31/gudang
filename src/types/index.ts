export type UserRole = "requester" | "admin" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  profileImage?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  category: string;
}

export type RequestStatus =
  | "pending"
  | "approved"
  | "denied"
  | "fulfilled"
  | "out_of_stock";

export interface RequestItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface Request {
  id: string;
  projectName: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  items: RequestItem[];
  reason: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  pickupDetails?: {
    location: string;
    time?: Date;
    delivered: boolean;
  };
}
