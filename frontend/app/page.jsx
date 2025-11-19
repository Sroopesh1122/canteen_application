"use client";

import { useQuery } from '@tanstack/react-query';
import { FaUtensils, FaArrowRight, FaStar, FaClock, FaCheck, FaPlay, FaBolt, FaSeedling, FaWallet } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API function to fetch categories
const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/api/v1/category/public/`);
  return response.data.data.content;
};

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef([]);
  const router = useRouter();

  // TanStack Query for categories
  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  

  useEffect(()=>{
    
    const checkLogin = ()=>{
      const role = localStorage.getItem("role");
      const authToken = localStorage.getItem("authToken");
      
      if(role && authToken)
      {
        if(role ==="ADMIN")
        {
          router.push("/admin")
        }
        else if(role === "CUSTOMER")
        {
          router.push("/user")
        }
      }

    }

    checkLogin();


  },[])

  // Intersection Observer for highlighting centered category
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category-id');
            setActiveCategory(categoryId);
          }
        });
      },
      {
        threshold: 0.6,
        rootMargin: '0px 0px -40% 0px'
      }
    );

    categoryRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      categoryRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [categories]);

  const handleCategoryClick = (categoryId, categoryName) => {
    router.push(`/menu?category=${categoryId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading categories</h2>
          <p className="text-gray-600 mb-4">{error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className={`space-y-6 lg:space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                🎓 Trusted by 2000+ Students
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  <span className="block">Campus</span>
                  <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Canteen
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
                  Where every meal is an experience. Fresh ingredients, bold flavors, 
                  and the perfect fuel for your academic journey.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  { icon: FaBolt, label: "Fast Service", desc: "<15 min" },
                  { icon: FaSeedling, label: "Fresh Ingredients", desc: "Daily" },
                  { icon: FaWallet, label: "Affordable", desc: "Student Prices" }
                ].map((feature, index) => (
                  <div 
                    key={feature.label}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-white font-semibold text-sm sm:text-base">{feature.label}</div>
                    <div className="text-white/60 text-xs sm:text-sm">{feature.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={()=>router.push("/menu")} className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 flex items-center justify-center text-sm sm:text-base">
                  <FaUtensils className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                  Explore Menu
                  <FaArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="group bg-white/10 backdrop-blur-md text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold border border-white/30 hover:bg-white/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-sm sm:text-base">
                  <FaPlay className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
                  Our Story
                </button>
              </div>
            </div>

            {/* Image Section */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Main Image Container */}
              <div className="relative">
                {/* Floating Background Element */}
                <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-3xl blur-3xl -z-10"></div>
                
                {/* Main Image */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl overflow-hidden group">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                      alt="Delicious Campus Food"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 bg-black/50 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-sm sm:text-lg">Today's Special</div>
                        <div className="text-yellow-300 text-xs sm:text-base">Chef's Signature Bowl</div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-400">₹149</div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 bg-white rounded-2xl p-2 sm:p-4 shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">4.9/5</div>
                      <div className="text-slate-600 text-xs sm:text-sm">Rating</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-white rounded-2xl p-2 sm:p-4 shadow-2xl border border-white/20">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaClock className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">12min</div>
                      <div className="text-slate-600 text-xs sm:text-sm">Avg. Wait</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Alternating Layout */}
      {categories.length > 0 && (
        <section id="categories" className="py-12 sm:py-16 lg:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-4">
                🍽️ Our Menu
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Food <span className="text-yellow-600">Categories</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover our diverse range of delicious food categories, each crafted with care and quality ingredients.
              </p>
            </div>

            {/* Alternating Categories Layout */}
            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {categories.map((category, index) => {
                const isEven = index % 2 === 0;
                const isActive = activeCategory === category.categoryId;

                return (
                  <div
                    key={category.categoryId}
                    ref={(el) => (categoryRefs.current[index] = el)}
                    data-category-id={category.categoryId}
                    className={`relative group cursor-pointer transition-all duration-700 ${
                      isActive ? 'scale-105' : 'scale-100'
                    }`}
                    onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}
                  >
                    {/* Background Glow Effect for Active Category */}
                    {isActive && (
                      <div className="absolute inset-0 -m-4 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
                    )}

                    <div className={`flex flex-col ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    } gap-8 lg:gap-12 items-center`}>
                      
                      {/* Image Section */}
                      <div className={`flex-1 relative ${
                        isEven ? 'lg:order-1' : 'lg:order-2'
                      }`}>
                        <div className={`relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 ${
                          isActive 
                            ? 'scale-110 rotate-1 shadow-yellow-500/25' 
                            : 'scale-100 group-hover:scale-105 group-hover:shadow-2xl'
                        }`}>
                          {category.imgUrl ? (
                            <img 
                              src={category.imgUrl} 
                              alt={category.categoryName}
                              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                            />
                          ) : (
                            <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                              <FaUtensils className="h-16 w-16 text-white opacity-80" />
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                          
                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-all duration-500"></div>
                          
                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute top-4 right-4">
                              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                🔥 Popular
                              </div>
                            </div>
                          )}

                          {/* Floating Elements */}
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                              <div className="text-white font-bold text-lg">{category.categoryName}</div>
                              <div className="text-yellow-300 text-sm">Explore Now</div>
                            </div>
                          </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className={`absolute -z-10 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl ${
                          isEven ? '-bottom-8 -left-8' : '-bottom-8 -right-8'
                        }`}></div>
                      </div>

                      {/* Content Section */}
                      <div className={`flex-1 ${
                        isEven ? 'lg:order-2 lg:text-left' : 'lg:order-1 lg:text-right'
                      } text-center lg:text-left`}>
                        <div className={`space-y-4 sm:space-y-6 ${
                          isEven ? 'lg:pr-8' : 'lg:pl-8'
                        }`}>
                          
                          {/* Category Badge */}
                          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                            isActive 
                              ? 'bg-yellow-500 text-white shadow-lg' 
                              : 'bg-white text-slate-700 shadow-md'
                          } transition-all duration-300`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              isActive ? 'bg-white' : 'bg-yellow-500'
                            } animate-pulse`}></div>
                            Category {index + 1}
                          </div>

                          {/* Category Name */}
                          <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold transition-all duration-300 ${
                            isActive 
                              ? 'text-yellow-600 scale-105' 
                              : 'text-slate-900 group-hover:text-yellow-600'
                          }`}>
                            {category.categoryName}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-600 text-lg leading-relaxed">
                            Discover our amazing selection of {category.categoryName.toLowerCase()} items. 
                            Each dish is carefully crafted with fresh ingredients and authentic flavors 
                            to satisfy your cravings.
                          </p>

                          {/* Features */}
                          <div className={`flex flex-wrap gap-2 ${
                            isEven ? 'justify-center lg:justify-start' : 'justify-center lg:justify-end'
                          }`}>
                            {['Fresh Ingredients', 'Daily Specials', 'Customizable', 'Quick Service'].map((feature) => (
                              <span 
                                key={feature}
                                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-yellow-100 hover:text-yellow-700 transition-colors duration-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <button className={`group inline-flex items-center px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform ${
                            isActive
                              ? 'bg-yellow-500 text-white shadow-2xl scale-110'
                              : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105'
                          }`}>
                            <span>Explore {category.categoryName}</span>
                            <FaArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                              isActive ? 'translate-x-1' : 'group-hover:translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Connecting Line (for visual flow) */}
                    {index < categories.length - 1 && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 lg:translate-y-12 w-1 h-16 bg-gradient-to-b from-yellow-400/30 to-transparent"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View All CTA */}
            <div className="text-center mt-16">
              <button 
                onClick={() => router.push('/menu')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-2xl group"
              >
                <span>View Complete Menu</span>
                <FaArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              Why <span className="text-yellow-600">Choose Us</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              We're committed to providing the best campus dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: FaBolt,
                title: "Lightning Fast",
                description: "Get your meals in under 15 minutes. Perfect for busy class schedules.",
                color: "from-yellow-400 to-yellow-600"
              },
              {
                icon: FaSeedling,
                title: "Fresh & Healthy",
                description: "Daily fresh ingredients with nutritional balance in mind.",
                color: "from-green-400 to-green-600"
              },
              {
                icon: FaWallet,
                title: "Student Budget",
                description: "Quality meals at prices that respect your student budget.",
                color: "from-blue-400 to-blue-600"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group text-center p-6 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-slate-200"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to <span className="text-yellow-400">Eat?</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of students who trust us for their daily meals. Download our app or visit us today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <button className="bg-yellow-500 text-slate-900 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-2xl text-sm sm:text-base">
              Download App
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-semibold border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
              Visit Canteen
            </button>
          </div>
        </div>
      </section> */}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}