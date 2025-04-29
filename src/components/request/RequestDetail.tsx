import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import { useRequest } from '../../context/RequestContext';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { RequestStatus } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, updateRequestStatus } = useRequest();
  const { items, updateItemStock } = useInventory();
  const { currentUser } = useAuth();
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  
  const request = requests.find(req => req.id === id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  
  if (!request) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Request not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/history')}
          >
            Back to Request History
          </Button>
        </div>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApprove = () => {
    updateRequestStatus(request.id, 'approved');
    setShowApproveModal(false);
    
    // Update inventory: reserve items
    request.items.forEach(item => {
      updateItemStock(item.itemId, -item.quantity, item.quantity);
    });
  };

  const handleDeny = () => {
    updateRequestStatus(request.id, 'denied');
    setShowDenyModal(false);
  };

  const handleFulfill = () => {
    if (!pickupLocation) {
      alert('Please enter a pickup location');
      return;
    }
    
    const pickupDetails = {
      location: pickupLocation,
      time: pickupTime ? new Date(pickupTime) : undefined,
      delivered: false
    };
    
    updateRequestStatus(request.id, 'fulfilled', pickupDetails);
    setShowFulfillModal(false);
    
    // Update inventory: items are no longer reserved, but are gone from available stock
    request.items.forEach(item => {
      updateItemStock(item.itemId, 0, -item.quantity);
    });
  };

  const handleMarkDelivered = () => {
    if (!request.pickupDetails) return;
    
    const updatedPickupDetails = {
      ...request.pickupDetails,
      delivered: true
    };
    
    updateRequestStatus(request.id, request.status, updatedPickupDetails);
  };

  const canApprove = isAdmin && request.status === 'pending';
  const canDeny = isAdmin && ['pending', 'approved'].includes(request.status);
  const canFulfill = isAdmin && request.status === 'approved';
  const canMarkDelivered = isAdmin && request.status === 'fulfilled' && request.pickupDetails && !request.pickupDetails.delivered;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/history')}
        >
          Back to List
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Request Information">
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{request.projectName}</h3>
                  <p className="text-sm text-gray-500">Requested by {request.requester.name}</p>
                </div>
                <Badge status={request.status} className="self-start" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description / Reason</h4>
                <p className="text-sm text-gray-600">{request.reason}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Request Date</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(request.createdAt)}
                  </div>
                </div>
                
                {request.dueDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Due Date</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(request.dueDate)}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${request.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      request.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Requested Items</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {request.items.map((item, index) => {
                        const inventoryItem = items.find(i => i.id === item.itemId);
                        const available = inventoryItem?.availableStock || 0;
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className={available < item.quantity ? 'text-red-600' : 'text-green-600'}>
                                {available}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card title="Status & Actions">
            <div className="space-y-6">
              {request.pickupDetails && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-700 mb-2">Pickup Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-700">Location</p>
                        <p className="text-sm text-blue-600">{request.pickupDetails.location}</p>
                      </div>
                    </div>
                    
                    {request.pickupDetails.time && (
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Time</p>
                          <p className="text-sm text-blue-600">
                            {new Date(request.pickupDetails.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      {request.pickupDetails.delivered ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Delivered</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Awaiting Pickup</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {canApprove && (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => setShowApproveModal(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                )}
                
                {canDeny && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => setShowDenyModal(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Request
                  </Button>
                )}
                
                {canFulfill && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowFulfillModal(true)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Fulfilled
                  </Button>
                )}
                
                {canMarkDelivered && (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleMarkDelivered}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Request Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Request Created</p>
                      <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  
                  {request.status !== 'pending' && (
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-4 w-4 rounded-full mt-1 ${
                        request.status === 'denied' ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {request.status === 'denied' ? 'Request Denied' : 'Request Approved'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(request.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {(request.status === 'fulfilled' || request.status === 'out_of_stock') && (
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-4 w-4 rounded-full mt-1 ${
                        request.status === 'out_of_stock' ? 'bg-gray-500' : 'bg-teal-500'
                      }`}></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {request.status === 'out_of_stock' ? 'Out of Stock' : 'Ready for Pickup'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(request.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.pickupDetails?.delivered && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Delivered</p>
                        <p className="text-xs text-gray-500">{formatDate(request.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Request"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove}>
              Approve
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to approve this request? This will reserve the requested items.
        </p>
      </Modal>
      
      {/* Deny Modal */}
      <Modal
        isOpen={showDenyModal}
        onClose={() => setShowDenyModal(false)}
        title="Deny Request"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowDenyModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeny}>
              Deny
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to deny this request? This action cannot be undone.
        </p>
      </Modal>
      
      {/* Fulfill Modal */}
      <Modal
        isOpen={showFulfillModal}
        onClose={() => setShowFulfillModal(false)}
        title="Mark as Fulfilled"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowFulfillModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFulfill}>
              Mark as Fulfilled
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Enter the pickup details for this request:
          </p>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location *
            </label>
            <input
              id="location"
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Room 302"
              required
            />
          </div>
          
          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Time (Optional)
            </label>
            <input
              id="pickupTime"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};