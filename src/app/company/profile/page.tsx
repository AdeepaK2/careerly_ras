'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { locationData } from '@/data/location';

// Custom CSS for animations
const styles = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out forwards',
  },
  slideIn: {
    animation: 'slideIn 0.5s ease-out forwards',
  }
};

// Type for location data
type LocationDataType = {
  [province: string]: string[];
};

// Company user type
interface CompanyUser {
  id: string;
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  phoneNumber: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  description: string;
  website: string;
  logoUrl?: string;
  contactPerson: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  isVerified: boolean;
  isActive: boolean;
  verificationDocuments?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  lastLogin?: Date;
  jobPostingLimits: {
    maxActiveJobs: number;
    currentActiveJobs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const provinces = Object.keys(locationData).sort();

  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    businessEmail: '',
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

  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const citiesForProvince = [...((locationData as LocationDataType)[selectedProvince] || [])].sort();
      setCities(citiesForProvince);
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('company_accessToken') : null;
      
      if (!token) {
        router.push('/auth/company/login');
        return;
      }

      const response = await fetch('/api/auth/company/me', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        
        // Set form data based on user data
        const userData = data.data.user;
        setFormData({
          companyName: userData.companyName,
          registrationNumber: userData.registrationNumber,
          businessEmail: userData.businessEmail,
          phoneNumber: userData.phoneNumber,
          industry: userData.industry,
          companySize: userData.companySize,
          foundedYear: userData.foundedYear.toString(),
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            province: userData.address?.province || '',
            postalCode: userData.address?.postalCode || ''
          },
          description: userData.description || '',
          website: userData.website || '',
          contactPerson: {
            name: userData.contactPerson?.name || '',
            designation: userData.contactPerson?.designation || '',
            email: userData.contactPerson?.email || '',
            phone: userData.contactPerson?.phone || ''
          }
        });

        // Set selected province and city
        setSelectedProvince(userData.address?.province || '');
        setSelectedCity(userData.address?.city || '');
      } else {
        // Try to refresh token or redirect to login
        router.push('/auth/company/login');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to fetch profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('company_accessToken') : null;
      
      if (!token) {
        router.push('/auth/company/login');
        return;
      }

      // Update formData with current province and city
      const updatedFormData = {
        ...formData,
        address: {
          ...formData.address,
          province: selectedProvince,
          city: selectedCity
        },
        foundedYear: parseInt(formData.foundedYear)
      };
      
      const response = await fetch('/api/auth/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updatedFormData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Profile updated successfully!');
        setUser(data.data.user);
        setIsEditing(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        companyName: user.companyName,
        registrationNumber: user.registrationNumber,
        businessEmail: user.businessEmail,
        phoneNumber: user.phoneNumber,
        industry: user.industry,
        companySize: user.companySize,
        foundedYear: user.foundedYear.toString(),
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          province: user.address?.province || '',
          postalCode: user.address?.postalCode || ''
        },
        description: user.description || '',
        website: user.website || '',
        contactPerson: {
          name: user.contactPerson?.name || '',
          designation: user.contactPerson?.designation || '',
          email: user.contactPerson?.email || '',
          phone: user.contactPerson?.phone || ''
        }
      });
      
      // Reset selected province and city
      setSelectedProvince(user.address?.province || '');
      setSelectedCity(user.address?.city || '');
    }
    
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-blue-600 font-medium">Loading profile information...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6 transition-all duration-300 hover:shadow-md">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-600">Manage your company information</p>
              </div>
              <div>
                <Link href="/company" className="text-blue-600 hover:text-blue-800 flex items-center transition-all duration-300 hover:translate-x-[-5px]">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'profile' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Information
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'security' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center animate-fadeIn">
            <svg className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center animate-fadeIn">
            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : null}
            </div>

            {isEditing ? (
            <div className="p-6">
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 hover:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">Registration number cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Email
                      </label>
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">Contact support to change your email</p>
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Company Information - View Mode */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company Name
                    </p>
                    <p className="mt-1 text-md text-gray-900 font-medium">{user.companyName}</p>
                  </div>
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Registration Number
                    </p>
                    <p className="mt-1 text-md text-gray-900 font-medium">{user.registrationNumber}</p>
                  </div>
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Business Email
                    </p>
                    <p className="mt-1 text-md text-gray-900 font-medium">{user.businessEmail}</p>
                  </div>
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone Number
                    </p>
                    <p className="mt-1 text-md text-gray-900 font-medium">{user.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industry</p>
                    <p className="mt-1 text-md text-gray-900">{user.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company Size</p>
                    <p className="mt-1 text-md text-gray-900">{user.companySize}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Founded Year</p>
                    <p className="mt-1 text-md text-gray-900">{user.foundedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Website</p>
                    <p className="mt-1 text-md text-gray-900">
                      {user.website ? (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {user.website}
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </p>
                  </div>
                  {user.description && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Company Description</p>
                      <p className="mt-1 text-md text-gray-900">{user.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Address - View Mode */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Company Address
                </h3>
                
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white md:w-1/3 flex flex-col justify-center items-center">
                      <svg className="w-16 h-16 mb-3 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h4 className="text-lg font-semibold mb-1">Corporate Office</h4>
                      <p className="text-blue-100 text-center">{user.companyName}</p>
                    </div>
                    
                    <div className="p-6 md:w-2/3">
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-500">FULL ADDRESS</p>
                        <p className="text-lg font-medium text-gray-900">{user.address?.street},</p>
                        <p className="text-lg font-medium text-gray-900">{user.address?.city}, {user.address?.province}, {user.address?.postalCode}</p>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 hover:bg-blue-50 transition-colors duration-300">
                          <p className="text-xs font-medium text-gray-500 mb-1">STREET</p>
                          <p className="font-medium text-gray-900">{user.address?.street}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 hover:bg-blue-50 transition-colors duration-300">
                          <p className="text-xs font-medium text-gray-500 mb-1">CITY</p>
                          <p className="font-medium text-gray-900">{user.address?.city}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 hover:bg-blue-50 transition-colors duration-300">
                          <p className="text-xs font-medium text-gray-500 mb-1">POSTAL CODE</p>
                          <p className="font-medium text-gray-900">{user.address?.postalCode}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center">
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${user.address?.street}, ${user.address?.city}, ${user.address?.province}, ${user.address?.postalCode}`)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center group"
                        >
                          <span className="mr-2 transition-transform duration-300 group-hover:translate-x-1">View on Google Maps</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Person - View Mode */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Primary Contact Person
                </h3>
                
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 md:w-1/3 flex flex-col justify-center items-center border-r border-gray-100">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-xl font-bold text-white">
                          {user.contactPerson?.name ? user.contactPerson.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{user.contactPerson?.name}</h4>
                      <p className="text-blue-700 font-medium">{user.contactPerson?.designation}</p>
                    </div>
                    
                    <div className="p-6 md:w-2/3">
                      <div className="space-y-4">
                        <div className="flex items-center transform hover:translate-x-2 transition-transform duration-300">
                          <div className="bg-blue-100 p-2 rounded-full mr-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">EMAIL</p>
                            <a href={`mailto:${user.contactPerson?.email}`} className="text-blue-600 hover:text-blue-800 font-medium">
                              {user.contactPerson?.email}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center transform hover:translate-x-2 transition-transform duration-300">
                          <div className="bg-green-100 p-2 rounded-full mr-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">PHONE</p>
                            <a href={`tel:${user.contactPerson?.phone}`} className="text-gray-900 font-medium">
                              {user.contactPerson?.phone}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center transform hover:translate-x-2 transition-transform duration-300">
                          <div className="bg-purple-100 p-2 rounded-full mr-4">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">POSITION</p>
                            <p className="text-gray-900 font-medium">{user.contactPerson?.designation}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-end">
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group"
                        >
                          <span className="group-hover:underline">Update contact information</span>
                          <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information - View Mode */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Account Information
                </h3>
                
                {/* Account stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-blue-700">Account Status</p>
                      <div className="bg-white p-2 rounded-full">
                        {user.isVerified ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      {user.isVerified ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <span className="mr-1">✓</span> Verified Account
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <span className="mr-1">⚠</span> Verification Pending
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-purple-700">Job Postings</p>
                      <div className="bg-white p-2 rounded-full">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-purple-800">{user.jobPostingLimits.currentActiveJobs}</span>
                      <span className="text-sm text-purple-600 ml-1">/ {user.jobPostingLimits.maxActiveJobs} active jobs</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{width: `${(user.jobPostingLimits.currentActiveJobs / user.jobPostingLimits.maxActiveJobs) * 100}%`}}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-green-700">Account Age</p>
                      <div className="bg-white p-2 rounded-full">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-800">
                      {Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <p className="text-sm text-green-600">
                      Since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-amber-700">Last Updated</p>
                      <div className="bg-white p-2 rounded-full">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-amber-800">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-amber-600">
                      {new Date(user.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verification Status
                    </p>
                    <p className="mt-1 flex items-center">
                      {user.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠ Not Verified
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Account Created
                    </p>
                    <p className="mt-1 text-md text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
        
        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-8 hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Update your account password regularly to keep your account secure</p>
                  </div>
                  <Link 
                    href="/company/change-password" 
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Change Password
                  </Link>
                </div>
              </div>
              
              <div className="hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <button 
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 flex items-center cursor-not-allowed opacity-60"
                    disabled
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
