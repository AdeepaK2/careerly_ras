'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/undergrad/login');
  };

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'jobs', label: 'Job Opportunities' },
    { id: 'selected', label: 'My Applications' },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              Careerly
            </h1>
            <span className="ml-2 text-sm text-gray-500">Student Portal</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.nameWithInitials}</span>
            </div>
            
            {/* Email Verification Status */}
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user?.isVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.isVerified ? '✅ Email Verified' : '📧 Email Pending'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
