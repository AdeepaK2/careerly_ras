'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UndergradRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = formData;
      
      const result = await register(submitData);
      
      if (result.success) {
        router.push('/undergrad');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Register as Undergraduate
            </h2>
            <p className="mt-2 text-gray-600">
              Create your student account to access job opportunities
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Index Number *
                </label>
                <input
                  type="text"
                  name="index"
                  value={formData.index}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20CS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Email *
                </label>
                <input
                  type="email"
                  name="universityEmail"
                  value={formData.universityEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@university.edu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name with Initials *
                </label>
                <input
                  type="text"
                  name="nameWithInitials"
                  value={formData.nameWithInitials}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="J. Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch *
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2020"
              />
            </div>

            {/* Education Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Education Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty *
                  </label>
                  <select
                    name="education.faculty"
                    value={formData.education.faculty}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Programme *
                  </label>
                  <select
                    name="education.degreeProgramme"
                    value={formData.education.degreeProgramme}
                    onChange={handleChange}
                    required
                    disabled={!formData.education.faculty}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94771234567"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street, City"
                />
              </div>
            </div>

            {/* Password */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Link
                href="/auth/undergrad/login"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Already have an account? Login here
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Navigation to other user types */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-4">
            Are you an employer or admin?
          </p>
          <div className="space-x-4">
            <Link href="/auth" className="text-blue-600 hover:text-blue-800 text-sm">
              Choose User Type
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
