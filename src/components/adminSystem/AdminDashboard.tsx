'use client';

import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import AdminSidebar from '@/components/adminSystem/AdminSidebar';
import DashboardTab from '@/components/adminSystem/tabs/DashboardTab';
import UndergraduateUsersTab from '@/components/adminSystem/tabs/UndergraduateUsersTab';
import CompanyUsersTab from '@/components/adminSystem/tabs/CompanyUsersTab';
import AdminUsersTab from '@/components/adminSystem/tabs/AdminUsersTab';
import PendingVerificationsTab from '@/components/adminSystem/tabs/PendingVerificationsTab';
import VerifiedAccountsTab from '@/components/adminSystem/tabs/VerifiedAccountsTab';
import AllJobsTab from '@/components/adminSystem/tabs/AllJobsTab';
import ActiveJobsTab from '@/components/adminSystem/tabs/ActiveJobsTab';
import ExpiredJobsTab from '@/components/adminSystem/tabs/ExpiredJobsTab';
import ReportedJobsTab from '@/components/adminSystem/tabs/ReportedJobsTab';
import UserAnalyticsTab from '@/components/adminSystem/tabs/UserAnalyticsTab';
import JobAnalyticsTab from '@/components/adminSystem/tabs/JobAnalyticsTab';
import SystemAnalyticsTab from '@/components/adminSystem/tabs/SystemAnalyticsTab';
import GeneralSettingsTab from '@/components/adminSystem/tabs/GeneralSettingsTab';
import EmailSettingsTab from '@/components/adminSystem/tabs/EmailSettingsTab';
import SecuritySettingsTab from '@/components/adminSystem/tabs/SecuritySettingsTab';
import ReportsTab from '@/components/adminSystem/tabs/ReportsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'undergraduate-users':
        return <UndergraduateUsersTab />;
      case 'company-users':
        return <CompanyUsersTab />;
      case 'admin-users':
        return <AdminUsersTab />;
      case 'pending-verifications':
        return <PendingVerificationsTab />;
      case 'verified-accounts':
        return <VerifiedAccountsTab />;
      case 'all-jobs':
        return <AllJobsTab />;
      case 'active-jobs':
        return <ActiveJobsTab />;
      case 'expired-jobs':
        return <ExpiredJobsTab />;
      case 'reported-jobs':
        return <ReportedJobsTab />;
      case 'user-analytics':
        return <UserAnalyticsTab />;
      case 'job-analytics':
        return <JobAnalyticsTab />;
      case 'system-analytics':
        return <SystemAnalyticsTab />;
      case 'general-settings':
        return <GeneralSettingsTab />;
      case 'email-settings':
        return <EmailSettingsTab />;
      case 'security-settings':
        return <SecuritySettingsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main Content with dynamic left margin based on sidebar state */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your Careerly platform</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Search className="w-6 h-6" />
                  </button>
                </div>
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="w-6 h-6" />
                  </button>
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
