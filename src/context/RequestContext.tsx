import React, { createContext, useState, useContext, useEffect } from "react";
import { Request, RequestStatus, RequestItem } from "../types";
import { mockRequests } from "../data/mockData";
import { useAuth } from "./AuthContext";
import * as api from "../services/api";

interface RequestContextType {
  requests: Request[];
  loading: boolean;
  error: string | null;
  submitRequest: (
    newRequest: Omit<Request, "id" | "createdAt" | "updatedAt" | "status">
  ) => void;
  updateRequestStatus: (
    requestId: string,
    status: RequestStatus,
    pickupDetails?: Request["pickupDetails"]
  ) => void;
  getUserRequests: () => Request[];
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
};

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch requests from the API
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // Try to use the API first
        try {
          const apiRequests = await api.fetchRequests();
          if (apiRequests && apiRequests.length > 0) {
            setRequests(apiRequests);
          } else {
            // Fallback to mock data if API returns empty
            console.warn("API returned no requests, falling back to mock data");
            setRequests(mockRequests);
          }
        } catch (apiError) {
          // Fallback to mock data if API fails
          console.warn(
            "API fetch failed, falling back to mock data:",
            apiError
          );
          setRequests(mockRequests);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const submitRequest = async (
    newRequest: Omit<Request, "id" | "createdAt" | "updatedAt" | "status">
  ) => {
    try {
      setLoading(true);
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Call the API to submit the request
      const request = await api.submitRequest({
        projectName: newRequest.projectName,
        requesterId: currentUser.id,
        items: newRequest.items,
        reason: newRequest.reason,
        priority: newRequest.priority,
        dueDate: newRequest.dueDate,
      });

      // Add the new request to the state
      setRequests((prev) => [...prev, request]);

      return request;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: RequestStatus,
    pickupDetails?: Request["pickupDetails"]
  ) => {
    try {
      setLoading(true);

      // Call the API to update the request status
      const updatedRequest = await api.updateRequestStatus(
        requestId,
        status,
        pickupDetails
      );

      // Update the request in the state
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? updatedRequest : request
        )
      );

      return updatedRequest;
    } catch (err) {
      console.error("Error updating request status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update request status"
      );

      // Fallback to local update if API fails
      console.warn("API update failed, falling back to local update");
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
                updatedAt: new Date(),
                ...(pickupDetails && { pickupDetails }),
              }
            : request
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserRequests = () => {
    if (!currentUser) return [];
    return requests.filter((req) => req.requester.id === currentUser.id);
  };

  const value = {
    requests,
    loading,
    error,
    submitRequest,
    updateRequestStatus,
    getUserRequests,
  };

  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  );
};
