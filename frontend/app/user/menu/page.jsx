"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaSearch, FaClock, FaTag, FaRupeeSign, FaList, FaStar, FaFilter, FaTimes, FaCheck, FaFire, FaShoppingCart, FaSpinner } from 'react-icons/fa'
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Skeleton Loader Component
const MenuCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
    {/* Image Skeleton */}
    <div className="h-60 bg-gradient-to-br from-gray-200 to-gray-300 relative">
      <div className="absolute top-3 left-3 w-20 h-6 bg-gray-300 rounded-full"></div>
      <div className="absolute top-3 right-3 w-12 h-6 bg-gray-300 rounded-full"></div>
    </div>
    
    {/* Content Skeleton */}
    <div className="p-5">
      <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
      
      {/* Price and Button Skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="w-16 h-6 bg-gray-300 rounded"></div>
        <div className="w-24 h-10 bg-gray-300 rounded-xl"></div>
      </div>
      
      {/* Availability Skeleton */}
      <div className="w-20 h-6 bg-gray-300 rounded-full mt-3"></div>
    </div>
  </div>
)

// Filter Skeleton Component
const FilterSkeleton = () => (
  <div className="lg:w-80 bg-white rounded-2xl p-6 h-fit lg:sticky lg:top-6 shadow-lg border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
      <div>
        <div className="h-6 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
    
    {/* Search Skeleton */}
    <div className="mb-6">
      <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
      <div className="h-12 bg-gray-300 rounded-xl"></div>
    </div>
    
    {/* Categories Skeleton */}
    <div className="mb-6">
      <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-300 rounded-xl"></div>
        ))}
      </div>
    </div>
    
    {/* Price Filter Skeleton */}
    <div className="mb-6">
      <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-300 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
)

