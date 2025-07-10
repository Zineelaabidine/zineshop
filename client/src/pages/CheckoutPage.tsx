import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/cartUtils';

// Types for checkout
interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  type: 'credit_card' | 'paypal';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.full_name || '',
    phone: '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items.length, navigate]);

  // Fetch delivery methods
  useEffect(() => {
    fetchDeliveryMethods();
  }, []);

  const fetchDeliveryMethods = async () => {
    try {
      const response = await fetch('/api/delivery-methods');
      const data = await response.json();
      
      if (data.success) {
        setDeliveryMethods(data.data);
        // Set default delivery method
        if (data.data.length > 0) {
          setSelectedDeliveryMethod(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch delivery methods:', error);
      // Fallback delivery methods
      setDeliveryMethods([
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: 'Free standard shipping',
          price: 0,
          estimatedDays: '5-7 business days'
        },
        {
          id: 'express',
          name: 'Express Shipping', 
          description: 'Fast delivery',
          price: 9.99,
          estimatedDays: '2-3 business days'
        }
      ]);
      setSelectedDeliveryMethod('standard');
    }
  };

  // Calculate totals
  const selectedDelivery = deliveryMethods.find(d => d.id === selectedDeliveryMethod);
  const shippingCost = selectedDelivery?.price || 0;
  const subtotal = totalPrice;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + taxAmount;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Shipping address validation
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    if (!shippingAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingAddress.email && !emailRegex.test(shippingAddress.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (shippingAddress.phone && !phoneRegex.test(shippingAddress.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Payment validation
    if (paymentMethod.type === 'credit_card') {
      if (!paymentMethod.cardNumber?.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required';
      if (!paymentMethod.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentMethod.cvv) newErrors.cvv = 'CVV is required';
      if (!paymentMethod.cardholderName?.trim()) newErrors.cardholderName = 'Cardholder name is required';
    }

    // Delivery method validation
    if (!selectedDeliveryMethod) newErrors.deliveryMethod = 'Please select a delivery method';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          name: item.name
        })),
        shippingAddress,
        deliveryMethodId: selectedDeliveryMethod,
        paymentMethod: paymentMethod.type,
        subtotal,
        shippingCost,
        taxAmount,
        total: finalTotal,
        orderNotes: orderNotes.trim() || null,
        customerEmail: shippingAddress.email
      };

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart
        clearCart();
        
        // Redirect to success page
        navigate(`/order-confirmation/${result.data.orderId}`, {
          state: { orderData: result.data }
        });
      } else {
        setErrors({ submit: result.message || 'Failed to place order' });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePaymentChange = (field: keyof PaymentMethod, value: string) => {
    setPaymentMethod(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Format card number input
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-100">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.addressLine1 ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Street address, P.O. box, company name"
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-400">{errors.addressLine1}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-400">{errors.state}</p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="ZIP / Postal Code"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <Truck className="w-6 h-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-100">Delivery Method</h2>
                </div>

                <div className="space-y-4">
                  {deliveryMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDeliveryMethod === method.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.id}
                          checked={selectedDeliveryMethod === method.id}
                          onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="text-gray-100 font-medium">{method.name}</div>
                          <div className="text-gray-400 text-sm">{method.description}</div>
                          <div className="text-gray-400 text-sm">{method.estimatedDays}</div>
                        </div>
                      </div>
                      <div className="text-gray-100 font-semibold">
                        {method.price === 0 ? 'Free' : formatPrice(method.price)}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.deliveryMethod && (
                  <p className="mt-2 text-sm text-red-400">{errors.deliveryMethod}</p>
                )}
              </div>

              {/* Payment Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-100">Payment Information</h2>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod.type === 'credit_card'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="credit_card"
                        checked={paymentMethod.type === 'credit_card'}
                        onChange={(e) => setPaymentMethod(prev => ({ ...prev, type: e.target.value as 'credit_card' }))}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <CreditCard className="w-5 h-5 ml-3 mr-2 text-gray-300" />
                      <span className="text-gray-100">Credit Card</span>
                    </label>

                    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod.type === 'paypal'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="paypal"
                        checked={paymentMethod.type === 'paypal'}
                        onChange={(e) => setPaymentMethod(prev => ({ ...prev, type: e.target.value as 'paypal' }))}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <div className="w-5 h-5 ml-3 mr-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        P
                      </div>
                      <span className="text-gray-100">PayPal</span>
                    </label>
                  </div>
                </div>

                {/* Credit Card Form */}
                {paymentMethod.type === 'credit_card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cardholder Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={paymentMethod.cardholderName || ''}
                        onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cardholderName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Name on card"
                      />
                      {errors.cardholderName && (
                        <p className="mt-1 text-sm text-red-400">{errors.cardholderName}</p>
                      )}
                    </div>

                    {/* Card Number */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentMethod.cardNumber || ''}
                        onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={paymentMethod.expiryDate || ''}
                        onChange={(e) => handlePaymentChange('expiryDate', formatExpiryDate(e.target.value))}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.expiryDate}</p>
                      )}
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentMethod.cvv || ''}
                        onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cvv ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* PayPal Message */}
                {paymentMethod.type === 'paypal' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Notes (Optional)</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Special instructions for your order..."
                />
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-100">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-100 font-medium truncate">{item.name}</h4>
                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <p className="text-gray-400 text-xs">
                          {Object.entries(item.variants)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-100 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-100">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 text-sm">{errors.submit}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  form="checkout-form"
                  onClick={handleSubmit}
                  disabled={isLoading || items.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Order</span>
                    </>
                  )}
                </button>

                <p className="text-gray-400 text-xs text-center mt-3">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-green-400 text-sm">Secure SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
