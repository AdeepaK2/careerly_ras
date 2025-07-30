'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function HomeTab() {
  const { user } = useAuth();
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

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
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {user && !user.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
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
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {isResending ? 'Sending...' : 'Resend Email'}
            </button>
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
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-blue-100 text-lg">
              Ready to explore new career opportunities?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl">🚀</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">📝</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">🎯</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">🏆</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Offers</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl">📊</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg text-left transition duration-200 group">
            <div className="text-blue-600 text-3xl mb-2 group-hover:scale-110 transition-transform">💼</div>
            <div className="text-blue-700 font-medium">Browse Jobs</div>
            <div className="text-gray-600 text-sm mt-1">Find your dream job</div>
          </button>

          <button className="bg-green-50 hover:bg-green-100 p-6 rounded-lg text-left transition duration-200 group">
            <div className="text-green-600 text-3xl mb-2 group-hover:scale-110 transition-transform">📄</div>
            <div className="text-green-700 font-medium">Upload Resume</div>
            <div className="text-gray-600 text-sm mt-1">Update your CV</div>
          </button>

          <button className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg text-left transition duration-200 group">
            <div className="text-purple-600 text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <div className="text-purple-700 font-medium">View Applications</div>
            <div className="text-gray-600 text-sm mt-1">Track your progress</div>
          </button>

          <button className="bg-orange-50 hover:bg-orange-100 p-6 rounded-lg text-left transition duration-200 group">
            <div className="text-orange-600 text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
            <div className="text-orange-700 font-medium">Career Resources</div>
            <div className="text-gray-600 text-sm mt-1">Tips and guides</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Get Started!</h4>
          <p className="text-gray-500 mb-4">No recent activity yet. Start your career journey today!</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200">
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
