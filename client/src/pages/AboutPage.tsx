import React from 'react';
import { ArrowLeft, Users, Target, Lightbulb, Award, Globe, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly push the boundaries of technology to bring you the most advanced products and solutions."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is centered around delivering exceptional value and experience to our customers."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "We're building a sustainable future through technology that makes a positive difference worldwide."
    },
    {
      icon: Zap,
      title: "Excellence",
      description: "We maintain the highest standards in everything we do, from product quality to customer service."
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "200+", label: "Products" },
    { number: "15+", label: "Countries" },
    { number: "99.9%", label: "Uptime" }
  ];

  const team = [
    {
      name: "Zine El Aabidine Hamdoun",
      role: "Founder & CEO",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Visionary leader with 10+ years in tech innovation and e-commerce."
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Technology expert specializing in AI and machine learning solutions."
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Design",
      image: "https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Creative director with a passion for user-centered design and innovation."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-12">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="h-6 w-px bg-gray-600"></div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About ZineShop
            </span>
          </h1>
        </div>

        {/* Hero Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-6">
                Pioneering the Future of 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> E-Commerce</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Founded in 2020, ZineShop emerged from a simple vision: to make cutting-edge technology 
                accessible to everyone. We believe that innovation should enhance lives, not complicate them.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Today, we're proud to serve customers worldwide with a curated selection of the most 
                innovative products, backed by exceptional service and a commitment to excellence.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"></div>
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Our team at work"
                className="relative rounded-2xl shadow-2xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700">
            <div className="text-center mb-12">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-100 mb-4">Our Mission</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                To democratize access to innovative technology by curating the world's most advanced 
                products and delivering them with unparalleled service, creating a future where 
                technology enhances every aspect of human life.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
                <value.icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The passionate individuals driving innovation at ZineShop
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-1">{member.name}</h3>
                  <p className="text-blue-400 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Awards Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-3xl p-8 md:p-12 border border-blue-500/20">
            <div className="text-center">
              <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Recognition & Awards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">2023</div>
                  <div className="text-gray-300 font-medium">Best E-commerce Innovation</div>
                  <div className="text-gray-400 text-sm">Tech Excellence Awards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">2022</div>
                  <div className="text-gray-300 font-medium">Customer Choice Award</div>
                  <div className="text-gray-400 text-sm">Digital Commerce Summit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">2021</div>
                  <div className="text-gray-300 font-medium">Startup of the Year</div>
                  <div className="text-gray-400 text-sm">Innovation Hub</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to Experience the Future?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust ZineShop for their technology needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-1"
              >
                Explore Products
              </Link>
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
