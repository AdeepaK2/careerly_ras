'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { locationData } from '@/data/location';

// Type for location data
type LocationDataType = {
  [province: string]: string[];
};

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const provinces = Object.keys(locationData).sort(); // Sort provinces alphabetically
  
  // Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      // Get cities and sort them alphabetically
      const citiesForProvince = [...((locationData as LocationDataType)[selectedProvince] || [])].sort();
      setCities(citiesForProvince);
    } else {
      setCities([]);
    }
  }, [selectedProvince]);
  
  // Update formData when province or city changes
  useEffect(() => {
    if (selectedProvince || selectedCity) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          province: selectedProvince,
          city: selectedCity
        }
      }));
    }
  }, [selectedProvince, selectedCity]);
  
  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    businessEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: ''
    },
    description: '',
    website: '',
    contactPerson: {
      name: '',
      designation: '',
      email: '',
      phone: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
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

    const currentYear = new Date().getFullYear();
    const foundedYear = parseInt(formData.foundedYear);
    if (foundedYear < 1800 || foundedYear > currentYear) {
      setError('Please enter a valid founded year');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = formData;
      
      // Convert foundedYear to number
      const dataToSubmit = {
        ...submitData,
        foundedYear: foundedYear
      };
      
      const response = await fetch('/api/auth/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();

      if (data.success) {
        // Store access token
        if (typeof window !== 'undefined') {
          localStorage.setItem('company_accessToken', data.data.accessToken);
        }
        
        // Redirect to company dashboard or verification page
        router.push('/company');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Register Your Company
            </h2>
            <p className="mt-2 text-gray-600">
              Join Careerly to connect with talented students
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2  focus:ring-blue-500"
                    placeholder="ABC Technologies Ltd."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PV12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@company.com"
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
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94112345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Technology, Finance, Healthcare, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size *
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2  focus:ring-blue-500"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year *
                  </label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    required
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your company..."
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedCity(''); // reset city when province changes
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedProvince}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00100"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson.name"
                    value={formData.contactPerson.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <input
                    type="text"
                    name="contactPerson.designation"
                    value={formData.contactPerson.designation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HR Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactPerson.email"
                    value={formData.contactPerson.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPerson.phone"
                    value={formData.contactPerson.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94771234567"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
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
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300  text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Link
                href="/auth/company/login"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Already have an account? Login here
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Company Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Navigation to other user types */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-4">
            Are you a student or admin?
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