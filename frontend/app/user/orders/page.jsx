// app/user/orders/page.jsx
"use client";

import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaShoppingBag, 
  FaRupeeSign, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTruck,
  FaUtensils,
  FaHome,
  FaExclamationTriangle,
  FaChevronDown,
  FaTrash
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function to fetch orders
const getOrders = async ({ pageParam = 0 }) => {
  const response = await axios.get(`${API_URL}/api/v1/orders/secure/all`, {
    params: {
      page: pageParam,
      limit: 10
    },
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// API function to cancel order
const cancelOrder = async (orderId) => {
  const response = await axios.delete(`${API_URL}/api/v1/orders/secure/${orderId}/cancel`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// Status configuration
const statusConfig = {
  'PENDING': {
    label: 'Pending',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: FaClock,
    bgColor: 'bg-yellow-500'
  },
  'PAID': {
    label: 'Paid',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: FaCheckCircle,
    bgColor: 'bg-blue-500'
  },
  'CONFIRMED': {
    label: 'Confirmed',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: FaCheckCircle,
    bgColor: 'bg-green-500'
  },
  'PREPARING': {
    label: 'Preparing',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: FaUtensils,
    bgColor: 'bg-orange-500'
  },
  'OUT_FOR_DELIVERY': {
    label: 'Out for Delivery',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    icon: FaTruck,
    bgColor: 'bg-purple-500'
  },
  'DELIVERED': {
    label: 'Delivered',
    color: 'text-green-600 bg-green-50 border-green-200',
    icon: FaCheckCircle,
    bgColor: 'bg-green-500'
  },
  'CANCELLED': {
    label: 'Cancelled',
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: FaTimesCircle,
    bgColor: 'bg-red-500'
  }
};

// Skeleton Loading Components
const OrderCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// Cancel Confirmation Modal
const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, orderId, isCancelling }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Cancel Order?</h3>
            <p className="text-gray-600 text-sm">Order #{orderId?.slice(-8)}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel this order? This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Cancelling...
              </>
            ) : (
              <>
                <FaTrash className="h-4 w-4" />
                Cancel Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: null
  });

  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.pageable.pageNumber;
      const totalPages = lastPage.data.totalPages;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancelModal({ isOpen: false, orderId: null, orderNumber: null });
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error);
      // You can add a toast notification here
    }
  });

  // Flatten all orders from all pages
  const allOrders = data?.pages.flatMap(page => page.data.content) || [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    return statusConfig[status] || {
      label: status,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: FaClock,
      bgColor: 'bg-gray-500'
    };
  };

  // Calculate total items in order
  const getTotalItems = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle cancel order
  const handleCancelOrder = (orderId, orderNumber) => {
    setCancelModal({
      isOpen: true,
      orderId,
      orderNumber
    });
  };

  const confirmCancel = () => {
    if (cancelModal.orderId) {
      cancelOrderMutation.mutate(cancelModal.orderId);
    }
  };

  const closeCancelModal = () => {
    if (!cancelOrderMutation.isPending) {
      setCancelModal({ isOpen: false, orderId: null, orderNumber: null });
    }
  };

  if (isError) {
    return (
      <section className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">
              {error?.response?.data?.message || error?.message || 'Failed to load orders'}
            </p>
            <Link 
              href="/user"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
            >
              <FaHome className="h-4 w-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FaShoppingBag className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                  <p className="text-gray-600">Track and manage your food orders</p>
                </div>
              </div>
              
              <Link 
                href="/user/menu"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200"
              >
                <FaUtensils className="h-4 w-4" />
                Order Food
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Orders Count */}
          {!isLoading && (
            <div className="mb-6">
              <p className="text-gray-600">
                {allOrders.length} order{allOrders.length !== 1 ? 's' : ''} in total
              </p>
            </div>
          )}

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Loading State */}
            {isLoading && (
              <>
                {[...Array(6)].map((_, index) => (
                  <OrderCardSkeleton key={index} />
                ))}
              </>
            )}

            {/* Orders List */}
            {!isLoading && allOrders.length === 0 && (
              <div className="col-span-full">
                <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShoppingBag className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't placed any orders yet. Start exploring our menu to find something delicious!
                  </p>
                  <Link 
                    href="/user/menu"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
                  >
                    <FaUtensils className="h-4 w-4" />
                    Order Now
                  </Link>
                </div>
              </div>
            )}

            {allOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const StatusIcon = statusInfo.icon;
              const totalItems = getTotalItems(order.items);

              return (
                <div key={order.orderId} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">Order #{order.orderId.slice(-8)}</h3>
                        <p className="text-gray-600 text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    {/* Delivery Address */}
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{order.deliveryAddress.name}</p>
                      <p className="truncate">{order.deliveryAddress.address}, {order.deliveryAddress.city}</p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={item.orderItemId} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={item.imageUrl} 
                              alt={item.itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{item.itemName}</p>
                            <p className="text-gray-600 text-xs">
                              <FaRupeeSign className="h-2.5 w-2.5 inline" />
                              {item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {order.items.length > 2 && (
                        <p className="text-gray-500 text-sm text-center">
                          +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                        <FaRupeeSign className="h-4 w-4" />
                        <span>{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Link 
                        href={`/user/orders/${order.orderId}`}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-xl font-semibold text-center transition duration-200 text-sm"
                      >
                        View Details
                      </Link>
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancelOrder(order.orderId, order.orderId.slice(-8))}
                          disabled={cancelOrderMutation.isPending}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-semibold transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Orders
                    <FaChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* No more orders message */}
          {!hasNextPage && allOrders.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-500">You've reached the end of your orders</p>
            </div>
          )}
        </div>
      </section>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
        orderId={cancelModal.orderId}
        isCancelling={cancelOrderMutation.isPending}
      />
    </>
  );
};

export default OrdersPage;