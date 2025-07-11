import React, { useState } from 'react';
import { Package, ShoppingCart, BarChart3, Settings, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: 'products' | 'orders' | 'analytics' | 'settings';
  onSectionChange: (section: 'products' | 'orders' | 'analytics' | 'settings') => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentSection, onSectionChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    {
      id: 'products' as const,
      name: 'Products',
      icon: Package,
      description: 'Manage inventory and product catalog'
    },
    {
      id: 'orders' as const,
      name: 'Orders',
      icon: ShoppingCart,
      description: 'Process and track customer orders'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: BarChart3,
      description: 'View sales and performance metrics'
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Settings,
      description: 'Configure store settings'
    }
  ];

  const currentItem = navigationItems.find(item => item.id === currentSection);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentItem?.name} Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentItem?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className={`
            ${isSidebarOpen ? 'block' : 'hidden'} lg:block
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-64 bg-white lg:bg-transparent
            shadow-xl lg:shadow-none
            pt-20 lg:pt-0
            transition-all duration-300 ease-in-out
          `}>
            <div className="p-6 lg:p-0">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSectionChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                        ${isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
