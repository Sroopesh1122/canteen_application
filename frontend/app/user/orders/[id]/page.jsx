// app/user/orders/[id]/page.jsx
"use client";

import { useParams } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaTrash,
  FaExclamationTriangle,
  FaShareAlt,
  FaWhatsapp,
  FaFileDownload
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
const OrderDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

const OrderDetailsPage = () => {
  const { id: ORDER_ID } = useParams();
  const [copied, setCopied] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch order details
  const { 
    data: orderData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['order', ORDER_ID],
    queryFn: () => getOrderDetails(ORDER_ID),
    enabled: !!ORDER_ID,
    staleTime: 5 * 60 * 1000,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // Invalidate and refetch order details
      queryClient.invalidateQueries({ queryKey: ['order', ORDER_ID] });
      setCancelModal({ isOpen: false, orderId: null });
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error);
    }
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
          text: `Check out my food order! Order ID: ${orderData.data.orderId}`,
          url: window.location.href,
        });
      } else {
        copyOrderId();
      }
    }
  };

  const handleCancelOrder = () => {
    setCancelModal({
      isOpen: true,
      orderId: ORDER_ID
    });
  };

  const confirmCancel = () => {
    if (cancelModal.orderId) {
      cancelOrderMutation.mutate(cancelModal.orderId);
    }
  };

  const closeCancelModal = () => {
    if (!cancelOrderMutation.isPending) {
      setCancelModal({ isOpen: false, orderId: null });
    }
  };

  // Simple text-based PDF generation
  const downloadInvoice = async () => {
    if (!orderData?.data) return;
    
    setIsDownloading(true);
    try {
      // Dynamically import jspdf to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const order = orderData.data;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Food Delivery Order', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Order Information
      doc.setFont('helvetica', 'bold');
      doc.text('Order Information:', 20, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Order ID: ${order.orderId}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Order Date: ${formatDate(order.createdAt)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Status: ${getStatusDisplay(order.status).label}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Total Items: ${getTotalItems(order.items)}`, 20, yPosition);
      yPosition += 15;

      // Customer Information
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Information:', 20, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${order.deliveryAddress.name}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Phone: ${order.deliveryAddress.phone}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Address: ${order.deliveryAddress.address}`, 20, yPosition);
      yPosition += 6;
      doc.text(`City: ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`, 20, yPosition);
      yPosition += 20;

      // Order Items Table Header
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 20, yPosition);
      doc.text('Qty', 120, yPosition);
      doc.text('Price', 150, yPosition);
      doc.text('Total', 180, yPosition);
      yPosition += 8;

      // Draw line
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Order Items
      doc.setFont('helvetica', 'normal');
      order.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(item.itemName, 20, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(`₹${item.price}`, 150, yPosition);
        doc.text(`₹${item.price * item.quantity}`, 180, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Total Amount
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', 120, yPosition);
      doc.text(`₹${order.totalAmount}`, 180, yPosition);
      yPosition += 15;

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Thank you for your order!', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      doc.text('For any queries, contact: support@fooddelight.com', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      doc.text('Phone: +91 1800-123-4567', pageWidth / 2, yPosition, { align: 'center' });

      // Save the PDF
      doc.save(`Invoice_${order.orderId}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Format date for PDF
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

  // Calculate total items
  const getTotalItems = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (isError) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error?.response?.data?.message || error?.message || 'Failed to load order details'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/user/orders"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
              >
                <FaShoppingBag className="h-4 w-4" />
                View All Orders
              </Link>
              <Link 
                href="/user"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
              >
                <FaHome className="h-4 w-4" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const order = orderData?.data;
  const statusInfo = getStatusDisplay(order?.status);
  const StatusIcon = statusInfo.icon;
  const totalItems = getTotalItems(order?.items || []);

  return (
    <>
      <section className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  href="/user/orders"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-200 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Orders</span>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaShoppingBag className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
                    <p className="text-gray-600 text-sm">Order #{order?.orderId?.slice(-8)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadInvoice}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FaFileDownload className="h-4 w-4" />
                      <span>Download Invoice</span>
                    </>
                  )}
                </button>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition duration-200"
                  title={order?.orderId}
                >
                  <span className="font-mono font-semibold text-sm">
                    #{order?.orderId?.slice(-8)}
                  </span>
                  <FiCopy className="h-4 w-4" />
                  {copied && <span className="text-green-600 text-sm">Copied!</span>}
                </button>
                <button
                  onClick={shareOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition duration-200"
                >
                  <FaShareAlt className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <StatusIcon className="h-5 w-5" />
                    Order Status
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </div>
                
                {order?.status === 'PENDING' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm">
                      Your order is pending payment confirmation. You can cancel this order if needed.
                    </p>
                  </div>
                )}
                
                {order?.status === 'CANCELLED' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 text-sm">
                      This order has been cancelled.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
                  Delivery Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">{order?.deliveryAddress?.name}</p>
                      <p className="text-gray-600">{order?.deliveryAddress?.address}</p>
                      <p className="text-gray-600">{order?.deliveryAddress?.city} - {order?.deliveryAddress?.pincode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FaPhone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600">{order?.deliveryAddress?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaShoppingBag className="h-5 w-5 text-purple-500" />
                  Order Items ({totalItems} items)
                </h2>
                
                <div className="space-y-4">
                  {order?.items?.map((item) => (
                    <div key={item.orderItemId} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h3 className="font-semibold text-gray-800 mb-1">{item.itemName}</h3>
                        <p className="text-gray-600 text-sm">
                          <FaRupeeSign className="h-3 w-3 inline" />
                          {item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <FaRupeeSign className="h-4 w-4" />
                        <span>{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary & Actions */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-mono font-semibold text-gray-800 text-sm">
                      #{order?.orderId?.slice(-8)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-semibold text-gray-800 text-sm text-right">
                      {formatDate(order?.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold text-sm ${statusInfo.color.split(' ')[0]}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-semibold">Total Amount</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <FaRupeeSign className="h-4 w-4" />
                      <span>{order?.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadInvoice}
                    disabled={isDownloading}
                    className="w-full flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaFileDownload className="h-5 w-5" />
                        Download Invoice
                      </>
                    )}
                  </button>
                  
                  <Link 
                    href="/user/orders"
                    className="w-full flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 text-center justify-center"
                  >
                    <FaShoppingBag className="h-5 w-5" />
                    All Orders
                  </Link>
                  
                  <Link 
                    href="/user/menu"
                    className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold transition duration-200 text-center justify-center"
                  >
                    <FaUtensils className="h-5 w-5" />
                    Order Again
                  </Link>
                  
                  {order?.status === 'PENDING' && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                      className="w-full flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTimesCircle className="h-5 w-5" />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Support */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h2>
                
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">
                    Having issues with your order? Contact our support team.
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
            </div>
          </div>
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

export default OrderDetailsPage;