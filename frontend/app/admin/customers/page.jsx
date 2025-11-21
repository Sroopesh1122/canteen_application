"use client"

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaSearch,
  FaExclamationTriangle,
  FaUsers,
  FaIdCard
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton Loader Component
const UserCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
            <FaUser className="text-yellow-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="font-mono bg-gray-50 px-2 py-1 rounded">
                ID: {user.userId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <FaIdCard className="text-gray-400 text-sm" />
          <span className="font-medium">User ID</span>
          <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
            {user.userId}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <FaCalendarAlt className="text-gray-400 text-sm" />
          <div>
            <span className="font-medium">Joined</span>
            <div className="text-xs text-gray-500">
              {formatDate(user.createdAt)} at {formatTime(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {user.updatedAt && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
          <span>Last updated: {formatDate(user.updatedAt)}</span>
        </div>
      )}
    </div>
  );
};

// Search Input Component
const SearchInput = ({ value, onChange, isLoading }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users by name or email..."
        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const getUsers = async ({ pageParam = 0 }) => {
    const params = {
      page: pageParam,
      limit: 10,
    };

    if (debouncedSearchQuery) {
      params.q = debouncedSearchQuery;
    }

    const response = await axios.get(`${API_URL}/api/v1/user/secure/`, {
      params,
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
    queryKey: ['customers', debouncedSearchQuery],
    queryFn: getUsers,
    getNextPageParam: (lastPage) => {
      const { data: { last, number } } = lastPage
      return last ? undefined : number + 1
    },
    staleTime: 5 * 60 * 1000,
  });

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

  const allUsers = data?.pages.flatMap(page => page.data.content) || [];
  const totalUsers = data?.pages[0]?.data.totalElements || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="mt-2 text-gray-600">
                Manage and view all customer accounts
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <FaUsers className="text-gray-400" />
                <span>{totalUsers} total users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              isLoading={isLoading && searchQuery !== debouncedSearchQuery}
            />
          </div>
          {debouncedSearchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              {isLoading ? 'Searching...' : `Showing results for "${debouncedSearchQuery}"`}
            </p>
          )}
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {isLoading && searchQuery === debouncedSearchQuery ? (
            // Initial loading skeleton
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <UserCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading users</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                {error?.message || 'Unable to load users. Please check your connection and try again.'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {debouncedSearchQuery ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {debouncedSearchQuery 
                  ? `No users found matching "${debouncedSearchQuery}". Try a different search term.`
                  : 'No customer accounts have been created yet.'
                }
              </p>
              {debouncedSearchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Users Grid */}
              <div className="space-y-6">
                {allUsers.map((user) => (
                  <UserCard key={user.userId} user={user} />
                ))}
              </div>

              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <UserCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* End of list message */}
              {!hasNextPage && allUsers.length > 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="text-gray-400 text-lg" />
                  </div>
                  <p className="text-gray-500 font-medium">All users loaded</p>
                  <p className="text-gray-400 text-sm mt-1">
                    You've reached the end of the users list
                  </p>
                  {debouncedSearchQuery && allUsers.length > 0 && (
                    <p className="text-gray-500 text-sm mt-2">
                      Found {allUsers.length} user{allUsers.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery}"
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Load More Button (Alternative to infinite scroll) */}
        {hasNextPage && !isFetchingNextPage && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchNextPage()}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
            >
              Load More Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;