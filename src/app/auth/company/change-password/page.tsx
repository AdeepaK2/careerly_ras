'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPasswordPolicyError } from '@/lib/auth/passwordPolicy';
import PasswordRequirements from '@/components/PasswordRequirements';
import Notice from '@/components/ui/Notice';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from your current password');
      return;
    }

    const policyError = getPasswordPolicyError(formData.newPassword);
    if (policyError) {
      setError(policyError);
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('company_accessToken') : null;
      
      if (!token) {
        router.push('/auth/company/login');
        return;
      }

      const response = await fetch('/api/auth/company/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password updated successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          router.push('/company/profile');
        }, 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                <p className="text-gray-600">Update your account password securely</p>
              </div>
              <div>
                <Link href="/company/profile" className="text-blue-600 hover:text-blue-800 flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <Notice type="success" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Notice>
        )}

        {error && (
          <Notice type="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Notice>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a strong password"
                />
                <PasswordRequirements password={formData.newPassword} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !!getPasswordPolicyError(formData.newPassword)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
