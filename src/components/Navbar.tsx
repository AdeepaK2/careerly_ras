"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavbarProps {
  showAuthButtons?: boolean;
}

export default function Navbar({ showAuthButtons = true }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 w-full transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md ' : 'bg-transparent'
    }`}>
      <Link href="/" className="flex items-center space-x-2">
        <img src="/logo.png" className="w-12 h-12" alt="Careerly Logo" />
        <span className="text-purple-600 font-bold">Careerly</span>
      </Link>
      
      <nav
        id="menu"
        className="max-md:absolute max-md:top-0 max-md:left-0 max-md:overflow-hidden items-center justify-center max-md:h-full max-md:w-0 transition-[width] flex-col md:flex-row flex gap-8 text-gray-900 text-sm font-normal"
      >
        <a className="hover:text-indigo-600 transition duration-200" href="#">
          Products
        </a>
        <a className="hover:text-indigo-600 transition duration-200" href="#">
          Customer Stories
        </a>
        <a className="hover:text-indigo-600 transition duration-200" href="#">
          Pricing
        </a>
        <a className="hover:text-indigo-600 transition duration-200" href="#">
          Docs
        </a>
        <button id="closeMenu" className="md:hidden text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </nav>
      
      {showAuthButtons ? (
        <div className="hidden md:flex space-x-4">
          <div className="relative">
            <button
              className="text-purple-600 bg-purple-100 px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition flex items-center gap-1"
              onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            >
              Login
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLoginDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg min-w-[180px] z-10">
                <Link
                  href="/auth/undergrad/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:rounded-t-lg hover:bg-purple-50 hover:text-purple-600"
                  onClick={() => setShowLoginDropdown(false)}
                >
                  Undergraduate Login
                </Link>
                <Link
                  href="/auth/company/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:rounded-b-lg hover:bg-purple-50 hover:text-purple-600"
                  onClick={() => setShowLoginDropdown(false)}
                >
                  Company Login
                </Link>
              </div>
            )}
          </div>
          <Link
            className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition"
            href="/auth"
          >
            Sign up
          </Link>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link
            href="/"
            className="text-purple-600 bg-purple-100 px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition"
          >
            ← Back to Home
          </Link>
        </div>
      )}
      
      <button id="openMenu" className="md:hidden text-gray-600">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}
