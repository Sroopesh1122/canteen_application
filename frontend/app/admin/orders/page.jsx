"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaShoppingCart, 
  FaUser, 
  FaMapMarkerAlt,
  FaClock,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaRupeeSign,
  FaFilter,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Status configuration with colors and icons
const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: FaClock,
    iconColor: 'text-yellow-500'
  },
  PAID: { 
    label: 'Paid', 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FaCreditCard,
    iconColor: 'text-blue-500'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: FaTimesCircle,
    iconColor: 'text-red-500'
  },
  DELIVERED: { 
    label: 'Delivered', 
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: FaCheckCircle,
    iconColor: 'text-green-500'
  },
  FAILED: { 
    label: 'Failed', 
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: FaExclamationTriangle,
    iconColor: 'text-red-500'
  }
};

// All available statuses for dropdown
const allStatuses = ['PENDING', 'PAID', 'CANCELLED', 'DELIVERED', 'FAILED'];

// Stats Skeleton Component
const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Cards Component
const StatsCards = ({ stats, isLoading }) => {
  if (isLoading) {
    return <StatsSkeleton />;
  }

  const statItems = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-500'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: FaClock,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      iconColor: 'text-yellow-500'
    },
    {
      label: 'Preparing',
      value: stats?.preparing || 0,
      icon: FaClock,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-500'
    },
    {
      label: 'Delivered',
      value: stats?.delivered || 0,
      icon: FaCheckCircle,
      color: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-500'
    },
    {
      label: 'Cancelled',
      value: stats?.cancelled || 0,
      icon: FaTimesCircle,
      color: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-500'
    },
    {
      label: 'Failed',
      value: stats?.failed || 0,
      icon: FaExclamationTriangle,
      color: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color.split(' ')[0]}`}>
                <Icon className={`text-lg ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, order, newStatus, isLoading }) => {
  if (!isOpen) return null;

  const currentStatus = statusConfig[order.status];
  const nextStatus = statusConfig[newStatus];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <FaSync className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
              <p className="text-sm text-gray-600">Confirm status change</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Order ID:</span>
              <span className="text-sm text-gray-900 font-mono">{order.orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${currentStatus.color}`}>
                <currentStatus.icon className={`text-xs ${currentStatus.iconColor}`} />
                <span>{currentStatus.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-700">New Status:</span>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${nextStatus.color}`}>
                <nextStatus.icon className={`text-xs ${nextStatus.iconColor}`} />
                <span>{nextStatus.label}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to update this order status from <strong>{currentStatus.label}</strong> to <strong>{nextStatus.label}</strong>? This action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FaSync className="text-sm" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Update Dropdown Component
const StatusUpdateDropdown = ({ order, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = statusConfig[order.status];

  // Get all statuses except the current one
  const availableStatuses = allStatuses
    .filter(status => status !== order.status)
    .map(status => ({
      value: status,
      ...statusConfig[status]
    }));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border hover:shadow-md transition-all duration-200 ${currentStatus.color}`}
      >
        <currentStatus.icon className={`text-sm ${currentStatus.iconColor}`} />
        <span>{currentStatus.label}</span>
        <FaChevronDown className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
            {availableStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  onStatusUpdate(order.orderId, status.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <status.icon className={`text-sm ${status.iconColor}`} />
                <span>Mark as {status.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Skeleton Loader Component
const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-2">
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
            <div className="w-12 h-3 bg-gray-200 rounded ml-auto"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// Custom Dropdown Component
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' }
  ];

  const currentLabel = statusOptions.find(opt => opt.value === currentStatus)?.label || 'All Orders';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-yellow-400 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FaFilter className="text-gray-500 text-sm" />
        <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
        <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onStatusChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 ${
                  currentStatus === option.value 
                    ? 'bg-yellow-50 text-yellow-700 font-medium border-r-2 border-yellow-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                } ${option.value === '' ? 'border-b border-gray-100' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ orderData, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { order, user } = orderData;
  const StatusIcon = statusConfig[order.status]?.icon || FaClock;
  const statusStyle = statusConfig[order.status] || statusConfig.PENDING;

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg">
      {/* Order Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 rounded-lg">
                <FaShoppingCart className="text-yellow-600 text-sm" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.orderId}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusUpdateDropdown 
                        order={order} 
                        onStatusUpdate={onStatusUpdate}
                      />
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{totalItems} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <FaUser className="text-gray-400 text-sm" />
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FaMapMarkerAlt className="text-gray-400 text-sm" />
                <span className="truncate">{order.deliveryAddress.city}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <FaCalendarAlt className="text-gray-400 text-sm" />
                <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="text-right md:text-left">
                <div className="text-xl font-bold text-gray-900 flex items-center justify-end md:justify-start">
                  <FaRupeeSign className="text-gray-600 text-base mr-1" />
                  {order.totalAmount}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all duration-200"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-6 py-6 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer & Address */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-2">
                    <FaUser className="text-blue-500 text-sm" />
                  </div>
                  Customer Details
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-400 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-gray-400 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-gray-400 text-sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.deliveryAddress.phone}</p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-2">
                    <FaMapMarkerAlt className="text-green-500 text-sm" />
                  </div>
                  Delivery Address
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="font-medium text-gray-900 mb-2">{order.deliveryAddress.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{order.deliveryAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Order Items */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center mr-2">
                  <FaShoppingCart className="text-yellow-500 text-sm" />
                </div>
                Order Items ({order.items.length})
              </h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200 hover:border-yellow-200 transition-colors duration-200">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/56x56/f3f4f6/9ca3af?text=${encodeURIComponent(item.itemName.charAt(0))}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.itemName}</p>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 flex items-center justify-end">
                        <FaRupeeSign className="text-gray-600 text-xs mr-1" />
                        {item.price}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Metadata */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium text-gray-900 text-xs font-mono">
                      {order.razorpayOrderId || 'Not available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Page = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    orderId: null,
    newStatus: null,
    order: null
  });
  const queryClient = useQueryClient();

  // Fetch order stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["order-stats"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/orders/secure/stats`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      return response.data;
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await axios.put(`${API_URL}/api/v1/orders/secure/`, null, {
        params: { orderId, status },
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch both orders and stats
      queryClient.invalidateQueries(['orders', status]);
      queryClient.invalidateQueries(['order-stats']);
      toast.success('Order status updated successfully!');
      setConfirmationModal({ isOpen: false, orderId: null, newStatus: null, order: null });
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      toast.error(errorMessage);
      setConfirmationModal({ isOpen: false, orderId: null, newStatus: null, order: null });
    }
  });

  const getOrders = async ({ pageParam = 0 }) => {
    const response = await axios.get(`${API_URL}/api/v1/orders/secure/admin/all`, {
      params: {
        page: pageParam,
        limit: 10,
        ...(status && { status })
      },
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    });
    return response.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['orders', status],
    queryFn: getOrders,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.pageable.pageNumber;
      const totalPages = lastPage.data.totalPages;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    const order = data?.pages
      .flatMap(page => page.data.content)
      .find(orderData => orderData.order.orderId === orderId)?.order;

    setConfirmationModal({
      isOpen: true,
      orderId,
      newStatus,
      order
    });
  };

  const confirmStatusUpdate = () => {
    if (confirmationModal.orderId && confirmationModal.newStatus) {
      updateOrderStatusMutation.mutate({
        orderId: confirmationModal.orderId,
        status: confirmationModal.newStatus
      });
    }
  };

  // Update URL when status changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [status]);

  // Refetch when status changes
  useEffect(() => {
    refetch();
  }, [status, refetch]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 100) 
        return;
      if (isFetchingNextPage || !hasNextPage) return;
      
      fetchNextPage();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const allOrders = data?.pages.flatMap(page => page.data.content) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ isOpen: false, orderId: null, newStatus: null, order: null })}
          onConfirm={confirmStatusUpdate}
          order={confirmationModal.order}
          newStatus={confirmationModal.newStatus}
          isLoading={updateOrderStatusMutation.isPending}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="mt-2 text-gray-600">
                Manage and track customer orders efficiently
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <StatusDropdown 
                currentStatus={status} 
                onStatusChange={setStatus}
              />
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <StatsCards 
          stats={statsData?.data} 
          isLoading={statsLoading}
        />

        {/* Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            // Skeleton Loaders
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <OrderCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading orders</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {error?.message || 'Unable to load orders. Please check your connection and try again.'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          ) : allOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingCart className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {status ? `No ${status} orders available` : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <>
              {allOrders.map((orderData) => (
                <OrderCard 
                  key={orderData.order.orderId} 
                  orderData={orderData} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
              
              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <OrderCardSkeleton key={index} />
                  ))}
                </div>
              )}
              
              {/* End of list message */}
              {!hasNextPage && allOrders.length > 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheckCircle className="text-gray-400 text-lg" />
                  </div>
                  <p className="text-gray-500 font-medium">All orders loaded</p>
                  <p className="text-gray-400 text-sm mt-1">
                    You've reached the end of the orders list
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;