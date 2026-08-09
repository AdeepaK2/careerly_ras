'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPasswordPolicyError } from '@/lib/auth/passwordPolicy';
import PasswordRequirements from '@/components/PasswordRequirements';
import { getUniversityEmailError } from '@/lib/auth/undergraduate/universityEmail';
import Notice from '@/components/ui/Notice';

export default function UndergradRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Faculty and degree programme data
  const faculties = [
    'Faculty of Architecture',
    'Faculty of Business',
    'Faculty of Engineering',
    'Faculty of Information Technology',
    'Faculty of Medicine'
  ];

  const degreePrograms = {
    'Faculty of Architecture': [
      'Bachelor of Architecture Honours',
      'Bachelor of Landscape Architecture Honours',
      'Bachelor of Design Honours',
      'BSc (Hons) Town & Country Planning',
      'BSc (Hons) Quantity Surveying',
      'BSc (Hons) Facilities Management'
    ],
    'Faculty of Business': [
      'Bachelor of Business Science Honours'
    ],
    'Faculty of Engineering': [
      'BSc Engineering (Hons) Chemical & Process Engineering',
      'BSc Engineering (Hons) Civil Engineering',
      'BSc Engineering (Hons) Computer Science & Engineering',
      'BSc Engineering (Hons) Earth Resources Engineering',
      'BSc Engineering (Hons) Electrical Engineering',
      'BSc Engineering (Hons) Electronic & Telecommunication Engineering',
      'BSc Engineering (Hons) Biomedical Engineering',
      'BSc Engineering (Hons) Material Science & Engineering',
      'BSc Engineering (Hons) Mechanical Engineering',
      'BSc Engineering (Hons) Textile & Apparel Engineering',
      'BSc Engineering (Hons) Transport Management & Logistics Engineering',
      'Bachelor of Design Honours in Fashion Design & Product Development',
      'BSc (Hons) Transport and Logistics Management'
    ],
    'Faculty of Information Technology': [
      'BSc (Hons) Information Technology',
      'BSc (Hons) Information Technology & Management',
      'BSc (Hons) Artificial Intelligence',
      'Bachelor of Information Technology External Degree'
    ],
    'Faculty of Medicine': [
      'Bachelor of Medicine and Bachelor of Surgery'
    ]
  };

  const [formData, setFormData] = useState({
    index: '',
    name: '',
    nameWithInitials: '',
    universityEmail: '',
    password: '',
    confirmPassword: '',
    batch: '',
    education: {
      faculty: '',
      degreeProgramme: ''
    },
    birthdate: '',
    address: '',
    phoneNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('education.')) {
      const field = name.split('.')[1];
      setFormData(prev => {
        const newEducation = {
          ...prev.education,
          [field]: value
        };
        
        // Reset degree programme when faculty changes
        if (field === 'faculty') {
          newEducation.degreeProgramme = '';
        }
        
        return {
          ...prev,
          education: newEducation
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const universityEmailFieldError = formData.universityEmail
    ? getUniversityEmailError(formData.universityEmail)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const universityEmailError = getUniversityEmailError(formData.universityEmail);
    if (universityEmailError) {
      setError(universityEmailError);
      return;
    }
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = getPasswordPolicyError(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword: _confirmPassword, ...submitData } = formData;
      
      const result = await register(submitData);
      
      if (result.success) {
        router.push('/undergrad');
      } else {
        setError(result.message);
      }
    } catch (_error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 28 28">
                  <circle cx="14" cy="9" r="4" strokeWidth="2" />
                  <path
                    d="M5 22c0-3.866 3.582-7 9-7s9 3.134 9 7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Undergraduate Account
              </h2>
              <p className="text-gray-600 mb-8">
                Join our platform to access amazing career opportunities
              </p>
            </div>

            {error && (
              <Notice type="error" className="mb-6" onClose={() => setError('')}>
                {error}
              </Notice>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Index Number *
                  </label>
                  <input
                    type="text"
                    name="index"
                    value={formData.index}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="e.g., 20CS001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    University Email *
                  </label>
                  <input
                    type="email"
                    name="universityEmail"
                    value={formData.universityEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="you@university.edu"
                  />
                  {universityEmailFieldError && (
                    <p className="mt-1 text-xs text-red-600" aria-live="polite">
                      {universityEmailFieldError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name with Initials *
                  </label>
                  <input
                    type="text"
                    name="nameWithInitials"
                    value={formData.nameWithInitials}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="J. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch *
                </label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., 2020"
                />
              </div>

              {/* Education Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty *
                    </label>
                    <select
                      name="education.faculty"
                      value={formData.education.faculty}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Degree Programme *
                    </label>
                    <select
                      name="education.degreeProgramme"
                      value={formData.education.degreeProgramme}
                      onChange={handleChange}
                      required
                      disabled={!formData.education.faculty}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                    >
                      <option value="">
                        {formData.education.faculty ? 'Select Degree Programme' : 'Select Faculty First'}
                      </option>
                      {formData.education.faculty && degreePrograms[formData.education.faculty as keyof typeof degreePrograms]?.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Birth Date *
                    </label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                      placeholder="+94771234567"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    placeholder="123 Main Street, City"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <PasswordRequirements password={formData.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/undergrad/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Quick Access */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">
              Not a student?
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/auth/company/register" 
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 text-center font-medium"
              >
                Company Registration
              </Link>
              <Link 
                href="/auth" 
                className="flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition duration-200 text-center font-medium"
              >
                All Options
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
