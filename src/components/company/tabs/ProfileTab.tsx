"use client";

import React, { useState, useEffect } from "react";

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    companyName: "",
    registrationNumber: "",
    businessEmail: "",
    phoneNumber: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    description: "",
    contactPerson: {
      name: "",
      designation: "",
      email: "",
      phone: ""
    },
    isEmailVerified: false,
    isVerified: false,
    verificationStatus: "pending",
    isActive: true,
    logo: null,
  });

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = typeof window !== "undefined" 
          ? localStorage.getItem("company_accessToken") 
          : null;
          
        if (!token) {
          setError('Authentication token not found');
          return;
        }
        
        const response = await fetch('/api/auth/company/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.data?.user) {
          const userData = result.data.user;
          setCompanyData({
            companyName: userData.companyName || "",
            registrationNumber: userData.registrationNumber || "",
            businessEmail: userData.businessEmail || "",
            phoneNumber: userData.phoneNumber || "",
            industry: userData.industry || "",
            companySize: userData.companySize || "",
            foundedYear: userData.foundedYear?.toString() || "",
            website: userData.website || "",
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              country: "",
              postalCode: ""
            },
            description: userData.description || "",
            contactPerson: userData.contactPerson || {
              name: "",
              designation: "",
              email: "",
              phone: ""
            },
            isEmailVerified: userData.isEmailVerified || false,
            isVerified: userData.isVerified || false,
            verificationStatus: userData.verificationStatus || "pending",
            isActive: userData.isActive || true,
            logo: userData.logoUrl || null,
          });
        } else {
          setError(result.message || 'Failed to fetch company data');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setError('Failed to load company data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("company_accessToken") 
        : null;
        
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Prepare data for API call
      const updateData = {
        companyName: companyData.companyName,
        registrationNumber: companyData.registrationNumber,
        businessEmail: companyData.businessEmail,
        phoneNumber: companyData.phoneNumber,
        industry: companyData.industry,
        companySize: companyData.companySize,
        foundedYear: parseInt(companyData.foundedYear) || 2020,
        website: companyData.website,
        address: companyData.address,
        description: companyData.description,
        contactPerson: companyData.contactPerson,
      };

      const response = await fetch('/api/auth/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditing(false);
        // Optionally refetch data to ensure consistency
        console.log('Profile updated successfully');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8243ff]"></div>
          <span className="ml-3 text-gray-600">Loading company profile...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!isLoading && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Company Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your company information and settings
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#8243ff] to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Profile Form */}
      <div className="glass-effect rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff]/10 to-purple-600/10">
          <h3 className="text-lg font-bold text-gray-900">
            Company Information
          </h3>
        </div>
        <div className="p-6">
          {/* Logo Upload */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#8243ff] to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                {companyData.companyName.charAt(0)}
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-[#8243ff] hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              )}
            </div>
            {isEditing && (
              <button className="text-[#8243ff] hover:text-purple-700 text-sm font-medium">
                Upload Company Logo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.companyName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Registration Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyData.registrationNumber}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      registrationNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.registrationNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Business Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={companyData.businessEmail}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      businessEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.businessEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={companyData.phoneNumber}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.phoneNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Industry
              </label>
              {isEditing ? (
                <select
                  value={companyData.industry}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, industry: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                >
                  <option>Software Development</option>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>E-commerce</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                  <option>Other</option>
                </select>
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.industry}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Size
              </label>
              {isEditing ? (
                <select
                  value={companyData.companySize}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      companySize: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-100 employees</option>
                  <option>101-500 employees</option>
                  <option>500+ employees</option>
                </select>
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.companySize}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Founded Year
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={companyData.foundedYear}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      foundedYear: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.foundedYear}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, website: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <a
                  href={companyData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-3 text-[#8243ff] hover:text-purple-700 font-medium bg-gray-50 px-4 rounded-lg transition-colors"
                >
                  {companyData.website}
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Address
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={companyData.address.street}
                    onChange={(e) =>
                      setCompanyData({ 
                        ...companyData, 
                        address: { ...companyData.address, street: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={companyData.address.city}
                      onChange={(e) =>
                        setCompanyData({ 
                          ...companyData, 
                          address: { ...companyData.address, city: e.target.value }
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={companyData.address.state}
                      onChange={(e) =>
                        setCompanyData({ 
                          ...companyData, 
                          address: { ...companyData.address, state: e.target.value }
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Country"
                      value={companyData.address.country}
                      onChange={(e) =>
                        setCompanyData({ 
                          ...companyData, 
                          address: { ...companyData.address, country: e.target.value }
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={companyData.address.postalCode}
                      onChange={(e) =>
                        setCompanyData({ 
                          ...companyData, 
                          address: { ...companyData.address, postalCode: e.target.value }
                        })
                      }
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {[
                    companyData.address.street,
                    companyData.address.city,
                    companyData.address.state,
                    companyData.address.country,
                    companyData.address.postalCode
                  ].filter(Boolean).join(', ') || 'No address provided'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Description
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={companyData.description}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                />
              ) : (
                <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                  {companyData.description}
                </p>
              )}
            </div>

            {/* Contact Person Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Contact Person Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Person Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.contactPerson.name}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          contactPerson: { ...companyData.contactPerson, name: e.target.value }
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  ) : (
                    <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                      {companyData.contactPerson.name || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Designation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.contactPerson.designation}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          contactPerson: { ...companyData.contactPerson, designation: e.target.value }
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  ) : (
                    <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                      {companyData.contactPerson.designation || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={companyData.contactPerson.email}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          contactPerson: { ...companyData.contactPerson, email: e.target.value }
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  ) : (
                    <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                      {companyData.contactPerson.email || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contact Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={companyData.contactPerson.phone}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          contactPerson: { ...companyData.contactPerson, phone: e.target.value }
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all shadow-sm"
                    />
                  ) : (
                    <p className="py-3 text-gray-900 font-medium bg-gray-50 px-4 rounded-lg">
                      {companyData.contactPerson.phone || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Account Settings */}
      <div className="glass-effect rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff]/10 to-purple-600/10">
          <h3 className="text-lg font-bold text-gray-900">Account Settings</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-500">
                  Receive notifications about new applications and updates
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8243ff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  SMS Notifications
                </h4>
                <p className="text-sm text-gray-500">
                  Receive SMS alerts for urgent matters and deadlines
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8243ff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Analytics Reports
                </h4>
                <p className="text-sm text-gray-500">
                  Weekly reports on job performance and candidate metrics
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8243ff]"></div>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Danger Zone
              </h4>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your company account and all associated data.
                This action cannot be undone.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
