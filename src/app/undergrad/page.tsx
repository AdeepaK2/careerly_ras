'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UndergradDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/auth/undergrad/login');
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/undergraduate/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          universityEmail: user?.universityEmail 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResendMessage('Verification email sent successfully! Please check your university email.');
      } else {
        setResendMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Careerly Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user?.nameWithInitials}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Email Verification Banner */}
        {user && !user.isVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Email Verification Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Please verify your university email ({user.universityEmail}) to access all features.
                        Check your inbox for the verification email.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={resendVerificationEmail}
                    disabled={isResending}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              </div>
              {resendMessage && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  resendMessage.includes('successfully') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {resendMessage}
                </div>
              )}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-gray-600">
                  Ready to explore new career opportunities?
                </p>
              </div>
              
              {!user?.isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Email Verification Required
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please verify your email to access all features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Index Number</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.index}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">University Email</label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-900">{user?.universityEmail}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user?.isVerified ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Not Verified
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Batch</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.batch}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Faculty</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.education.faculty}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.education.department}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Degree Programme</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.education.degreeProgramme}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Job Search Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.jobSearchingStatus === 'active' ? 'bg-green-100 text-green-800' :
                      user?.jobSearchingStatus === 'passive' ? 'bg-yellow-100 text-yellow-800' :
                      user?.jobSearchingStatus === 'employed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.jobSearchingStatus?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition duration-200">
                      <div className="text-blue-600 text-sm font-medium">Browse Jobs</div>
                      <div className="text-gray-600 text-xs mt-1">Find your dream job</div>
                    </button>
                    <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-left transition duration-200">
                      <div className="text-green-600 text-sm font-medium">Upload Resume</div>
                      <div className="text-gray-600 text-xs mt-1">Update your CV</div>
                    </button>
                    <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition duration-200">
                      <div className="text-purple-600 text-sm font-medium">View Applications</div>
                      <div className="text-gray-600 text-xs mt-1">Track your progress</div>
                    </button>
                    <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-left transition duration-200">
                      <div className="text-orange-600 text-sm font-medium">Career Resources</div>
                      <div className="text-gray-600 text-xs mt-1">Tips and guides</div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400">Start applying to jobs to see your activity here</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-500">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-500">Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-500">Offers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