// MenuCard Component with useMutation
const MenuCard = ({ item, userId }) => {
  const router = useRouter()
  const queryClient = useQueryClient()

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
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch cart related queries
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
      toast.success('Item added to cart successfully!')
    },
    onError: (error) => {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart. Please try again.')
    }
  })

  const handleAddToCart = async (e) => {
    e.stopPropagation() // Prevent navigation to item detail page
    
    if (!userId) {
      toast.error('Please login to add items to cart')
      return
    }

    addToCartMutation.mutate({
      userId: userId,
      itemId: item.itemId
    })
  }

  const handleCardClick = () => {
    router.push(`/user/menu/${item.itemId}`)
  }

  // Determine button state based on mutation status and item data
  const isAddingToCart = addToCartMutation.isPending
  const isAddedToCart = item.saved || addToCartMutation.isSuccess

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 overflow-hidden group cursor-pointer"
    >
      {/* Enhanced Item Image */}
      <div className="relative h-60 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <img 
          src={item.imgUrl} 
          alt={item.itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Category Tag */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          {item.categoryName}
        </div>
        
        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <FaStar className="h-3 w-3" />
            <span>{item.rating}</span>
          </div>
        )}
      </div>
      
      {/* Enhanced Item Info */}
      <div className="p-5">
        {/* Item Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors duration-200">
          {item.itemName}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {item.description || 'A delicious menu item waiting to be enjoyed. Perfect for any occasion.'}
        </p>
        
        {/* Price and Cart Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Price */}
          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
            <FaRupeeSign className="h-4 w-4" />
            <span>{item.price}</span>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAddedToCart || !item.isAvailable}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
              isAddedToCart
                ? 'bg-green-500 text-white cursor-default'
                : !item.isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-lg transform hover:scale-105'
            } ${isAddingToCart ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isAddingToCart ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : isAddedToCart ? (
              <>
                <FaCheck className="h-4 w-4" />
                <span>Added</span>
              </>
            ) : !item.isAvailable ? (
              <>
                <FaShoppingCart className="h-4 w-4" />
                <span>Unavailable</span>
              </>
            ) : (
              <>
                <FaShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
        
        {/* Availability Status */}
        <div className={`flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
          item.isAvailable 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
    </div>
  )
}

// API function to fetch categories
const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/api/v1/category/public/`, {
    params: {
      page: 0,
      limit: 100
    }
  })
  return response.data.data.content
}

// API function to fetch menu items with filters
const fetchMenuItems = async ({ pageParam = 0, queryKey }) => {
  const [_, { search, category, minPrice, maxPrice, userId }] = queryKey
  const response = await axios.get(`${API_URL}/api/v1/menu-item/public/user/`, {
    params: {
      page: pageParam,
      limit: 12,
      userId: userId || undefined,
      q: search || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    }
  })
  return response.data
}

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Price range options
const priceRanges = [
  { label: "All Prices", min: null, max: null },
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50 - ₹100", min: 50, max: 100 },
  { label: "₹100 - ₹200", min: 100, max: 200 },
  { label: "Over ₹200", min: 200, max: null }
]

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Get USER_ID from query client
  const USER_ID = queryClient.getQueryData(["profile"])?.data?.userId || null;

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null, 
    max: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null 
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  
  const { ref, inView } = useInView()

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (priceRange.min !== null) params.set('minPrice', priceRange.min.toString())
    if (priceRange.max !== null) params.set('maxPrice', priceRange.max.toString())
    
    // Replace the current URL with updated parameters
    const newUrl = params.toString() ? `?${params.toString()}` : '/user/menu'
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearchQuery, selectedCategory, priceRange, router])

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })

  // Filter object for query - INCLUDING USER_ID
  const filters = {
    search: debouncedSearchQuery,
    category: selectedCategory,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    userId: USER_ID // Add userId to filters
  }

  // Infinite query for menu items
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
    queryKey: ['menuItems', filters],
    queryFn: fetchMenuItems,
    getNextPageParam: (lastPage) => {
      const { data: { last, number } } = lastPage
      return last ? undefined : number + 1
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!USER_ID, // Only fetch when USER_ID is available
  })

  // Scroll to top when filters change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [debouncedSearchQuery, selectedCategory, priceRange])

  // Fetch next page when the last element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all menu items from all pages
  const allMenuItems = data?.pages.flatMap(page => page.data.content) || []

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
  }

  // Handle price range filter
  const handlePriceRangeChange = (range) => {
    setPriceRange({
      min: range.min,
      max: range.max
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange({ min: null, max: null })
    toast.success('Filters cleared successfully!')
  }

  // Check if any filter is active
  const isFilterActive = searchQuery || selectedCategory || priceRange.min !== null || priceRange.max !== null

  // Show loading state while waiting for USER_ID
  if (!USER_ID) {
    return (
      <section className='w-full min-h-screen p-6 bg-white flex items-center justify-center'>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg">Loading user data...</p>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className='w-full min-h-screen p-6 bg-white flex items-center justify-center'>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading menu items</h2>
          <p className="text-gray-600">{error?.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full min-h-screen p-4 sm:p-6 bg-white'>
      {/* Header */}
      <div className='w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Our Menu</h1>
          <p className='text-gray-600 mt-2'>Discover delicious food options</p>
        </div>
        
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
        >
          <FaFilter className="h-4 w-4" />
          <span>Filters</span>
          {isFilterActive && (
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enhanced Filters Sidebar */}
        {categoriesLoading ? (
          <FilterSkeleton />
        ) : (
          <div className={`lg:w-80 bg-white rounded-2xl p-6 h-fit lg:sticky lg:top-6 transition-all duration-300 shadow-lg border border-gray-200 ${
            isFilterOpen ? 'block animate-slideIn' : 'hidden lg:block'
          }`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <p className="text-sm text-gray-500 mt-1">Refine your search</p>
              </div>
              <div className="flex items-center gap-2">
                {isFilterActive && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg transition duration-200"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition duration-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaSearch className="h-4 w-4 text-yellow-500" />
                Search Items
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search menu items..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Enhanced Categories Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaTag className="h-4 w-4 text-yellow-500" />
                Categories
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group border ${
                    selectedCategory === '' 
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-300 shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">All Categories</span>
                  {selectedCategory === '' && (
                    <FaCheck className="h-4 w-4 text-yellow-600" />
                  )}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.categoryId}
                    onClick={() => handleCategoryChange(category.categoryId)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group border ${
                      selectedCategory === category.categoryId
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-300 shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{category.categoryName}</span>
                    {selectedCategory === category.categoryId && (
                      <FaCheck className="h-4 w-4 text-yellow-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Price Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaRupeeSign className="h-4 w-4 text-yellow-500" />
                Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handlePriceRangeChange(range)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group border ${
                      priceRange.min === range.min && priceRange.max === range.max
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-300 shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{range.label}</span>
                    {(priceRange.min === range.min && priceRange.max === range.max) && (
                      <FaCheck className="h-4 w-4 text-yellow-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Active Filters Info */}
            {isFilterActive && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex items-center gap-2 text-yellow-700">
                  <FaFire className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Filters applied - {allMenuItems.length} items found
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <p className="text-gray-600 text-lg">
                {isLoading ? 'Loading delicious items...' : `${allMenuItems.length} items found`}
              </p>
              {isFilterActive && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Filtered
                </span>
              )}
            </div>
            
            {/* Mobile Filter Close Button */}
            {isFilterOpen && (
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700 bg-white p-2 rounded-lg shadow-sm border border-gray-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Enhanced Menu Items Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <MenuCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allMenuItems.map((item) => (
                  <MenuCard 
                    key={item.itemId}
                    item={item}
                    userId={USER_ID}
                  />
                ))}
              </div>

              {/* Load More Trigger */}
              <div ref={ref} className="flex justify-center mt-12">
                {isFetchingNextPage ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-yellow-500 border-t-transparent"></div>
                    <p className="text-gray-500">Loading more delicious items...</p>
                  </div>
                ) : hasNextPage ? (
                  <p className="text-gray-500 text-lg">Scroll down to discover more items...</p>
                ) : (
                  allMenuItems.length > 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaList className="h-8 w-8 text-yellow-500" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">You've seen all our delicious items!</p>
                    </div>
                  )
                )}
              </div>

              {/* Enhanced Empty State */}
              {allMenuItems.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaList className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {isFilterActive ? 'No items match your filters' : 'No menu items available'}
                  </h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    {isFilterActive 
                      ? 'Try adjusting your filters or search terms to discover more delicious options' 
                      : 'We\'re preparing something special for you. Check back soon for new menu items!'
                    }
                  </p>
                  {isFilterActive && (
                    <button 
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  )
}

export default Page