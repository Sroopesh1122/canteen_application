"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FaPlus, FaEdit, FaTrash, FaImage, FaUpload, FaSearch, FaClock, FaTag, FaRupeeSign, FaList, FaCheck, FaChevronDown } from 'react-icons/fa'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Validation Schema
const menuItemSchema = Yup.object({
  itemName: Yup.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must be less than 100 characters')
    .required('Item name is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  price: Yup.number()
    .min(0, 'Price must be positive')
    .required('Price is required'),
  categoryId: Yup.string()
    .required('Category is required'),
})

// Edit Validation Schema
const editMenuItemSchema = Yup.object({
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  price: Yup.number()
    .min(0, 'Price must be positive')
    .required('Price is required'),
  isAvailable: Yup.boolean()
    .required('Availability is required'),
})

// API function to add menu item
const addMenuItem = async (formData) => {
  const response = await axios.post(`${API_URL}/api/v1/menu-item/secure/add`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    },
  })
  return response.data
}

// API function to update menu item - FIXED
const updateMenuItem = async ({ itemId, formData }) => {
  const response = await axios.put(`${API_URL}/api/v1/menu-item/secure/${itemId}`, formData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    },
  })
  return response.data
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

// API function to fetch menu items with infinite scroll
const fetchMenuItems = async ({ pageParam = 0, queryKey }) => {
  const [_, searchQuery] = queryKey
  const response = await axios.get(`${API_URL}/api/v1/menu-item/public/`, {
    params: {
      page: pageParam,
      limit: 8,
      q: searchQuery || undefined
    }
  })
  return response.data
}

