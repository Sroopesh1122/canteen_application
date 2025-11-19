// app/user/cart/checkout/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FaRupeeSign, 
  FaShoppingCart, 
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCreditCard,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function to fetch cart data
const getCart = async () => {
  const response = await axios.get(`${API_URL}/api/v1/cart/secure/`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// API function to create order
const createOrder = async (orderData) => {
  const response = await axios.post(`${API_URL}/api/v1/orders/secure/create`, orderData, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// API function to cancel order
const cancelOrder = async (orderId) => {
  const response = await axios.post(`${API_URL}/api/v1/orders/secure/${orderId}/cancel`, {}, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// Load Razorpay script manually
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(window.Razorpay);
    };
    script.onerror = () => {
      resolve(null);
    };
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'online'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Fetch cart data
  const { 
    data: cartData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    staleTime: 2 * 60 * 1000,
  });

  // Load Razorpay on component mount
  useEffect(() => {
    const initializeRazorpay = async () => {
      setIsLoadingRazorpay(true);
      try {
        await loadRazorpay();
        setRazorpayLoaded(true);
      } catch (error) {
        console.error('Failed to load Razorpay:', error);
        toast.error('Failed to load payment system. Please refresh the page.');
      } finally {
        setIsLoadingRazorpay(false);
      }
    };

    initializeRazorpay();
  }, []);

  // Handle browser back button and navigation - FIXED: Only show modal when payment is in progress, not after success
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (createdOrderId && isProcessing) {
        event.preventDefault();
        event.returnValue = 'You have an ongoing payment. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handlePopState = (event) => {
      if (createdOrderId && isProcessing) {
        setPendingNavigation(() => () => window.history.back());
        setShowCancelModal(true);
        // Push the state back to prevent immediate navigation
        window.history.pushState(null, '', window.location.href);
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [createdOrderId, isProcessing]); // Added isProcessing dependency

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotals = () => {
    if (!cartData?.data) return { totalQuantity: 0, totalPrice: 0, items: [] };
    
    const result = cartData.data.reduce((acc, item) => {
      const quantity = item.quantity;
      const price = item.menuItem.price;
      const itemTotal = price * quantity;
      
      return {
        totalQuantity: acc.totalQuantity + quantity,
        totalPrice: acc.totalPrice + itemTotal,
        items: [
          ...acc.items,
          {
            ...item,
            itemTotal: itemTotal
          }
        ]
      };
    }, { totalQuantity: 0, totalPrice: 0, items: [] });

    return result;
  };

  const { totalQuantity, totalPrice, items } = calculateTotals();

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your delivery address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleCancelOrder = async () => {
    if (!createdOrderId) return;

    try {
      setIsProcessing(true);
      await cancelOrder(createdOrderId);
      setCreatedOrderId(null);
      setShowCancelModal(false);
      toast.success('Order cancelled successfully');
      
      // Execute pending navigation if exists
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigationAttempt = (path) => {
    if (createdOrderId && isProcessing) {
      setPendingNavigation(() => () => router.push(path));
      setShowCancelModal(true);
    } else {
      router.push(path);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Step 1: Create order in backend
      const orderData = {
        items: cartData.data.map(item => ({
          itemId: item.menuItem.itemId,
          quantity: item.quantity,
          price: item.menuItem.price
        })),
        deliveryAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        totalAmount: totalPrice
      };

      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.data.orderId;
      const razorpayOrderId = orderResponse.data.razorpayOrderId;
      
      // Store the created order ID
      setCreatedOrderId(orderId);

      // Step 2: Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Payment system is not ready. Please try again.');
      }

      // Step 3: Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        name: 'Food Delivery App',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment with backend
            await axios.post(`${API_URL}/api/v1/payments/secure/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderId
            }, {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`
              }
            });

            // Clear the created order ID and processing state
            setCreatedOrderId(null);
            setIsProcessing(false);
            
            // Redirect to success page
            window.location.href = `/user/cart/success?orderId=${orderId}`;
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: localStorage.getItem('userEmail') || 'customer@example.com'
        },
        notes: {
          orderId: orderId,
          address: formData.address
        },
        theme: {
          color: '#F59E0B'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment was cancelled. Please try again.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}. Please try again.`);
        setIsProcessing(false);
      });

      razorpay.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // Determine button state and text
  const getButtonState = () => {
    if (isProcessing) {
      return {
        disabled: true,
        text: 'Processing...',
        loading: true
      };
    }
    
    if (isLoadingRazorpay) {
      return {
        disabled: true,
        text: 'Loading Payment...',
        loading: true
      };
    }
    
    if (!razorpayLoaded) {
      return {
        disabled: true,
        text: 'Payment System Loading...',
        loading: false
      };
    }

    return {
      disabled: false,
      text: 'Pay Now',
      loading: false
    };
  };

  const buttonState = getButtonState();

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg">Loading checkout...</p>
        </div>
      </section>
    );
  }

  if (isError || !cartData?.data || cartData.data.length === 0) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unable to Checkout</h2>
          <p className="text-gray-600 mb-6">Your cart is empty or there was an error loading your items.</p>
          <Link 
            href="/user/cart"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNavigationAttempt("/user/cart")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-200 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Cart</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <FaCreditCard className="h-5 w-5 text-yellow-500" />
                <span>Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Razorpay Loading Warning */}
          {!razorpayLoaded && !isLoadingRazorpay && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-yellow-700 text-sm">
                Payment system not loaded. <button 
                  onClick={() => window.location.reload()} 
                  className="underline font-semibold hover:text-yellow-800"
                >
                  Refresh page
                </button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Information</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="h-4 w-4 text-yellow-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="h-4 w-4 text-yellow-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your 10-digit phone number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="h-4 w-4 text-yellow-500" />
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete delivery address with landmarks"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 resize-none"
                    required
                  />
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">Order Items ({totalQuantity} items)</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.cartId} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.menuItem.imgUrl} 
                            alt={item.menuItem.itemName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-1">{item.menuItem.itemName}</h3>
                          <p className="text-gray-600 text-sm line-clamp-1">{item.menuItem.description}</p>
                          <div className="flex items-center gap-1 text-green-600 font-bold mt-1">
                            <FaRupeeSign className="h-3 w-3" />
                            <span>{item.menuItem.price} × {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-gray-600 font-semibold flex flex-col items-end">
                          <span>Qty: {item.quantity}</span>
                          <div className="flex items-center gap-1 text-green-600 font-bold mt-1">
                            <FaRupeeSign className="h-3 w-3" />
                            <span>{item.itemTotal}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">Payment Summary</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Items Total ({totalQuantity} items)</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <FaRupeeSign className="h-4 w-4" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-gray-800">Free</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes & Charges</span>
                    <span className="font-semibold text-gray-800">₹0</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold text-xl">
                      <FaRupeeSign className="h-5 w-5" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={buttonState.disabled}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  >
                    {buttonState.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>{buttonState.text}</span>
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="h-5 w-5" />
                        <span>{buttonState.text}</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Secure payment powered by Razorpay. Your payment details are encrypted and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cancel Order Confirmation Modal - Only shows when payment is in progress */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cancel Payment?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              You have an ongoing payment process. If you cancel now, your order will be cancelled and you'll need to start over.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-semibold transition duration-200"
                disabled={isProcessing}
              >
                Continue Payment
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isProcessing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;