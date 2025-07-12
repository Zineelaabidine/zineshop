import React from 'react';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 animate-float">
        <Sparkles className="w-8 h-8 text-blue-400" />
      </div>
      <div className="absolute top-32 right-32 animate-float delay-1000">
        <Zap className="w-6 h-6 text-purple-400" />
      </div>
      <div className="absolute bottom-32 left-32 animate-float delay-500">
        <Globe className="w-10 h-10 text-blue-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
              Shop the
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover cutting-edge products that redefine tomorrow.
            <br className="hidden sm:block" />
            Experience shopping reimagined for the digital age.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1">
              <span className="flex items-center space-x-2">
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-lg hover:border-blue-400 hover:text-blue-400 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                10K+
              </div>
              <div className="text-gray-500 dark:text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-gray-500 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-500 dark:text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;