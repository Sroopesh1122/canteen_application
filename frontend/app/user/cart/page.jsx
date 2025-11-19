"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaShoppingCart, 
  FaRupeeSign, 
  FaArrowLeft,
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

// API function to remove item from cart
const removeFromCart = async (cartId) => {
  const response = await axios.delete(`${API_URL}/api/v1/cart/secure/remove`, {
    params: { cartId },
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("authToken")}`
    }
  });
  return response.data;
};

// API function to update quantity
const updateQuantity = async ({ cartId, quantity }) => {
  const response = await axios.put(`${API_URL}/api/v1/cart/secure/${cartId}/quantity`, 
    null, // No request body for PUT with request params
    {
      params: { quantity },
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      }
    }
  );
  return response.data;
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Remove Item</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            disabled={isDeleting}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-gray-600 text-lg mb-2">
            Are you sure you want to remove
          </p>
          <p className="text-gray-800 font-semibold text-lg mb-1">"{itemName}"</p>
          <p className="text-gray-600 text-lg">from your cart?</p>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Removing...</span>
              </>
            ) : (
              <>
                <FaTrash className="h-4 w-4" />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [localCartItems, setLocalCartItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    cartId: null,
    itemName: '',
  });
  
  // Fetch cart data
  const { 
    data: cartData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Initialize local cart state when data is fetched
  useEffect(() => {
    if (cartData?.data) {
      // Use the quantity from backend response
      const itemsWithQuantity = cartData.data.map(item => ({
        ...item,
        quantity: item.quantity // Use the actual quantity from backend
      }));
      setLocalCartItems(itemsWithQuantity);
    }
  }, [cartData]);

  // Mutation for removing item
  const removeItemMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setModalState({ isOpen: false, cartId: null, itemName: '' });
      toast.success('Item removed from cart');
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      setModalState({ isOpen: false, cartId: null, itemName: '' });
      toast.error('Failed to remove item from cart');
    }
  });

  // Mutation for updating quantity
  const updateQuantityMutation = useMutation({
    mutationFn: updateQuantity,
    onSuccess: () => {
      // Invalidate and refetch cart data to ensure sync
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error, variables) => {
      console.error('Error updating quantity:', error);
      // Revert the local state on error
      const { cartId, previousQuantity } = variables;
      setLocalCartItems(prevItems => 
        prevItems.map(item => 
          item.cartId === cartId 
            ? { ...item, quantity: previousQuantity }
            : item
        )
      );
      toast.error('Failed to update quantity');
    }
  });

  // Handle quantity increase
  const handleIncrease = (cartId) => {
    setLocalCartItems(prevItems => 
      prevItems.map(item => {
        if (item.cartId === cartId) {
          const newQuantity = item.quantity + 1;
          // Update backend
          updateQuantityMutation.mutate({ 
            cartId, 
            quantity: newQuantity,
            previousQuantity: item.quantity 
          });
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Handle quantity decrease
  const handleDecrease = (cartId) => {
    setLocalCartItems(prevItems => 
      prevItems.map(item => {
        if (item.cartId === cartId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          // Update backend
          updateQuantityMutation.mutate({ 
            cartId, 
            quantity: newQuantity,
            previousQuantity: item.quantity 
          });
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Open confirmation modal
  const openDeleteModal = (cartId, itemName) => {
    setModalState({
      isOpen: true,
      cartId,
      itemName,
    });
  };

  // Close confirmation modal
  const closeDeleteModal = () => {
    if (!removeItemMutation.isPending) {
      setModalState({ isOpen: false, cartId: null, itemName: '' });
    }
  };

  // Confirm and remove item
  const confirmRemove = () => {
    if (modalState.cartId) {
      removeItemMutation.mutate(modalState.cartId);
    }
  };

  // Calculate totals based on local quantities
  const calculateTotals = () => {
    if (localCartItems.length === 0) return { totalQuantity: 0, totalPrice: 0 };
    
    return localCartItems.reduce((acc, item) => {
      const quantity = item.quantity;
      const price = item.menuItem.price;
      
      return {
        totalQuantity: acc.totalQuantity + quantity,
        totalPrice: acc.totalPrice + (price * quantity)
      };
    }, { totalQuantity: 0, totalPrice: 0 });
  };

  const { totalQuantity, totalPrice } = calculateTotals();

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg">Loading your cart...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading cart</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'Failed to load cart items'}</p>
          <Link 
            href="/user/menu"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 inline-flex items-center gap-2"
          >
            <FaArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </section>
    );
  }

  const cartItems = localCartItems;

  if (cartItems.length === 0 && !isLoading) {
    return (
      <section className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/user/menu"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-200 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
              >
                <FaArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Menu</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious items to your cart yet. Start exploring our menu to find something you'll love!
            </p>
            <Link 
              href="/user/menu"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3"
            >
              <FaShoppingCart className="h-5 w-5" />
              Explore Menu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/user/menu"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-200 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Menu</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <FaShoppingCart className="h-5 w-5 text-yellow-500" />
                <span>My Cart ({totalQuantity} items)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">Cart Items</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="p-6">
                      <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden">
                            <img 
                              src={item.menuItem.imgUrl} 
                              alt={item.menuItem.itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop';
                              }}
                            />
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {item.menuItem.itemName}
                          </h3>
                          <div className="flex items-center gap-2 text-green-600 font-bold">
                            <FaRupeeSign className="h-3 w-3" />
                            <span>{item.menuItem.price}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Category: {item.menuItem.categoryName}
                          </div>
                        </div>

                        {/* Quantity Controls and Remove */}
                        <div className="flex flex-col items-end justify-between">
                          {/* Remove Button */}
                          <button
                            onClick={() => openDeleteModal(item.cartId, item.menuItem.itemName)}
                            disabled={removeItemMutation.isPending || updateQuantityMutation.isPending}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition duration-200"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                            <button
                              onClick={() => handleDecrease(item.cartId)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                              <FaMinus className="h-3 w-3 text-gray-600" />
                            </button>
                            
                            <span className="text-lg font-semibold text-gray-800 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleIncrease(item.cartId)}
                              disabled={updateQuantityMutation.isPending}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaPlus className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="flex items-center gap-1 text-green-600 font-bold mt-2">
                            <FaRupeeSign className="h-3 w-3" />
                            <span>{item.menuItem.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Total Items */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold text-gray-800">{totalQuantity} items</span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                      <FaRupeeSign className="h-4 w-4" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-gray-800">Free</span>
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <div className="flex items-center gap-1 text-green-600 font-bold text-xl">
                      <FaRupeeSign className="h-5 w-5" />
                      <span>{totalPrice}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={() => router.push("/user/cart/checkout")} 
                    disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Continue Shopping */}
                  <Link 
                    href="/user/menu"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 py-3 px-6 rounded-xl font-semibold text-center transition duration-200 inline-block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmRemove}
        itemName={modalState.itemName}
        isDeleting={removeItemMutation.isPending}
      />
    </>
  );
};

export default Page;