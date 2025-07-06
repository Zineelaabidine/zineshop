import React from 'react';
import { Smartphone, Headphones, Laptop, Watch, Camera, Gamepad2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  count: number;
}

const Categories: React.FC = () => {
  const categories: Category[] = [
    {
      id: 1,
      name: "Smartphones",
      icon: <Smartphone className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      count: 120
    },
    {
      id: 2,
      name: "Audio",
      icon: <Headphones className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      count: 85
    },
    {
      id: 3,
      name: "Laptops",
      icon: <Laptop className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-500",
      count: 64
    },
    {
      id: 4,
      name: "Wearables",
      icon: <Watch className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      count: 92
    },
    {
      id: 5,
      name: "Cameras",
      icon: <Camera className="w-8 h-8" />,
      gradient: "from-indigo-500 to-purple-500",
      count: 45
    },
    {
      id: 6,
      name: "Gaming",
      icon: <Gamepad2 className="w-8 h-8" />,
      gradient: "from-pink-500 to-rose-500",
      count: 78
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our diverse range of cutting-edge technology products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-700"
            >
              {/* Icon Container */}
              <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  {category.icon}
                </div>
              </div>

              {/* Category Name */}
              <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors duration-200">
                {category.name}
              </h3>

              {/* Product Count */}
              <p className="text-sm text-gray-400">
                {category.count} products
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
          <button className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200">
            Browse All Categories →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;