// Custom Select Dropdown Component
const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedOption = options.find(opt => opt.categoryId === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option.categoryId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-left flex items-center justify-between ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
            : 'bg-white border-gray-300 focus:ring-yellow-500 focus:border-transparent hover:border-gray-400 cursor-pointer'
        }`}
      >
        <span className={selectedOption ? 'text-gray-800' : 'text-gray-500'}>
          {selectedOption ? selectedOption.categoryName : placeholder}
        </span>
        <FaChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.categoryId}
              onClick={() => handleSelect(option)}
              className={`px-4 py-3 cursor-pointer transition duration-200 hover:bg-yellow-50 first:rounded-t-xl last:rounded-b-xl ${
                option.categoryId === value 
                  ? 'bg-yellow-100 text-yellow-800 border-l-2 border-l-yellow-500' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {option.categoryName}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Availability Toggle Component
const AvailabilityToggle = ({ value, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        value ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
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

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })

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
    queryKey: ['menuItems', debouncedSearchQuery],
    queryFn: fetchMenuItems,
    getNextPageParam: (lastPage) => {
      const { data: { last, number } } = lastPage
      return last ? undefined : number + 1
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch next page when the last element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all menu items from all pages
  const allMenuItems = data?.pages.flatMap(page => page.data.content) || []

  // TanStack Mutation for adding menu item
  const addMenuItemMutation = useMutation({
    mutationFn: addMenuItem,
    onSuccess: (data) => {
      toast.success('Menu item added successfully!')
      formik.resetForm()
      setImagePreview(null)
      setIsModalOpen(false)
      
      // Invalidate and refetch menu items
      queryClient.invalidateQueries(['menuItems'])
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add menu item'
      toast.error(errorMessage)
    },
  })

  // TanStack Mutation for updating menu item - FIXED
  const updateMenuItemMutation = useMutation({
    mutationFn: updateMenuItem,
    onSuccess: (data) => {
      toast.success('Menu item updated successfully!')
      setEditModalOpen(false)
      setItemToEdit(null)
      
      // Invalidate and refetch menu items
      queryClient.invalidateQueries(['menuItems'])
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update menu item'
      toast.error(errorMessage)
    },
  })

  // Formik form for adding menu item
  const formik = useFormik({
    initialValues: {
      itemName: '',
      description: '',
      price: '',
      categoryId: '',
      img: null,
    },
    validationSchema: menuItemSchema,
    onSubmit: (values) => {
      const formData = new FormData()
      formData.append('itemName', values.itemName)
      formData.append('description', values.description)
      formData.append('price', values.price)
      formData.append('categoryId', values.categoryId)
      if (values.img) {
        formData.append('img', values.img)
      }
      
      addMenuItemMutation.mutate(formData)
    },
  })

  // Formik form for editing menu item
  const editFormik = useFormik({
    initialValues: {
      description: '',
      price: '',
      isAvailable: true,
    },
    validationSchema: editMenuItemSchema,
    onSubmit: (values) => {
      if (!itemToEdit) return
      
      // Create the request body exactly as expected by the backend
      const requestBody = {
        description: values.description,
        price: values.price,
        isAvailable: values.isAvailable
      }
      
      console.log('Sending update request:', requestBody) // For debugging
      
      updateMenuItemMutation.mutate({
        itemId: itemToEdit.itemId,
        formData: requestBody
      })
    },
  })

  // Handle file input change
  const handleFileChange = (file) => {
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      formik.setFieldValue('img', file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileChange(files[0])
    }
  }

  // File input change handler
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileChange(file)
  }

  // Edit item handlers
  const handleEditClick = (item) => {
    setItemToEdit(item)
    editFormik.setValues({
      description: item.description || '',
      price: item.price,
      isAvailable: item.isAvailable
    })
    setEditModalOpen(true)
  }

  // Delete item handlers
  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setDeleteModalOpen(true)
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const resetForm = () => {
    formik.resetForm()
    setImagePreview(null)
    setIsModalOpen(false)
  }

  const resetEditForm = () => {
    setEditModalOpen(false)
    setItemToEdit(null)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
    <section className='w-full min-h-screen p-6 bg-white'>
      {/* Header */}
      <div className='w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Menu Items</h1>
          <p className='text-gray-600 mt-2'>Manage your restaurant menu items</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={addMenuItemMutation.isLoading}
          className='flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg'
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-white"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allMenuItems.map((item) => (
              <div 
                key={item.itemId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 overflow-hidden group"
              >
                {/* Item Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={item.imgUrl} 
                    alt={item.itemName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {formatPrice(item.price)}
                  </div>
                  
                  {/* Availability Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    item.isAvailable 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <FaEdit className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {/* Item Info */}
                <div className="p-5">
                  {/* Item Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {item.itemName}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {item.description || 'No description available'}
                  </p>
                  
                  {/* Category */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaTag className="h-3 w-3 mr-2 text-gray-400" />
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">
                      {item.categoryName}
                    </span>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-center text-gray-500 text-xs">
                    <FaClock className="h-3 w-3 mr-1" />
                    <span>Added: {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Trigger */}
          <div ref={ref} className="flex justify-center mt-8">
            {isFetchingNextPage ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            ) : hasNextPage ? (
              <p className="text-gray-500">Scroll to load more...</p>
            ) : (
              allMenuItems.length > 0 && (
                <p className="text-gray-500">All menu items loaded</p>
              )
            )}
          </div>

          {/* Empty State */}
          {allMenuItems.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <FaList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No menu items found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first menu item'}
              </p>
              {!debouncedSearchQuery && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200"
                >
                  Add First Item
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Add New Menu Item</h2>
              <p className="text-gray-600 text-sm mt-1">Create a new menu item for your restaurant</p>
            </div>

            {/* Modal Body */}
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
              {/* Item Name */}
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  id="itemName"
                  name="itemName"
                  type="text"
                  value={formik.values.itemName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter item name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${
                    formik.touched.itemName && formik.errors.itemName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                  }`}
                  disabled={addMenuItemMutation.isLoading}
                />
                {formik.touched.itemName && formik.errors.itemName && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.itemName}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter item description"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 resize-none ${
                    formik.touched.description && formik.errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                  }`}
                  disabled={addMenuItemMutation.isLoading}
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.description}
                  </div>
                )}
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formik.values.description.length}/500
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRupeeSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${
                        formik.touched.price && formik.errors.price
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                      }`}
                      disabled={addMenuItemMutation.isLoading}
                    />
                  </div>
                  {formik.touched.price && formik.errors.price && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formik.errors.price}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <CustomSelect
                    options={categories}
                    value={formik.values.categoryId}
                    onChange={(value) => formik.setFieldValue('categoryId', value)}
                    placeholder="Select a category"
                    disabled={addMenuItemMutation.isLoading}
                  />
                  {formik.touched.categoryId && formik.errors.categoryId && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formik.errors.categoryId}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload with Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition duration-200 cursor-pointer ${
                    isDragOver
                      ? 'border-yellow-400 bg-yellow-50'
                      : formik.values.img
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-yellow-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="image-upload"
                    disabled={addMenuItemMutation.isLoading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600">Click or drag to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <FaUpload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop an image here, or click to select
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                {formik.values.img && (
                  <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                    <FaImage className="h-4 w-4 mr-1" />
                    Image selected: {formik.values.img.name}
                  </p>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={resetForm}
                disabled={addMenuItemMutation.isPending}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => formik.handleSubmit()}
                disabled={!formik.isValid || addMenuItemMutation.isPending}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {addMenuItemMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FaPlus className="h-4 w-4" />
                    <span>Add Item</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editModalOpen && itemToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Edit Menu Item</h2>
              <p className="text-gray-600 text-sm mt-1">Update {itemToEdit.itemName}</p>
            </div>

            {/* Modal Body */}
            <form onSubmit={editFormik.handleSubmit} className="p-6 space-y-6">
              {/* Item Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={itemToEdit.imgUrl} 
                    alt={itemToEdit.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{itemToEdit.itemName}</h3>
                    <p className="text-sm text-gray-600">{itemToEdit.categoryName}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows="3"
                  value={editFormik.values.description}
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  placeholder="Enter item description"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 resize-none ${
                    editFormik.touched.description && editFormik.errors.description
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                  }`}
                  disabled={updateMenuItemMutation.isLoading}
                />
                {editFormik.touched.description && editFormik.errors.description && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {editFormik.errors.description}
                  </div>
                )}
                <div className="text-right text-xs text-gray-500 mt-1">
                  {editFormik.values.description.length}/500
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRupeeSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormik.values.price}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${
                        editFormik.touched.price && editFormik.errors.price
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                      }`}
                      disabled={updateMenuItemMutation.isLoading}
                    />
                  </div>
                  {editFormik.touched.price && editFormik.errors.price && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {editFormik.errors.price}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <div className="flex items-center space-x-3">
                    <AvailabilityToggle
                      value={editFormik.values.isAvailable}
                      onChange={(value) => editFormik.setFieldValue('isAvailable', value)}
                      disabled={updateMenuItemMutation.isLoading}
                    />
                    <span className={`text-sm font-medium ${
                      editFormik.values.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {editFormik.values.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={resetEditForm}
                disabled={updateMenuItemMutation.isPending}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => editFormik.handleSubmit()}
                disabled={!editFormik.isValid || updateMenuItemMutation.isPending}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {updateMenuItemMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FaEdit className="h-4 w-4" />
                    <span>Update Item</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-red-600">Delete Menu Item</h2>
              <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {itemToDelete && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="h-8 w-8 text-red-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Delete "{itemToDelete.itemName}"?
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this menu item? This action cannot be reversed.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center space-x-4">
                      <img 
                        src={itemToDelete.imgUrl} 
                        alt={itemToDelete.itemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{itemToDelete.itemName}</p>
                        <p className="text-sm text-gray-500">{formatPrice(itemToDelete.price)}</p>
                        <p className="text-xs text-gray-400">{itemToDelete.categoryName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelDelete} // Replace with actual delete function
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-200 font-medium"
              >
                <FaTrash className="h-4 w-4" />
                <span>Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Page