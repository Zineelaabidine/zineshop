import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye, Package, DollarSign, Users, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  Product,
  Category,
  AdminStats,
  AdminPageState,
  AdminDeleteProductResponse,
  AdminCreateProductResponse,
  AdminUpdateProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  getStatusBadgeClasses,
  getStatusText,
  getStockStatusClasses
} from '../types/admin';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [state, setState] = useState<AdminPageState>({
    products: [],
    categories: [],
    stats: null,
    isLoadingProducts: true,
    isLoadingCategories: true,
    isLoadingStats: true,
    error: null,
    filters: {
      search: '',
      category: 'all',
      status: 'all'
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Product form state
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    image_url: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Edit Product form state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    image_url: ''
  });
  const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});

  // Edit Image upload state
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editIsDragOver, setEditIsDragOver] = useState(false);

  // Filter products based on search and filters
  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(state.filters.search.toLowerCase()));
    const matchesCategory = state.filters.category === 'all' || product.category_name === state.filters.category;

    let matchesStatus = true;
    if (state.filters.status !== 'all') {
      switch (state.filters.status) {
        case 'active':
          matchesStatus = product.stock >= 10;
          break;
        case 'out_of_stock':
          matchesStatus = product.stock === 0;
          break;
        case 'low_stock':
          matchesStatus = product.stock > 0 && product.stock < 10;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // API call functions
  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, isLoadingProducts: true, error: null }));

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          products: data.data.products,
          isLoadingProducts: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.message || 'Failed to fetch products',
          isLoadingProducts: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error while fetching products',
        isLoadingProducts: false
      }));
    }
  };

  const fetchCategories = async () => {
    try {
      setState(prev => ({ ...prev, isLoadingCategories: true }));

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          categories: data.data.categories,
          isLoadingCategories: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.message || 'Failed to fetch categories',
          isLoadingCategories: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error while fetching categories',
        isLoadingCategories: false
      }));
    }
  };

  const fetchStats = async () => {
    try {
      setState(prev => ({ ...prev, isLoadingStats: true }));

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          stats: data.data,
          isLoadingStats: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.message || 'Failed to fetch statistics',
          isLoadingStats: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error while fetching statistics',
        isLoadingStats: false
      }));
    }
  };

  // Form validation function
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      errors.name = 'Product name must be between 2 and 100 characters';
    }

    // Validate category
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }

    // Validate price
    if (formData.price <= 0) {
      errors.price = 'Price must be a positive number';
    }

    // Validate stock
    if (formData.stock < 0 || !Number.isInteger(formData.stock)) {
      errors.stock = 'Stock must be a non-negative integer';
    }

    // Validate description (optional)
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Edit form validation function
  const validateEditForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate name
    if (!editFormData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (editFormData.name.trim().length < 2 || editFormData.name.trim().length > 100) {
      errors.name = 'Product name must be between 2 and 100 characters';
    }

    // Validate category
    if (!editFormData.category_id) {
      errors.category_id = 'Category is required';
    }

    // Validate price
    if (editFormData.price <= 0) {
      errors.price = 'Price must be a positive number';
    }

    // Validate stock
    if (editFormData.stock < 0 || !Number.isInteger(editFormData.stock)) {
      errors.stock = 'Stock must be a non-negative integer';
    }

    // Validate description (optional)
    if (editFormData.description && editFormData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create product function
  const createProduct = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);
      setCreateMessage(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data: AdminCreateProductResponse = await response.json();

      if (data.success && data.data) {
        // Add the new product to local state
        setState(prev => ({
          ...prev,
          products: [data.data!.product, ...prev.products]
        }));

        // Show success message
        setCreateMessage({
          type: 'success',
          text: data.message || 'Product created successfully'
        });

        // Refresh stats to reflect the new product
        fetchStats();

        // Reset form and close modal after a short delay
        setTimeout(() => {
          resetAddForm();
          setShowAddModal(false);
          setCreateMessage(null);
        }, 1500);

      } else {
        setCreateMessage({
          type: 'error',
          text: data.message || 'Failed to create product'
        });
      }
    } catch (error) {
      setCreateMessage({
        type: 'error',
        text: 'Network error while creating product'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Update product function
  const updateProduct = async () => {
    if (!validateEditForm() || !selectedProduct) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      const data: AdminUpdateProductResponse = await response.json();

      if (data.success && data.data) {
        // Update the product in local state
        setState(prev => ({
          ...prev,
          products: prev.products.map(product =>
            product.id === selectedProduct.id ? data.data!.product : product
          )
        }));

        // Show success message
        setUpdateMessage({
          type: 'success',
          text: data.message || 'Product updated successfully'
        });

        // Refresh stats to reflect the updated product
        fetchStats();

        // Reset form and close modal after a short delay
        setTimeout(() => {
          resetEditForm();
          setShowEditModal(false);
          setUpdateMessage(null);
        }, 1500);

      } else {
        setUpdateMessage({
          type: 'error',
          text: data.message || 'Failed to update product'
        });
      }
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Network error while updating product'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      image_url: ''
    });
    setFormErrors({});
    setCreateMessage(null);
    setSelectedImage(null);
    setImagePreview(null);
    setIsDragOver(false);
  };

  // Reset edit form function
  const resetEditForm = () => {
    setEditFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      image_url: ''
    });
    setEditFormErrors({});
    setUpdateMessage(null);
    setEditSelectedImage(null);
    setEditImagePreview(null);
  };

  // Image upload function
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/product-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success && data.data) {
        return data.data.imageUrl;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Image handling functions
  const handleImageSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
      }));
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setFormErrors(prev => ({
        ...prev,
        image: 'Image file size must be less than 10MB'
      }));
      return;
    }

    // Clear any previous image errors
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to Supabase Storage
    try {
      setFormErrors(prev => ({
        ...prev,
        image: 'Uploading image...'
      }));

      const imageUrl = await uploadImage(file);

      if (imageUrl) {
        handleInputChange('image_url', imageUrl);
        // Clear upload message
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    } catch (error) {
      setFormErrors(prev => ({
        ...prev,
        image: 'Failed to upload image. Please try again.'
      }));
      // Reset image state on upload failure
      setSelectedImage(null);
      setImagePreview(null);
      handleInputChange('image_url', '');
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    handleInputChange('image_url', '');
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  // Edit form image handling functions
  const handleEditImageSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setEditFormErrors(prev => ({
        ...prev,
        image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
      }));
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setEditFormErrors(prev => ({
        ...prev,
        image: 'Image file size must be less than 10MB'
      }));
      return;
    }

    // Clear any previous image errors
    setEditFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    setEditSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to Supabase Storage
    try {
      setEditFormErrors(prev => ({
        ...prev,
        image: 'Uploading image...'
      }));

      const imageUrl = await uploadImage(file);

      if (imageUrl) {
        handleEditInputChange('image_url', imageUrl);
        // Clear upload message
        setEditFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    } catch (error) {
      setEditFormErrors(prev => ({
        ...prev,
        image: 'Failed to upload image. Please try again.'
      }));
      // Reset image state on upload failure
      setEditSelectedImage(null);
      setEditImagePreview(null);
      handleEditInputChange('image_url', '');
    }
  };

  const handleEditImageRemove = () => {
    setEditSelectedImage(null);
    setEditImagePreview(null);
    handleEditInputChange('image_url', '');
  };

  const handleEditFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleEditImageSelect(files[0]);
    }
  };

  // Delete product function
  const deleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      setDeleteMessage(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: AdminDeleteProductResponse = await response.json();

      if (data.success) {
        // Remove the product from local state
        setState(prev => ({
          ...prev,
          products: prev.products.filter(product => product.id !== productId)
        }));

        // Show success message
        setDeleteMessage({
          type: 'success',
          text: data.message || 'Product deleted successfully'
        });

        // Refresh stats to reflect the deletion
        fetchStats();

        // Close modal
        setShowDeleteModal(false);
        setProductToDelete(null);

        // Clear success message after 3 seconds
        setTimeout(() => setDeleteMessage(null), 3000);

      } else {
        setDeleteMessage({
          type: 'error',
          text: data.message || 'Failed to delete product'
        });
      }
    } catch (error) {
      setDeleteMessage({
        type: 'error',
        text: 'Network error while deleting product'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, []);

  // Handler functions
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);

    // Populate edit form with product data
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      image_url: product.image_url || ''
    });

    // Set image preview if product has an image
    if (product.image_url) {
      setEditImagePreview(product.image_url);
    } else {
      setEditImagePreview(null);
    }

    // Clear any previous errors and messages
    setEditFormErrors({});
    setUpdateMessage(null);
    setEditSelectedImage(null);

    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
    setDeleteMessage(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setDeleteMessage(null);
  };

  // Form input handlers
  const handleInputChange = (field: keyof CreateProductRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Edit form input handlers
  const handleEditInputChange = (field: keyof UpdateProductRequest, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddModalOpen = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    resetAddForm();
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    resetEditForm();
    setSelectedProduct(null);
  };

  const handleFilterChange = (filterType: keyof typeof state.filters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  const getStatusBadge = (stock: number) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(stock)}`}>
        {getStatusText(stock)}
      </span>
    );
  };

  // Show error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => {
              fetchProducts();
              fetchCategories();
              fetchStats();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your products and inventory</p>
            </div>
            <button
              onClick={handleAddModalOpen}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {deleteMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            deleteMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {deleteMessage.type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">
                  ✓
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              )}
              <span className="font-medium">{deleteMessage.text}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                {state.isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {state.stats?.totalProducts || 0}
                  </p>
                )}
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                {state.isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    ${(state.stats?.totalValue || 0).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                {state.isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-yellow-600">
                    {state.stats?.lowStockProducts || 0}
                  </p>
                )}
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                {state.isLoadingStats ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-red-600">
                    {state.stats?.outOfStockProducts || 0}
                  </p>
                )}
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={state.filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={state.filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                disabled={state.isLoadingCategories}
              >
                <option value="all">All Categories</option>
                {state.categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={state.filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {state.isLoadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  // Hide broken image and show fallback
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center ${
                                product.image_url ? 'hidden' : ''
                              }`}
                            >
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {product.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStockStatusClasses(product.stock)}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!state.isLoadingProducts && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {state.filters.search || state.filters.category !== 'all' || state.filters.status !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first product.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Product</h3>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white ${
                        formErrors.category_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {state.categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.category_id}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white ${
                        formErrors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock || ''}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white ${
                        formErrors.stock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {formErrors.stock && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.stock}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white resize-vertical ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description (optional)"
                  ></textarea>
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload-input')?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-indigo-400 bg-indigo-50'
                        : formErrors.image
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-48 rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageRemove();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedImage?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to change or drag a new image
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                      </div>
                    )}
                  </div>
                  {formErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                  )}
                </div>
              </form>

              {/* Success/Error Messages */}
              {createMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  createMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {createMessage.type === 'success' ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 text-xs">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center mr-2 text-xs">
                        !
                      </div>
                    )}
                    <span className="text-sm font-medium">{createMessage.text}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleAddModalClose}
                disabled={isCreating}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createProduct}
                disabled={isCreating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white ${
                        editFormErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {editFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={editFormData.category_id}
                      onChange={(e) => handleEditInputChange('category_id', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white ${
                        editFormErrors.category_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {state.categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {editFormErrors.category_id && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.category_id}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.price}
                      onChange={(e) => handleEditInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white ${
                        editFormErrors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {editFormErrors.price && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.stock}
                      onChange={(e) => handleEditInputChange('stock', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white ${
                        editFormErrors.stock ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {editFormErrors.stock && (
                      <p className="mt-1 text-sm text-red-600">{editFormErrors.stock}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white resize-vertical ${
                      editFormErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description (optional)"
                  />
                  {editFormErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      editIsDragOver
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                    onClick={() => document.getElementById('edit-file-input')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setEditIsDragOver(true);
                    }}
                    onDragLeave={() => setEditIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setEditIsDragOver(false);
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleEditFileInputChange({ target: { files } } as any);
                      }
                    }}
                  >
                    <input
                      id="edit-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileInputChange}
                      className="hidden"
                    />

                    {editImagePreview ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            className="max-w-full max-h-48 rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditImageRemove();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {editSelectedImage?.name || 'Current image'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to change or drag a new image
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {editIsDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                      </div>
                    )}
                  </div>
                  {editFormErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{editFormErrors.image}</p>
                  )}
                </div>
              </form>

              {/* Success/Error Messages */}
              {updateMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  updateMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {updateMessage.type === 'success' ? (
                      <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 text-xs">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center mr-2 text-xs">
                        !
                      </div>
                    )}
                    <span className="text-sm font-medium">{updateMessage.text}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleEditModalClose}
                disabled={isUpdating}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                disabled={isUpdating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Delete Product</h4>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>"{productToDelete.name}"</strong>?
                This will permanently remove the product from your inventory.
              </p>
              {deleteMessage && deleteMessage.type === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-red-800 text-sm">{deleteMessage.text}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
