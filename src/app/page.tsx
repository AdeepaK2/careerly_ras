"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect to their dashboard
      router.push("/undergrad");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-[#ffffff] to-purple-100">
      <Navbar />
      <main className="flex flex-col md:flex-row items-center max-md:text-center justify-between mt-16 pb-16 px-6 sm:px-10 md:px-24 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-gray-900 font-semibold text-5xl xl:text-7xl max-w-2xl leading-none">
            Welcome to <br />
            <span className="text-purple-600">Careerly</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-md text-sm sm:text-lg leading-relaxed">
            Your gateway to career opportunities. Connect with top employers and
            find your dream job.
          </p>
          <div className="flex flex-col md:flex-row items-center mt-8 gap-3">
            <a
              className="bg-purple-600 text-white px-6 pr-2.5 py-2.5 rounded-full text-md font-medium flex items-center space-x-2 hover:bg-purple-700 transition"
              href="/auth"
            >
              <span>Get Started</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.821 11.999h13.43m0 0-6.714-6.715m6.715 6.715-6.715 6.715"
                  stroke="#fff"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
        <div
          aria-label="Photos of leaders"
          className="mt-12 grid grid-cols-2 gap-6 pb-6"
        >
          <img
            alt=""
            className="w-54 h-66 rounded-lg hover:scale-105 transition duration-300 object-cover flex-shrink-0 shadow-lg"
            height="140"
            src="image1.png"
            width="120"
          />
          <img
            alt=""
            className="w-54 h-66 rounded-lg hover:scale-105 transition duration-300 object-cover flex-shrink-0 shadow-lg"
            height="140"
            src="image2.jpg"
            width="120"
          />
          <img
            alt=""
            className="w-54 h-66 rounded-lg hover:scale-105 transition duration-300 object-cover flex-shrink-0 shadow-lg"
            height="140"
            src="image3.png"
            width="120"
          />
          <img
            alt=""
            className="w-54 h-66 rounded-lg hover:scale-105 transition duration-300 object-cover flex-shrink-0 shadow-lg"
            height="140"
            src="image4.jpg"
            width="120"
          />
        </div>
      </main>

      <div className="container mx-auto px-4 py-16 mt-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Why Choose <span className="text-purple-600">Careerly</span>?
        </h2>
        <p className="text-center text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
          Careerly is designed to connect students with top employers, providing
          a platform for internships, part-time jobs, and graduate
          opportunities.
        </p>
        <div className="flex flex-col lg:flex-row items-center justify-center">
          <img
            className="2xl:max-w-2xl xl:max-w-xl md:max-w-xl max-w-2xl w-full px-20 py-10"
            src="features.png"
            alt=""
          />
          <div className="space-y-10 px-4 md:px-0">
            <div className="flex items-center justify-center gap-6 max-w-md">
              <div className="p-6 aspect-square bg-violet-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="14"
                    cy="9"
                    r="4"
                    stroke="#7F22FE"
                    strokeWidth="2"
                  />
                  <path
                    d="M5 22c0-3.866 3.582-7 9-7s9 3.134 9 7"
                    stroke="#7F22FE"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  For Students
                </h3>
                <p className="text-sm text-slate-600">
                  Find internships, part-time jobs, and graduate opportunities
                  from top companies.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 max-w-md">
              <div className="p-6 aspect-square bg-violet-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="5"
                    y="4"
                    width="18"
                    height="20"
                    rx="2"
                    stroke="#7F22FE"
                    strokeWidth="2"
                  />
                  <rect x="9" y="8" width="3" height="3" fill="#7F22FE" />
                  <rect x="16" y="8" width="3" height="3" fill="#7F22FE" />
                  <rect x="9" y="13" width="3" height="3" fill="#7F22FE" />
                  <rect x="16" y="13" width="3" height="3" fill="#7F22FE" />
                  <rect x="12" y="18" width="4" height="6" fill="#7F22FE" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  For Employers
                </h3>
                <p className="text-sm text-slate-600">
                  Connect with talented students and recent graduates. Post jobs
                  and find the perfect candidates.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 max-w-md">
              <div className="p-6 aspect-square bg-violet-100 rounded-full">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="#7F22FE"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M9.5 14.5l3 3 6-6"
                    stroke="#7F22FE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-700">
                  Verified Platform
                </h3>
                <p className="text-sm text-slate-600">
                  All users are verified through university email addresses
                  ensuring authenticity and trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}

      {/* CTA Section */}

      <div className="md:px-16">
        <div className="max-w-6xl py-16 md:w-full mx-2 md:mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#5524B7] to-[#380B60] rounded-2xl p-10 text-white">
          <h1 className="text-4xl md:text-5xl md:leading-[50px] font-semibold max-w-xl mt-5 bg-gradient-to-r from-white to-[#CAABFF] text-transparent bg-clip-text">
            Ready to Start Your Career Journey?
          </h1>
          <Link
            href="/auth"
            className="px-8 py-3 text-white bg-purple-600 hover:bg-purple-700 transition-all rounded-full uppercase text-sm mt-8"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
