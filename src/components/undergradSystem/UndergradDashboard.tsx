'use client';

import { useState } from 'react';
//import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/undergradSystem/Navbar';
import HomeTab from '@/components/undergradSystem/tabs/HomeTab';
import JobOpportunitiesTab from '@/components/undergradSystem/tabs/JobOpportunitiesTab';
import SelectedTab from '@/components/undergradSystem/tabs/SelectedTab';
import ProfileTab from '@/components/undergradSystem/tabs/ProfileTab';

export default function UndergradDashboard() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onNavigateToTab={setActiveTab} />;
      case 'jobs':
        return <JobOpportunitiesTab />;
      case 'selected':
        return <SelectedTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab onNavigateToTab={setActiveTab} />;
    }
  };

  return (
  
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto">
          {renderActiveTab()}
        </main>
      </div>
   
  );
}
