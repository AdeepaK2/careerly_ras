
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Send form data to backend or email service
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-stretch justify-center">
          {/* Left: Contact Info */}
          <div className="flex-1 flex flex-col justify-center mb-10 md:mb-0 md:pr-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Contact Us</h1>
            <p className="text-gray-700 text-lg mb-6">We'd love to hear from you! Reach out with any questions, feedback, or partnership opportunities.</p>
            <div className="space-y-4 text-base text-gray-800">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5"/><path d="M21 10.5l-9 6.5-9-6.5"/></svg>
                <span>careerly@rasuom.lk</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5"/><path d="M21 10.5l-9 6.5-9-6.5"/></svg>
                <span>+94 77 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5"/><path d="M21 10.5l-9 6.5-9-6.5"/></svg>
                <span>University of Moratuwa, Katubedda, Sri Lanka</span>
              </div>
            </div>
          </div>
          {/* Right: Contact Form */}
          <div className="flex-1 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-12">
                <svg className="mx-auto mb-4 text-green-500" width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
                <p className="text-gray-600">Your message has been received. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 resize-none"
                    placeholder="Type your message here..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-all shadow-md"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
