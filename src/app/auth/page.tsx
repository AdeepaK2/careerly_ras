'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AuthSelectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-[#ffffff] to-purple-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-6 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" className="w-12 h-12" alt="Careerly Logo" />
          <span className="text-purple-600 font-bold">Careerly</span>
        </Link>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="text-purple-600 bg-purple-100 px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-gray-900 font-semibold text-5xl xl:text-6xl mb-4">
              Join <span className="text-purple-600">Careerly</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your account type to start your career journey with us
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Student Section - Left Half */}
            <div className="">
              <div className="p-8 lg:p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  For Students
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  Find internships and job opportunities from top companies. Start building your career today.
                </p>
                
                <div className="space-y-4">
                  <Link 
                    href="/auth/undergrad/login"
                    className="block w-full bg-purple-600 text-white py-4 px-6 rounded-full text-lg font-medium hover:bg-purple-700 transition duration-200"
                  >
                    Student Login
                  </Link>
                  <Link 
                    href="/auth/undergrad/register"
                    className="block w-full bg-white text-purple-600 border-2 border-purple-600 py-4 px-6 rounded-full text-lg font-medium hover:bg-purple-50 transition duration-200"
                  >
                    Student Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Company Section - Right Half */}
            <div className="">
              <div className="p-8 lg:p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  For Companies
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  Post jobs and connect with talented students and graduates. Find your next hire.
                </p>
                
                <div className="space-y-4">
                  <Link 
                    href="/auth/company/login"
                    className="block w-full bg-purple-600 text-white py-4 px-6 rounded-full text-lg font-medium hover:bg-purple-700 transition duration-200"
                  >
                    Company Login
                  </Link>
                  <Link 
                    href="/auth/company/register"
                    className="block w-full bg-white text-purple-600 border-2 border-purple-600 py-4 px-6 rounded-full text-lg font-medium hover:bg-purple-50 transition duration-200"
                  >
                    Company Register
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

