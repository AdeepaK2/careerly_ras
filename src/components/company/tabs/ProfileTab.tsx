'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { locationData } from '@/data/location';

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

export default function ProfileTab() {
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-blue-600 font-medium">Loading profile information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
            <p className="text-sm text-gray-600">Manage your company information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-all duration-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          ) : null}
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center">
            <svg className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isEditing ? (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md bg-gray-50 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Registration number cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size *
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedCity('');
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={!selectedProvince}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="contactPerson.name"
                      value={formData.contactPerson.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      name="contactPerson.designation"
                      value={formData.contactPerson.designation}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactPerson.email"
                      value={formData.contactPerson.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="contactPerson.phone"
                      value={formData.contactPerson.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm flex items-center"
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
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Company Information - View Mode */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Company Name</p>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{user.companyName}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Registration Number</p>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{user.registrationNumber}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Business Email</p>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{user.businessEmail}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Phone Number</p>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{user.phoneNumber}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Industry</p>
                  <p className="mt-1 text-sm text-gray-900">{user.industry}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Company Size</p>
                  <p className="mt-1 text-sm text-gray-900">{user.companySize}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Founded Year</p>
                  <p className="mt-1 text-sm text-gray-900">{user.foundedYear}</p>
                </div>
                <div className="p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  <p className="text-sm font-medium text-gray-600">Website</p>
                  <p className="mt-1 text-sm text-gray-900">
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
                  <div className="md:col-span-2 p-3 hover:bg-blue-50 rounded-md transition-colors duration-300">
                    <p className="text-sm font-medium text-gray-600">Company Description</p>
                    <p className="mt-1 text-sm text-gray-900">{user.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Company Address - View Mode */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {user.address?.street}, {user.address?.city}, {user.address?.province}, {user.address?.postalCode}
                </p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${user.address?.street}, ${user.address?.city}, ${user.address?.province}, ${user.address?.postalCode}`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <span className="mr-1">View on Google Maps</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Person - View Mode */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact Person</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-sm text-gray-900">{user.contactPerson?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Designation</p>
                    <p className="text-sm text-gray-900">{user.contactPerson?.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <a href={`mailto:${user.contactPerson?.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {user.contactPerson?.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <a href={`tel:${user.contactPerson?.phone}`} className="text-sm text-gray-900">
                      {user.contactPerson?.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Link 
                    href="/auth/company/change-password" 
                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-all duration-300"
                  >
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
