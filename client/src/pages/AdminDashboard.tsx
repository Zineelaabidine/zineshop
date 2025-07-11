import React, { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminPage from './AdminPage';
import AdminOrdersPage from './AdminOrdersPage';

type AdminSection = 'products' | 'orders' | 'analytics' | 'settings';

const AdminDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('products');

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'products':
        return <AdminProductsContent />;
      case 'orders':
        return <AdminOrdersContent />;
      case 'analytics':
        return <AdminAnalyticsContent />;
      case 'settings':
        return <AdminSettingsContent />;
      default:
        return <AdminProductsContent />;
    }
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderCurrentSection()}
    </AdminLayout>
  );
};

// Content components for each section
const AdminProductsContent: React.FC = () => {
  return <AdminPage />;
};

const AdminOrdersContent: React.FC = () => {
  return <AdminOrdersPage />;
};

const AdminAnalyticsContent: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
      <p className="text-gray-600">Analytics dashboard coming soon...</p>
    </div>
  );
};

const AdminSettingsContent: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
      <p className="text-gray-600">Settings panel coming soon...</p>
    </div>
  );
};

export default AdminDashboard;
