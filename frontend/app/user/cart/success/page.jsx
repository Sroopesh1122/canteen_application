// app/user/cart/success/page.jsx
"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaCheckCircle, 
  FaShoppingBag, 
  FaMapMarkerAlt, 
  FaPhone,
  FaRupeeSign,
  FaWhatsapp,
  FaShareAlt,
  FaHome,
  FaUtensils,
  FaExclamationTriangle
} from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function to fetch order details
const getOrderDetails = async (orderId) => {
  const response = await axios.get(`${API_URL}/api/v1/orders/secure/${orderId}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// Skeleton Loading Components
const DeliveryInfoSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
    </div>
    <div className="space-y-3">
      {[1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrderItemsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <div key={item} className="flex justify-between items-center py-3 border-b border-gray-100">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const OrderSummarySkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [copied, setCopied] = useState(false);

  // Fetch order details using useQuery
  const { 
    data: orderData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId, // Only fetch if orderId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const copyOrderId = () => {
    if (orderData?.data?.orderId) {
      navigator.clipboard.writeText(orderData.data.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOrder = () => {
    if (orderData?.data?.orderId) {
      if (navigator.share) {
        navigator.share({
          title: 'My Food Order',
          text: `I just ordered food! Order ID: ${orderData.data.orderId}`,
          url: window.location.href,
        });
      } else {
        copyOrderId();
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Order Confirmed',
      'CONFIRMED': 'Confirmed',
      'PREPARING': 'Preparing',
      'READY': 'Ready',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Truncate long order IDs for display
  const truncateOrderId = (orderId) => {
    if (!orderId) return '';
    if (orderId.length <= 20) return orderId;
    return `${orderId.substring(0, 10)}...${orderId.substring(orderId.length - 6)}`;
  };

  if (isError) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">
            {error?.response?.data?.message || error?.message || 'Failed to load order details'}
          </p>
          <Link 
            href="/user/orders"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
          >
            <FaShoppingBag className="h-4 w-4" />
            View All Orders
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white">
      {/* Success Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            {isLoading ? (
              <>
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600 text-lg mb-4">
                  Thank you for your order. We've started preparing your food.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <button
                    onClick={copyOrderId}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition duration-200 max-w-full"
                    title={orderData.data.orderId}
                  >
                    <span className="font-mono font-semibold text-sm break-all">
                      {truncateOrderId(orderData.data.orderId)}
                    </span>
                    <FiCopy className="h-4 w-4 flex-shrink-0" />
                    {copied && <span className="text-green-600 text-sm flex-shrink-0">Copied!</span>}
                  </button>
                  <button
                    onClick={shareOrder}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition duration-200 flex-shrink-0"
                  >
                    <FaShareAlt className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            {isLoading ? (
              <DeliveryInfoSkeleton />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
                  Delivery Information
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">{orderData.data.deliveryAddress.name}</p>
                      <p className="text-gray-600">{orderData.data.deliveryAddress.address}</p>
                      <p className="text-gray-600">{orderData.data.deliveryAddress.city} - {orderData.data.deliveryAddress.pincode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FaPhone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600">{orderData.data.deliveryAddress.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {isLoading ? (
              <OrderItemsSkeleton />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaShoppingBag className="h-5 w-5 text-purple-500" />
                  Order Items ({orderData.data.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                </h2>
                
                <div className="space-y-4">
                  {orderData.data.items.map((item) => (
                    <div key={item.orderItemId} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{item.itemName}</p>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                          <p className="text-gray-600 text-sm">
                            <FaRupeeSign className="h-3 w-3 inline" />
                            {item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold flex-shrink-0 ml-2">
                        <FaRupeeSign className="h-4 w-4" />
                        <span>{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            {isLoading ? (
              <OrderSummarySkeleton />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <span className="text-gray-600 text-sm flex-shrink-0">Order ID</span>
                    <span 
                      className="font-mono font-semibold text-gray-800 text-sm break-all text-right sm:text-left"
                      title={orderData.data.orderId}
                    >
                      {truncateOrderId(orderData.data.orderId)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Order Date</span>
                    <span className="font-semibold text-gray-800 text-sm text-right">
                      {formatDate(orderData.data.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Status</span>
                    <span className={`font-semibold text-sm ${
                      orderData.data.status === 'PENDING' ? 'text-yellow-600' :
                      orderData.data.status === 'DELIVERED' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {getStatusDisplay(orderData.data.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-semibold">Total Amount</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <FaRupeeSign className="h-4 w-4" />
                      <span>{orderData.data.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {isLoading ? (
              <QuickActionsSkeleton />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <Link 
                    href="/user/orders"
                    className="w-full flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 text-center justify-center"
                  >
                    <FaShoppingBag className="h-5 w-5" />
                    View All Orders
                  </Link>
                  
                  <Link 
                    href="/user/menu"
                    className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold transition duration-200 text-center justify-center"
                  >
                    <FaUtensils className="h-5 w-5" />
                    Order More Food
                  </Link>
                  
                  <Link 
                    href="/user"
                    className="w-full flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 text-center justify-center"
                  >
                    <FaHome className="h-5 w-5" />
                    Go to Home
                  </Link>
                </div>
              </div>
            )}

            {/* Support */}
            {!isLoading && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
                
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    If you have any questions about your order, our support team is here to help.
                  </p>
                  
                  <button className="w-full flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 justify-center">
                    <FaWhatsapp className="h-5 w-5" />
                    Chat on WhatsApp
                  </button>
                  
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Or call us at</p>
                    <p className="font-semibold text-gray-800">+91 1800-123-4567</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;