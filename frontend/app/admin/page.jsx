"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
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
  FaWallet
} from 'react-icons/fa'

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

// Line Graph Component
const RevenueLineGraph = ({ data }) => {
  // Mock data for the line graph - in a real app, this would come from your API
  const monthlyData = [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: data?.previousMonthIncome || 0 },
    { month: 'Jul', revenue: data?.currentMonthIncome || 0 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue)) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FaChartLine className="text-yellow-500" />
          <span>Last 7 Months</span>
        </div>
      </div>
      
      <div className="relative h-64">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100"></div>
          ))}
        </div>
        
        {/* Line Chart */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {monthlyData.map((point, index) => {
            const height = (point.revenue / maxRevenue) * 140;
            const isCurrent = point.revenue === data?.currentMonthIncome;
            
            return (
              <div key={point.month} className="flex flex-col items-center space-y-2">
                {/* Data Point */}
                <div className="relative">
                  <div 
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      isCurrent ? 'bg-yellow-500 ring-4 ring-yellow-200' : 'bg-yellow-400'
                    }`}
                  ></div>
                  
                  {/* Connecting Line */}
                  {index < monthlyData.length - 1 && (
                    <div 
                      className="absolute top-1 left-2 w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500"
                      style={{
                        transform: `scaleX(${point.revenue > 0 ? 1 : 0})`
                      }}
                    ></div>
                  )}
                </div>
                
                {/* Value Label */}
                {point.revenue > 0 && (
                  <div className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-500 ${
                    isCurrent 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    ₹{point.revenue}
                  </div>
                )}
                
                {/* Month Label */}
                <div className={`text-xs font-medium transition-colors duration-300 ${
                  isCurrent ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {point.month}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Growth Indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full">
            <FaChartLine className="text-green-600 text-xs" />
            <span className="text-xs font-semibold text-green-700">
              {data?.previousMonthIncome === 0 ? 'New' : 'Growing'}
            </span>
          </div>
        </div>
      </div>
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
  const { data: statsData, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "stats1"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/v1/dashboard/public/stats1`);
      return response.data;
    }
  })

  const stats = statsData?.data;

  if (isLoading) {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueLineGraph data={stats} />
          
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
    </div>
  )
}

export default Page