"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState, useRef, useEffect } from 'react'
import { 
  FaUsers, 
  FaShoppingCart, 
  FaUtensils, 
  FaTags,
  FaRupeeSign,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaStar,
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaFire,
  FaImage
} from 'react-icons/fa'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Skeleton Loader Components
const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-7 bg-gray-200 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse shadow-sm">
      <div className="w-32 h-5 bg-gray-200 rounded mb-6"></div>
      <div className="w-full h-64 bg-gray-200 rounded-xl"></div>
    </div>
  )
}

const TopItemsSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="w-48 h-6 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom Dropdown Component
const MonthDropdown = ({ selectedOption, onSelect, isOpen, onToggle, isLoading }) => {
  const dropdownRef = useRef(null);
  
  const options = [
    { value: 6, label: 'Last 6 months' },
    { value: 12, label: 'Last year' },
    { value: 24, label: 'Last 2 years' },
    { value: 48, label: 'Last 4 years' },
    { value: 60, label: 'Last 5 years' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl transition-colors duration-200 shadow-sm ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-gray-300'
        }`}
      >
        <FaCalendarAlt className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {options.find(opt => opt.value === selectedOption)?.label}
        </span>
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-yellow-500 rounded-full animate-spin"></div>
        ) : isOpen ? (
          <FaChevronUp className="text-gray-400 text-xs" />
        ) : (
          <FaChevronDown className="text-gray-400 text-xs" />
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onToggle(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                selectedOption === option.value
                  ? 'bg-yellow-50 text-yellow-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Tooltip for Revenue Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <p className="text-sm text-gray-700">
            Revenue: <span className="font-semibold text-yellow-600">₹{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, change, changeType, subtitle, gradient }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group ${gradient}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>
          <div className="flex items-center space-x-2">
            {change !== undefined && (
              <>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  changeType === 'increase' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {changeType === 'increase' ? (
                    <FaArrowUp className="text-xs" />
                  ) : (
                    <FaArrowDown className="text-xs" />
                  )}
                  <span className="font-semibold">{change}%</span>
                </div>
                <span className="text-sm text-gray-500">{subtitle}</span>
              </>
            )}
            {!change && subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-yellow-600 text-2xl" />
        </div>
      </div>
    </div>
  )
}

// Income Comparison Card
const IncomeComparisonCard = ({ currentMonth, previousMonth }) => {
  const change = previousMonth === 0 ? 100 : ((currentMonth - previousMonth) / previousMonth) * 100;
  const changeType = change >= 0 ? 'increase' : 'decrease';
  const changeText = previousMonth === 0 ? '100' : Math.abs(change).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-yellow-500 via-yellow-500 to-yellow-600 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 rounded-full -ml-12 -mb-12 opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-100 mb-2">Monthly Income</p>
            <p className="text-3xl font-bold mb-3 flex items-center">
              <FaRupeeSign className="text-xl mr-2" />
              {currentMonth.toLocaleString()}
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-yellow-400 bg-opacity-30">
                {changeType === 'increase' ? (
                  <FaArrowUp className="text-green-300 text-xs" />
                ) : (
                  <FaArrowDown className="text-red-300 text-xs" />
                )}
                <span className="font-semibold text-yellow-100">
                  {changeText}% {previousMonth === 0 ? 'growth' : changeType}
                </span>
              </div>
              <span className="text-sm text-yellow-200">from last month</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-yellow-400 bg-opacity-30 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FaWallet className="text-white text-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Revenue Line Graph Component
const RevenueLineGraph = ({ data, isLoading }) => {
  // Transform API data for Recharts
  const chartData = data?.data
    ?.map(item => ({
      month: item.month,
      revenue: item.income,
      // Format month for better display (e.g., "2024-12" -> "Dec '24")
      displayMonth: new Date(item.month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      })
    }))
    ?.reverse() || []; // Reverse to show chronological order

  // Calculate total revenue for the period
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const hasRevenue = totalRevenue > 0;

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-semibold text-yellow-600">₹{totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FaChartLine className="text-yellow-500" />
          <span>{chartData.length} Months</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="displayMonth" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#eab308" 
              strokeWidth={3}
              dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f59e0b' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* No Data State */}
      {!hasRevenue && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChartLine className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-500 text-sm">
            No revenue data available for the selected period
          </p>
        </div>
      )}
    </div>
  );
}

// Top Ordered Items Component
const TopOrderedItems = ({ data, isLoading }) => {
  if (isLoading) {
    return <TopItemsSkeleton />;
  }

  const topItems = data?.data || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <FaFire className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top Ordered Items</h3>
            <p className="text-sm text-gray-500">Most popular menu items</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-full">
          <span className="text-sm font-semibold text-orange-700">
            {topItems.length} Items
          </span>
        </div>
      </div>

      {topItems.length > 0 ? (
        <div className="space-y-4">
          {topItems.map((item, index) => (
            <div 
              key={item.itemId}
              className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all duration-300 group"
            >
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' 
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                  : index === 2
                  ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* Item Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                {item.imgUrl ? (
                  <img 
                    src={item.imgUrl} 
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaImage className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 truncate">{item.itemName}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.categoryName}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                    <p className="text-sm text-gray-500">Price</p>
                  </div>
                </div>
              </div>

              {/* Order Count */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-2 rounded-xl border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{item.totalCount}</p>
                  <p className="text-xs text-green-600 font-medium">Orders</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUtensils className="text-gray-400 text-2xl" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h4>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Your menu items haven't received any orders yet. Start promoting your menu to see popular items here.
          </p>
        </div>
      )}
    </div>
  );
}

// Performance Metrics Card
const PerformanceMetrics = ({ stats }) => {
  const metrics = [
    {
      label: 'Conversion Rate',
      value: '12.5%',
      change: '+2.1%',
      changeType: 'increase',
      icon: FaChartLine,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Avg. Order Value',
      value: `₹${stats?.orders ? Math.round(stats.currentMonthIncome / stats.orders) : 0}`,
      change: '+5.3%',
      changeType: 'increase',
      icon: FaRupeeSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'increase',
      icon: FaStar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-lg ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <FaArrowUp className="text-xs" />
                  ) : (
                    <FaArrowDown className="text-xs" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Page = () => {
  const [monthsOption, setMonthsOption] = useState(12);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Separate queries with individual loading states
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    isError: statsError, 
    error: statsErrorObj 
  } = useQuery({
    queryKey: ["dashboard", "stats1"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/dashboard/public/stats1`);
      return response.data;
    }
  })

  const { 
    data: incomeData, 
    isLoading: incomeLoading, 
    isError: incomeError, 
    error: incomeErrorObj 
  } = useQuery({
    queryKey: ["dashboard", "income", monthsOption],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/dashboard/public/stats/income?months=${monthsOption}`);
      return response.data;
    }
  })

  const { 
    data: topOrdersData, 
    isLoading: topOrdersLoading, 
    isError: topOrdersError 
  } = useQuery({
    queryKey: ["dashboard", "top-orders"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/dashboard/public/stats/top-orders`);
      return response.data;
    }
  })

  const stats = statsData?.data;

  // Check if initial page load is happening (all data loading for first time)
  const isInitialLoading = statsLoading && incomeLoading && topOrdersLoading;
  
  // Individual loading states for better UX
  const isStatsLoading = statsLoading;
  const isIncomeLoading = incomeLoading;
  const isTopOrdersLoading = topOrdersLoading;

  const isError = statsError || incomeError || topOrdersError;
  const error = statsErrorObj || incomeErrorObj;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="w-64 h-8 bg-gray-200 rounded-2xl mb-2"></div>
            <div className="w-96 h-4 bg-gray-200 rounded-2xl"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gray-200 rounded-2xl p-6 animate-pulse h-32"></div>
            <div className="bg-gray-200 rounded-2xl p-6 animate-pulse h-32"></div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartSkeleton />
            <TopItemsSkeleton />
          </div>

          {/* Insights Skeleton */}
          <div className="bg-gray-200 rounded-2xl p-6 animate-pulse h-48"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaChartLine className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error?.message || 'We encountered an issue while loading your dashboard data. Please check your connection and try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Welcome back! Here's what's happening with your business today. 
            <span className="text-yellow-600 font-medium"> Everything looks great! </span>
            🚀
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isStatsLoading ? (
            [...Array(4)].map((_, index) => <StatsCardSkeleton key={index} />)
          ) : (
            <>
              <StatsCard
                title="Total Users"
                value={stats?.users || 0}
                icon={FaUsers}
                subtitle="Registered customers"
              />
              <StatsCard
                title="Menu Items"
                value={stats?.menuItems || 0}
                icon={FaUtensils}
                subtitle="Available dishes"
              />
              <StatsCard
                title="Categories"
                value={stats?.categories || 0}
                icon={FaTags}
                subtitle="Food categories"
              />
              <StatsCard
                title="Total Orders"
                value={stats?.orders || 0}
                icon={FaShoppingCart}
                subtitle="All-time orders"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <IncomeComparisonCard
              currentMonth={stats?.currentMonthIncome || 0}
              previousMonth={stats?.previousMonthIncome || 0}
            />
          </div>
          <PerformanceMetrics stats={stats} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
              <MonthDropdown
                selectedOption={monthsOption}
                onSelect={setMonthsOption}
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                isLoading={isIncomeLoading}
              />
            </div>
            <RevenueLineGraph 
              data={incomeData} 
              isLoading={isIncomeLoading}
            />
          </div>
          
          <TopOrderedItems 
            data={topOrdersData} 
            isLoading={isTopOrdersLoading}
          />
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaChartLine className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Revenue Growth</p>
                <p className="text-sm text-blue-700">
                  Your revenue has {stats?.previousMonthIncome === 0 ? 'started strong' : 'increased significantly'} this month.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUsers className="text-green-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-green-900 mb-1">Customer Base</p>
                <p className="text-sm text-green-700">
                  You have {stats?.users || 0} active customers engaging with your platform.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUtensils className="text-purple-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-1">Menu Diversity</p>
                <p className="text-sm text-purple-700">
                  Your menu offers {stats?.menuItems || 0} items across {stats?.categories || 0} categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page