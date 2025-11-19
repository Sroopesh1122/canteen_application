"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaTrash, FaImage, FaUpload, FaSearch, FaClock, FaTag } from 'react-icons/fa'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Validation Schema
const categorySchema = Yup.object({
  categoryName: Yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters')
    .required('Category name is required'),
})

// API function to add category
const addCategory = async (formData) => {
  const response = await axios.post(`${API_URL}/api/v1/category/secure/add`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    },
  })
  return response.data
}

// API function to delete category
const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`${API_URL}/api/v1/category/secure/${categoryId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("authToken")}`
    }
  })
  return response.data
}

// API function to fetch categories with infinite scroll
const fetchCategories = async ({ pageParam = 0, queryKey }) => {
  const [_, searchQuery] = queryKey
  const response = await axios.get(`${API_URL}/api/v1/category/public/`, {
    params: {
      page: pageParam,
      limit: 2,
      q: searchQuery || undefined
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

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  // Infinite query for categories
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
    queryKey: ['categories', debouncedSearchQuery],
    queryFn: fetchCategories,
    getNextPageParam: (lastPage) => {
      const { data: { last, number } } = lastPage
      return last ? undefined : number + 1
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch next page when the last element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all categories from all pages
  const allCategories = data?.pages.flatMap(page => page.data.content) || []

  // TanStack Mutation for adding category
  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (data) => {
      toast.success('Category added successfully!')
      formik.resetForm()
      setImagePreview(null)
      setIsModalOpen(false)
      
      // Invalidate and refetch categories
      queryClient.invalidateQueries(['categories'])
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add category'
      toast.error(errorMessage)
    },
  })

  // TanStack Mutation for deleting category
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted successfully!')
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      queryClient.invalidateQueries(['categories'])
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete category'
      toast.error(errorMessage)
    },
  })

  // Formik form
  const formik = useFormik({
    initialValues: {
      categoryName: '',
      img: null,
    },
    validationSchema: categorySchema,
    onSubmit: (values) => {
      const formData = new FormData()
      formData.append('categoryName', values.categoryName)
      if (values.img) {
        formData.append('img', values.img)
      }
      
      addCategoryMutation.mutate(formData)
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

  // Delete category handlers
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.categoryId)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  const resetForm = () => {
    formik.resetForm()
    setImagePreview(null)
    setIsModalOpen(false)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
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
      <section className='w-full min-h-screen p-6 bg-gray-50 flex items-center justify-center'>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading categories</h2>
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
          <h1 className='text-3xl font-bold text-gray-800'>Menu Categories</h1>
          <p className='text-gray-600 mt-2'>Manage your food categories and menu items</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={addCategoryMutation.isLoading}
          className='flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg'
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New Category</span>
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
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-white"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCategories.map((category) => (
              <div 
                key={category.categoryId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 overflow-hidden group"
              >
                {/* Category Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={category.imgUrl} 
                    alt={category.categoryName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteClick(category)}
                    disabled={deleteCategoryMutation.isPending}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:scale-100"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Category Info */}
                <div className="p-5">
                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {category.categoryName}
                  </h3>
                  
                  {/* Slug */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaTag className="h-3 w-3 mr-2 text-gray-400" />
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">
                      {category.slugName}
                    </span>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-center text-gray-500 text-xs">
                    <FaClock className="h-3 w-3 mr-1" />
                    <span>Created: {formatDate(category.createdAt)}</span>
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
              allCategories.length > 0 && (
                <p className="text-gray-500">All categories loaded</p>
              )
            )}
          </div>

          {/* Empty State */}
          {allCategories.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <FaImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
              </p>
              {!debouncedSearchQuery && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-200"
                >
                  Create First Category
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Add New Category</h2>
              <p className="text-gray-600 text-sm mt-1">Create a new menu category</p>
            </div>

            {/* Modal Body */}
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  id="categoryName"
                  name="categoryName"
                  type="text"
                  value={formik.values.categoryName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter category name"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-200 ${
                    formik.touched.categoryName && formik.errors.categoryName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-yellow-500 focus:border-transparent'
                  }`}
                  disabled={addCategoryMutation.isLoading}
                />
                {formik.touched.categoryName && formik.errors.categoryName && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.categoryName}
                  </div>
                )}
              </div>

              {/* Image Upload with Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
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
                    disabled={addCategoryMutation.isLoading}
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
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                disabled={addCategoryMutation.isPending}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => formik.handleSubmit()}
                disabled={!formik.isValid || addCategoryMutation.isPending}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {addCategoryMutation.isPending ? (
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
                    <span>Add Category</span>
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
              <h2 className="text-2xl font-bold text-red-600">Delete Category</h2>
              <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {categoryToDelete && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="h-8 w-8 text-red-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Delete "{categoryToDelete.categoryName}"?
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this category? All items associated with this category will be affected.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center space-x-4">
                      <img 
                        src={categoryToDelete.imgUrl} 
                        alt={categoryToDelete.categoryName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{categoryToDelete.categoryName}</p>
                        <p className="text-sm text-gray-500">{categoryToDelete.slugName}</p>
                        <p className="text-xs text-gray-400">
                          Created: {formatDate(categoryToDelete.createdAt)}
                        </p>
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
                disabled={deleteCategoryMutation.isPending}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteCategoryMutation.isPending}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {deleteCategoryMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="h-4 w-4" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Page