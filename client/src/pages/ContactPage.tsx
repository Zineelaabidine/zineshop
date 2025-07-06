import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "hello@zineshop.com",
      action: "mailto:hello@zineshop.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri from 8am to 6pm",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 24/7",
      action: "#"
    },
    {
      icon: Headphones,
      title: "Support Center",
      description: "Find answers to common questions",
      contact: "Help & FAQ",
      action: "#"
    }
  ];

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Future Street, Tech City, TC 12345",
      phone: "+1 (555) 123-4567",
      email: "sf@zineshop.com"
    },
    {
      city: "New York",
      address: "456 Innovation Ave, NY 10001",
      phone: "+1 (555) 987-6543",
      email: "ny@zineshop.com"
    },
    {
      city: "London",
      address: "789 Digital Lane, London, UK SW1A 1AA",
      phone: "+44 20 7946 0958",
      email: "london@zineshop.com"
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
              Contact Us
            </span>
          </h1>
        </div>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have a question, suggestion, or need support? We're here to help and would love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group text-center"
              >
                <method.icon className="w-10 h-10 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{method.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                <p className="text-blue-400 font-medium">{method.contact}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales Question</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-1"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Company Information */}
          <div className="space-y-8">
            {/* Business Hours */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-100">Business Hours</h3>
              </div>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>9:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* Quick Response */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Quick Response Guarantee</h3>
              <p className="text-gray-300 mb-4">
                We typically respond to all inquiries within 2-4 hours during business hours.
              </p>
              <div className="flex items-center space-x-2 text-blue-400">
                <Globe className="w-5 h-5" />
                <span className="font-medium">24/7 Support Available</span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Emergency Support</h3>
              <p className="text-gray-300 mb-4">
                For urgent technical issues or order problems:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Emergency Hotline: +1 (555) 911-HELP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">urgent@zineshop.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Our Offices</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Visit us at one of our global locations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">{office.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-300">{office.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">{office.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">{office.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">How can I track my order?</h4>
                <p className="text-gray-400">You can track your order using the tracking number sent to your email after purchase.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">What's your return policy?</h4>
                <p className="text-gray-400">We offer a 30-day return policy for all products in original condition.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">Do you ship internationally?</h4>
                <p className="text-gray-400">Yes, we ship to over 50 countries worldwide with various shipping options.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-100 mb-2">How can I become a partner?</h4>
                <p className="text-gray-400">Contact our partnership team at partnerships@zineshop.com for collaboration opportunities.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
