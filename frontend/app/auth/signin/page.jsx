"use client"

import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from "react-hot-toast";
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const GOOGLE_URL = process.env.NEXT_PUBLIC_GOOGLE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function for signin using Axios
const signInUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/api/v1/auth/signin`, credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data?.data;
};

const SignIn = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // React Query mutation for signin
  const signInMutation = useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {

      
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
         localStorage.setItem("role", data.role);
      }

      const role = data?.role;
      
      if(role ==="ADMIN")
      {
         router.push('/admin');
      }
      else if (role ==="CUSTOMER" ){
        router.push('/user');
      }
      else{
        router.push("/")
      }
     
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
      // Axios provides error.response for HTTP errors
      const errorMessage = error.response?.data?.error || error.message || 'Sign in failed. Please try again.';
      toast.error(errorMessage)
    },
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      // Use the mutation to handle signin
      signInMutation.mutate(values);
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:max-w-lg">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="ml-4 text-3xl font-bold text-gray-800">Campus Canteen</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome Back!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Sign in to your account to continue your culinary journey
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={signInMutation.isPending}
                    className={`appearance-none block w-full pl-10 pr-4 py-4 border ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                    } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white`}
                    placeholder="Enter your email address"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                </div>
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={signInMutation.isPending}
                    className={`appearance-none block w-full pl-10 pr-12 py-4 border ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
                    } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white`}
                    placeholder="Enter your password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    disabled={signInMutation.isPending}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-end">
              

              <div className="text-sm">
                <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500 transition duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={signInMutation.isPending}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  {signInMutation.isPending ? (
                    <svg className="animate-spin h-6 w-6 text-yellow-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-yellow-200 group-hover:text-yellow-100"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                {signInMutation.isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Sign In */}
            <div>
              <a
                href={GOOGLE_URL}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
            </div>

            {/* Sign up link */}
            <div className="text-center pt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-yellow-600 hover:text-yellow-500 transition duration-200"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://media.istockphoto.com/id/1405357268/photo/apple-and-spinach-fresh-sweet-fruit-salad-with-blueberry-cheese-cottage-and-walnuts-top-view.jpg?s=612x612&w=0&k=20&c=gakLFCyqyWktBM1v_b9gNRSE2QDYbZ5Q1cb2SBwaCd0=")'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-[1px]"></div>
          
          {/* Content on image */}
          <div className="relative z-10 flex flex-col justify-center h-full px-12">
            <div className="max-w-md">
              <h3 className="text-4xl font-bold text-gray-800 mb-6">
                Delicious Food Awaits You
              </h3>
              <p className="text-xl text-gray-700 mb-8">
                Sign in to explore our mouth-watering menu and enjoy exclusive student discounts on your favorite meals.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
                <span className="text-gray-700 text-sm font-medium">
                  Join 10,000+ students enjoying our canteen
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;