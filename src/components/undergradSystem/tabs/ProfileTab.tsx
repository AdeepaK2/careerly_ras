
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';

interface UserProfile {
  id: string;
  index: string;
  name: string;
  nameWithInitials: string;
  universityEmail: string;
  batch: string;
  education: {
    faculty: string;
    degreeProgramme: string;
  };
  birthdate: string;
  address: string;
  phoneNumber: string;
  profilePicUrl?: string;
  cvUrl?: string;
  resumeUrl?: string;
  skills: string[];
  jobSearchingStatus: 'active' | 'passive' | 'not_searching' | 'employed';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ cv: false, resume: false, profilePic: false });
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  const cvFileRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);
  
  const { makeAuthenticatedRequest } = useAuthenticatedRequest();

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const response = await makeAuthenticatedRequest(url, options);
    return await response.json();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await makeRequest('/api/auth/undergraduate/profile', {
        method: 'GET'
      });

      console.log('Fetched profile response:', response);
      if (response.success) {
        console.log('Profile data received:', response.data.user);
        console.log('Skills in fetched profile:', response.data.user.skills);
        setProfile(response.data.user);
      } else {
        console.error('Failed to fetch profile:', response.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'cv' | 'resume' | 'profilePic') => {
    if (!file) return;

    // Validate file type
    const allowedTypes = type === 'profilePic' 
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type. Please upload ${type === 'profilePic' ? 'an image (JPG, PNG)' : 'a PDF or Word document'}.`);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload a file smaller than 5MB.');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderPath', `users/${profile?.index}/${type}s`);

      const uploadResponse = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        // Update profile with new file URL
        const updateField = type === 'profilePic' ? 'profilePicUrl' : `${type}Url`;
        const updateData = { [updateField]: uploadResult.data.url };

        const response = await makeRequest('/api/auth/undergraduate/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.success) {
          setProfile(response.data.user);
          setImageError(false); // Reset image error when profile updates
          alert(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
        } else {
          console.error('Failed to update profile:', response.message);
          alert('Upload successful but failed to update profile.');
        }
      } else {
        console.error('Upload failed:', uploadResult.message);
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(`/api/file/download?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert('Failed to download file.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file.');
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedProfile({
      name: profile?.name,
      nameWithInitials: profile?.nameWithInitials,
      phoneNumber: profile?.phoneNumber,
      address: profile?.address,
      birthdate: profile?.birthdate,
      jobSearchingStatus: profile?.jobSearchingStatus,
      skills: [...(profile?.skills || [])]
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const saveProfile = async () => {
    setSaving(true);
    console.log('=== SAVE PROFILE DEBUG ===');
    console.log('Saving profile with data:', editedProfile);
    console.log('Skills being sent:', editedProfile.skills);
    
    try {
      const response = await makeRequest('/api/auth/undergraduate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      });

      console.log('Save response:', response);
      console.log('Response success:', response.success);
      
      if (response.success) {
        console.log('Profile updated successfully. New profile data:', response.data.user);
        console.log('Skills in response:', response.data.user.skills);
        setProfile(response.data.user);
        setIsEditing(false);
        setEditedProfile({});
        alert('Profile updated successfully!');
      } else {
        console.error('Failed to update profile:', response.message);
        alert('Failed to update profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const skillToAdd = newSkill.trim();
    console.log('Adding skill:', skillToAdd);
    console.log('Current editedProfile.skills:', editedProfile.skills);
    
    if (skillToAdd) {
      // Check if skill already exists (case insensitive)
      const existingSkills = editedProfile.skills || [];
      const skillExists = existingSkills.some(skill => 
        skill.toLowerCase() === skillToAdd.toLowerCase()
      );
      
      if (skillExists) {
        alert('This skill is already added!');
        return;
      }
      
      setEditedProfile(prev => {
        const newProfile = {
          ...prev,
          skills: [...(prev.skills || []), skillToAdd]
        };
        console.log('New profile after adding skill:', newProfile);
        return newProfile;
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">Failed to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
            <div className="flex gap-2">
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={fetchProfile}
                  className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Refresh
                </button>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('=== CURRENT STATE DEBUG ===');
                    console.log('Current profile:', profile);
                    console.log('Current profile skills:', profile?.skills);
                    console.log('Current editedProfile:', editedProfile);
                    console.log('Current editedProfile skills:', editedProfile.skills);
                  }}
                  className="bg-purple-500 text-white px-3 py-2 rounded-md hover:bg-purple-600 transition-colors text-sm"
                >
                  Debug
                </button>
              )}
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Profile Picture Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              {profile.profilePicUrl && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={`/api/file/image?url=${encodeURIComponent(profile.profilePicUrl)}`}
                    alt="Profile"
                    className={`w-32 h-32 rounded-full object-cover border-4 border-gray-200 ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onLoad={() => setImageLoading(false)}
                    onLoadStart={() => setImageLoading(true)}
                    onError={(e) => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                </>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-gray-500 text-lg font-semibold">
                    {profile.name.charAt(0)}
                  </span>
                </div>
              )}
              <button
                onClick={() => profilePicRef.current?.click()}
                disabled={uploading.profilePic}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading.profilePic ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            </div>
            <input
              ref={profilePicRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'profilePic');
              }}
              className="hidden"
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name with Initials</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.nameWithInitials || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, nameWithInitials: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.nameWithInitials}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Index</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.index}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.universityEmail}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.batch}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.phoneNumber || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedProfile.birthdate ? new Date(editedProfile.birthdate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, birthdate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(profile.birthdate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Searching Status</label>
              {isEditing ? (
                <select
                  value={editedProfile.jobSearchingStatus || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, jobSearchingStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_searching">Not Searching</option>
                  <option value="passive">Passive</option>
                  <option value="active">Active</option>
                  <option value="employed">Employed</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">
                  {profile.jobSearchingStatus.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <textarea
                value={editedProfile.address || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.address}</p>
            )}
          </div>

          {/* Education Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.education.faculty}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Programme</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{profile.education.degreeProgramme}</p>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              {!isEditing && profile.skills && profile.skills.length > 0 && (
                <button
                  onClick={startEditing}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add More Skills
                </button>
              )}
            </div>
            {isEditing ? (
              <div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, Communication, Leadership)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    maxLength={50}
                  />
                  <button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {editedProfile.skills?.length || 0} skill(s) added
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 mb-4 p-2 bg-gray-50 rounded">
                    <strong>Debug:</strong> editedProfile.skills = {JSON.stringify(editedProfile.skills)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {editedProfile.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills?.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
                {(!profile.skills || profile.skills.length === 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-700 text-sm mb-2">
                      💡 <strong>Add your skills to stand out!</strong> Skills help employers find you for relevant opportunities.
                    </p>
                    <button
                      onClick={startEditing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add Skills
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
            
            {/* CV Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum Vitae (CV)</label>
              <div className="flex items-center gap-4">
                {profile.cvUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓ CV uploaded</span>
                    <button
                      onClick={() => handleDownload(profile.cvUrl!, 'CV.pdf')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">No CV uploaded</span>
                )}
                <button
                  onClick={() => cvFileRef.current?.click()}
                  disabled={uploading.cv}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading.cv ? 'Uploading...' : profile.cvUrl ? 'Replace CV' : 'Upload CV'}
                </button>
              </div>
              <input
                ref={cvFileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'cv');
                }}
                className="hidden"
              />
            </div>

            {/* Resume Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
              <div className="flex items-center gap-4">
                {profile.resumeUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓ Resume uploaded</span>
                    <button
                      onClick={() => handleDownload(profile.resumeUrl!, 'Resume.pdf')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">No resume uploaded</span>
                )}
                <button
                  onClick={() => resumeFileRef.current?.click()}
                  disabled={uploading.resume}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading.resume ? 'Uploading...' : profile.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </button>
              </div>
              <input
                ref={resumeFileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'resume');
                }}
                className="hidden"
              />
            </div>

            <p className="text-sm text-gray-500">
              Accepted formats: PDF, DOC, DOCX. Maximum file size: 5MB.
            </p>
          </div>

          {/* Account Status */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                <div className="flex items-center gap-2">
                  {profile.isVerified ? (
                    <>
                      <span className="text-green-600">✓</span>
                      <span className="text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600">✗</span>
                      <span className="text-red-600">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
