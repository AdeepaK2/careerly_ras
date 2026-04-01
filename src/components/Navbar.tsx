"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  showAuthButtons?: boolean;
}


export default function Navbar({ showAuthButtons = true }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
      const [mounted, setMounted] = useState(false);
  }, [mobileMenuOpen]);
      useEffect(() => {
        setMounted(true);
      }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    // eslint-disable-next-line
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 w-full transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md ' : 'bg-transparent'
    }`}>
      <Link href="/" className="flex items-center space-x-2">
        <img src="/logo.png" className="w-12 h-12" alt="Careerly Logo" />
        <span className="text-purple-600 font-bold">Careerly</span>
      </Link>

      {/* Desktop nav */}
      <nav
        id="menu"
        className="hidden md:flex flex-row gap-8 text-gray-900 text-sm font-normal items-center"
      >
        <Link
          href="/"
          className={`transition duration-200 ${isActive("/") ? "font-bold text-purple-700" : "hover:text-indigo-600"}`}
        >
          Home
        </Link>
        <Link
          href="/contact-us"
          className={`transition duration-200 ${isActive("/contact-us") ? "font-bold text-purple-700" : "hover:text-indigo-600"}`}
        >
          Contact Us
        </Link>
        <Link
          href="/about"
          className={`transition duration-200 ${isActive("/about") ? "font-bold text-purple-700" : "hover:text-indigo-600"}`}
        >
          About
        </Link>
      </nav>

      {/* Mobile nav button (hamburger) */}
      <button
        id="openMenu"
        className="md:hidden text-gray-600"
        aria-label="Open menu"
        onClick={() => setMobileMenuOpen((v) => !v)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {mobileMenuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <nav
          className="fixed inset-0 z-50 bg-white/95 flex flex-col items-center justify-center gap-8 text-lg font-semibold md:hidden transition-all"
          aria-label="Mobile navigation menu"
        >
          <button
            aria-label="Close menu"
            className="absolute top-6 right-6 text-gray-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Link
            href="/"
            className={`transition duration-200 ${isActive("/") ? "font-bold text-purple-700" : "text-gray-400 hover:text-purple-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/contact-us"
            className={`transition duration-200 ${isActive("/contact-us") ? "font-bold text-purple-700" : "text-gray-400 hover:text-purple-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>
          <Link
            href="/about"
            className={`transition duration-200 ${isActive("/about") ? "font-bold text-purple-700" : "text-gray-400 hover:text-purple-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          {/* Auth buttons for mobile */}
          {showAuthButtons ? (
            <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
              <Link
                href="/auth"
                className="w-full text-center bg-purple-600 text-white px-5 py-3 rounded-full text-base font-medium hover:bg-purple-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
              <button
                className="w-full text-purple-600 bg-purple-100 px-5 py-3 rounded-full text-base font-medium hover:bg-purple-200 transition flex items-center justify-center gap-1"
                onClick={() => setShowLoginDropdown((v) => !v)}
                type="button"
              >
                Login
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showLoginDropdown && (
                <div className="bg-white rounded-lg shadow-lg mt-2 border w-full z-10">
                  <Link
                    href="/auth/undergrad/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:rounded-t-lg hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => { setShowLoginDropdown(false); setMobileMenuOpen(false); }}
                  >
                    Undergraduate Login
                  </Link>
                  <Link
                    href="/auth/company/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:rounded-b-lg hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => { setShowLoginDropdown(false); setMobileMenuOpen(false); }}
                  >
                    Company Login
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </nav>
      )}
      
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
      
      
    </header>
  );
}
