'use client';

import Link from 'next/link';

export default function AuthSelectPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Careerly
          </h1>
          <p className="text-gray-600 mb-8">
            Choose your account type to continue
          </p>
        </div>

        <div className="space-y-4">
          {/* Undergraduate Option */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:border-blue-500 transition duration-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Undergraduate Student</h3>
                  <p className="text-gray-600 text-sm">Find internships and job opportunities</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/auth/undergrad/login"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition duration-200"
                >
                  Student Login
                </Link>
                <Link 
                  href="/auth/undergrad/register"
                  className="block w-full bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-md text-center hover:bg-blue-50 transition duration-200"
                >
                  Student Register
                </Link>
              </div>
            </div>
          </div>

          {/* Employer Option (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 opacity-60">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Employer</h3>
                  <p className="text-gray-600 text-sm">Post jobs and find talented students</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  disabled
                  className="block w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md text-center cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Admin Option (Coming Soon) */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 opacity-60">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Administrator</h3>
                  <p className="text-gray-600 text-sm">Manage platform and users</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  disabled
                  className="block w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md text-center cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Back to Home
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
