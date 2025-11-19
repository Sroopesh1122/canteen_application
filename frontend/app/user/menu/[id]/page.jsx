"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { 
  FaRupeeSign, 
  FaStar, 
  FaTag, 
  FaArrowLeft, 
  FaFire, 
  FaCheck, 
  FaTimes, 
  FaShieldAlt, 
  FaLeaf, 
  FaRecycle, 
  FaHeart,
  FaShoppingCart,
  FaSpinner
} from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function to fetch menu item by ID
const fetchMenuItem = async ({ id, userId }) => {
  const response = await axios.get(`${API_URL}/api/v1/menu-item/public/user/${id}`, {
    params: {
      userId: userId || undefined
    }
  });
  return response.data.data;
};

// API function to fetch similar items by category
const fetchSimilarItems = async ({ categoryId, excludeId, userId }) => {
  const response = await axios.get(`${API_URL}/api/v1/menu-item/public/category/${categoryId}`, {
    params: {
      userId: userId || undefined
    }
  });
  // Filter out the current item from similar items
  return response.data.data.filter(item => item.itemId !== excludeId);
};

// Add to Cart Button Component
const AddToCartButton = ({ item, userId }) => {
  const queryClient = useQueryClient();

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ userId, itemId }) => {
      const response = await axios.post(`${API_URL}/api/v1/cart/secure/add`, null, {
        params: {
          userId: userId,
          itemId: itemId
        },
         headers:{
          Authorization:`Bearer ${localStorage.getItem("authToken")}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cart related queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['menuItem', item.itemId] });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  });

  const handleAddToCart = () => {
    if (!userId) {
      alert('Please login to add items to cart');
      return;
    }

    addToCartMutation.mutate({
      userId: userId,
      itemId: item.itemId
    });
  };

  const isAddingToCart = addToCartMutation.isPending;
  const isAddedToCart = item.saved || addToCartMutation.isSuccess;

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAddingToCart || isAddedToCart || !item.isAvailable}
      className={`flex items-center justify-center gap-3 flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition duration-200 ${
        isAddedToCart
          ? 'bg-green-500 text-white cursor-default'
          : !item.isAvailable
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
      } ${isAddingToCart ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isAddingToCart ? (
        <>
          <FaSpinner className="h-5 w-5 animate-spin" />
          <span>Adding...</span>
        </>
      ) : isAddedToCart ? (
        <>
          <FaCheck className="h-5 w-5" />
          <span>Added to Cart</span>
        </>
      ) : !item.isAvailable ? (
        <>
          <FaTimes className="h-5 w-5" />
          <span>Out of Stock</span>
        </>
      ) : (
        <>
          <FaShoppingCart className="h-5 w-5" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
};

// Similar Item Card Component
const SimilarItemCard = ({ item, userId }) => {
  const queryClient = useQueryClient();

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ userId, itemId }) => {
      const response = await axios.post(`${API_URL}/api/v1/cart/secure/add`, null, {
        params: {
          userId: userId,
          itemId: itemId
        }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cart related queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      queryClient.invalidateQueries({ queryKey: ['similarItems'] });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  });

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation
    e.preventDefault(); // Prevent link navigation
    
    if (!userId) {
      alert('Please login to add items to cart');
      return;
    }

    addToCartMutation.mutate({
      userId: userId,
      itemId: item.itemId
    });
  };

  const isAddingToCart = addToCartMutation.isPending;
  const isAddedToCart = item.saved || addToCartMutation.isSuccess;

  return (
    <Link 
      href={`/user/menu/${item.itemId}`}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 overflow-hidden group cursor-pointer"
    >
      {/* Item Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img 
          src={item.imgUrl} 
          alt={item.itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
          item.isAvailable 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </div>

        {/* Add to Cart Button for Similar Items */}
        {item.isAvailable && (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAddedToCart}
            className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${
              isAddedToCart
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-110'
            } ${isAddingToCart ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isAddingToCart ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : isAddedToCart ? (
              <FaCheck className="h-4 w-4" />
            ) : (
              <FaShoppingCart className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Item Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors duration-200">
          {item.itemName}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {item.description || 'A delicious menu item waiting to be enjoyed.'}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-green-600 font-bold">
            <FaRupeeSign className="h-3 w-3" />
            <span>{item.price}</span>
          </div>
          
          {item.rating && (
            <div className="flex items-center gap-1 text-yellow-600">
              <FaStar className="h-3 w-3" />
              <span className="text-sm font-semibold">{item.rating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const Page = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Get USER_ID from query client
  const USER_ID = queryClient.getQueryData(["profile"])?.data?.userId || null;

  // Fetch current menu item
  const { 
    data: menuItem, 
    isLoading: itemLoading, 
    isError: itemError,
    error: itemErrorData
  } = useQuery({
    queryKey: ['menuItem', id, USER_ID],
    queryFn: () => fetchMenuItem({ id, userId: USER_ID }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch similar items
  const { 
    data: similarItems = [], 
    isLoading: similarLoading,
    isError: similarError 
  } = useQuery({
    queryKey: ['similarItems', menuItem?.categoryId, id, USER_ID],
    queryFn: () => fetchSimilarItems({ 
      categoryId: menuItem?.categoryId, 
      excludeId: id, 
      userId: USER_ID 
    }),
    enabled: !!menuItem?.categoryId,
    staleTime: 5 * 60 * 1000,
  });

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Features data
  const features = [
    {
      icon: FaShieldAlt,
      title: "100% Secure",
      description: "Hygienically prepared with safety standards"
    },
    {
      icon: FaLeaf,
      title: "Fresh Ingredients",
      description: "Made with daily fresh ingredients"
    },
    {
      icon: FaRecycle,
      title: "Quality Assured",
      description: "Quality checked at every step"
    },
    {
      icon: FaHeart,
      title: "Healthy Choice",
      description: "Nutritious and balanced meal"
    }
  ];

  if (itemLoading) {
    return (
      <section className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg">Loading delicious details...</p>
        </div>
      </section>
    );
  }

  if (itemError) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading menu item</h2>
          <p className="text-gray-600 mb-6">{itemErrorData?.message || 'Failed to load menu item details'}</p>
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

  if (!menuItem) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Item Not Found</h2>
          <p className="text-gray-600 mb-6">The menu item you're looking for doesn't exist.</p>
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

  return (
    <section className="min-h-screen bg-white">
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
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaTag className="h-3 w-3" />
              <span>{menuItem.categoryName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Item Image */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-80 sm:h-96 lg:h-[500px] bg-gradient-to-br from-gray-200 to-gray-300">
              <img 
                src={menuItem.imgUrl} 
                alt={menuItem.itemName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=500&fit=crop';
                }}
              />
              {/* Availability Badge */}
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm flex items-center gap-2 ${
                menuItem.isAvailable 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full ${menuItem.isAvailable ? 'bg-white' : 'bg-white'}`}></div>
                {menuItem.isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {/* Category */}
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <FaTag className="h-3 w-3" />
              {menuItem.categoryName}
            </div>

            {/* Item Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {menuItem.itemName}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-2 text-green-600 font-bold text-2xl mb-6">
              <FaRupeeSign className="h-5 w-5" />
              <span>{menuItem.price}</span>
            </div>

            {/* Rating */}
            {menuItem.rating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <FaStar className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{menuItem.rating}/5</span>
                </div>
                <span className="text-gray-500 text-sm">Customer Rating</span>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {menuItem.description || 'A delicious menu item crafted with care and quality ingredients. Perfect for any occasion and guaranteed to satisfy your cravings.'}
              </p>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Why Choose This?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{feature.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <AddToCartButton item={menuItem} userId={USER_ID} />
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaFire className="h-6 w-6 text-orange-500" />
                  Similar Items
                </h2>
                <p className="text-gray-600 mt-1">More delicious options from {menuItem.categoryName}</p>
              </div>
            </div>

            {similarLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
              </div>
            ) : similarError ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <p className="text-gray-600">Failed to load similar items</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarItems.map((item) => (
                  <SimilarItemCard 
                    key={item.itemId}
                    item={item}
                    userId={USER_ID}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Similar Items Message */}
        {!similarLoading && similarItems.length === 0 && (
          <div className="mt-16 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Similar Items</h3>
            <p className="text-gray-600">
              This is the only item in the {menuItem.categoryName} category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;