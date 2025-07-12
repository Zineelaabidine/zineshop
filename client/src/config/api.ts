// API Configuration for ZineShop Frontend

// Get API base URL from environment variables
const getApiBaseUrl = (): string => {
  // In development, Vite exposes environment variables with VITE_ prefix
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    console.warn('VITE_API_URL not found, falling back to localhost:5000');
    return 'http://localhost:5000';
  }
  
  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint builder
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API request options
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// API request wrapper with error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// Specific API methods
export const api = {
  // GET request
  get: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  // POST request
  post: (endpoint: string, data?: any, options: RequestInit = {}) => {
    const isFormData = data instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      headers: isFormData ?
        // For FormData, don't set Content-Type (let browser set it with boundary)
        { 'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '' } :
        options.headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  },
  
  // PUT request
  put: (endpoint: string, data?: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  // DELETE request
  delete: (endpoint: string, options: RequestInit = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
  
  // PATCH request
  patch: (endpoint: string, data?: any, options: RequestInit = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Export for debugging
export const debugApi = () => {
  console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: import.meta.env.MODE,
    allEnvVars: import.meta.env,
  });
};
