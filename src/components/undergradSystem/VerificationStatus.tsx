'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  FileText, 
  MessageSquare,
  Info,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import VerificationDebug from '@/components/debug/VerificationDebug';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedRequest } from '@/hooks/useAuthenticatedRequest';

interface VerificationData {
  student: {
    id: string;
    name: string;
    universityEmail: string;
    index: string;
    faculty: string;
    degreeProgramme: string;
    batch: string;
    isVerified: boolean;
    verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
    verificationPriority: 'low' | 'medium' | 'high';
    verificationRequestedAt: string;
    verifiedAt?: string;
    daysSinceRequest: number;
  };
  verification: {
    status: string;
    canSubmitDocuments: boolean;
    requiredDocuments: Array<{
      type: string;
      name: string;
      required: boolean;
      submitted: boolean;
      submittedDoc?: any;
    }>;
    submittedDocuments: number;
    requiredDocumentsCount: number;
    notes: Array<{
      note: string;
      addedAt: string;
      isFromAdmin: boolean;
    }>;
  };
  nextSteps: string[];
}

interface UndergraduateVerificationStatusProps {
  onVerificationUpdate?: () => void;
}

export default function UndergraduateVerificationStatus({ onVerificationUpdate }: UndergraduateVerificationStatusProps) {
  const { user } = useAuth();
  const { makeAuthenticatedRequest } = useAuthenticatedRequest();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        console.error('User not authenticated');
        alert('Please log in to view verification status');
        return;
      }

      console.log('Fetching undergraduate verification status...');
      const response = await makeAuthenticatedRequest('/api/undergraduate/verification');
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setVerificationData(data.data);
        console.log('Verification data loaded successfully');
      } else {
        console.error('Failed to fetch verification status:', data.message);
        alert('Failed to load verification status: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      if ((error as Error).message.includes('Authentication failed')) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Network error: Failed to load verification status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!uploadFile || !selectedDocType) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (uploadFile.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(uploadFile.type)) {
      alert('Please upload a valid file type (PDF, JPG, PNG, DOC, DOCX)');
      return;
    }

    try {
      setUploading(true);
      console.log('Starting file upload...', { name: uploadFile.name, size: uploadFile.size, type: uploadFile.type });
      
      // Upload file to cloud storage (R2) first
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folderPath', 'verification-documents/undergraduates');
      
      const uploadResponse = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);
      
      if (!uploadData.success) {
        alert('Failed to upload file: ' + uploadData.message);
        return;
      }

      console.log('File uploaded successfully, submitting to verification API...');

      // Now submit the document metadata to verification API
      const documentData = {
        name: uploadFile.name,
        type: selectedDocType,
        url: uploadData.data.url, // Cloud storage URL
        size: uploadFile.size,
        isRequired: verificationData?.verification.requiredDocuments.find(doc => doc.type === selectedDocType)?.required || false
      };

      const response = await makeAuthenticatedRequest('/api/undergraduate/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit_documents',
          documents: [documentData]
        })
      });

      const data = await response.json();
      console.log('Verification API response:', data);
      
      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedDocType('');
        await fetchVerificationStatus();
        if (onVerificationUpdate) onVerificationUpdate();
        alert('Document uploaded successfully!');
      } else {
        alert('Failed to submit document: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await makeAuthenticatedRequest('/api/undergraduate/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_message',
          message: newMessage.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowMessageModal(false);
        setNewMessage('');
        await fetchVerificationStatus();
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleRequestVerification = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/undergraduate/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'request_verification'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVerificationStatus();
        if (onVerificationUpdate) onVerificationUpdate();
        alert('Verification request submitted successfully!');
      } else {
        alert('Failed to submit verification request: ' + data.message);
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      alert('Failed to submit verification request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'under_review':
        return 'bg-blue-50 border-blue-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Unable to load verification status</p>
            <p className="text-sm text-gray-600 mb-4">There was an issue loading your verification information.</p>
            <button
              onClick={fetchVerificationStatus}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
        <VerificationDebug userType="undergraduate" />
      </div>
    );
  }

  const { student, verification, nextSteps } = verificationData;

  return (
    <div className="space-y-6 mt-5">
      {/* Status Overview */}
      <div className={`rounded-lg border-2 p-6 ${getStatusColor(student.verificationStatus)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(student.verificationStatus)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verification Status: {student.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() + student.verificationStatus.replace('_', ' ').slice(1)}
              </h3>
              <p className="text-sm text-gray-600">
                Requested {student.daysSinceRequest} days ago • Priority: {student.verificationPriority.charAt(0).toUpperCase() + student.verificationPriority.slice(1)}
              </p>
              <p className="text-sm text-gray-600">
                {student.faculty} • {student.degreeProgramme} • Batch {student.batch}
              </p>
              {student.verifiedAt && (
                <p className="text-sm text-green-600">
                  Verified on {formatDate(student.verifiedAt)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={fetchVerificationStatus}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            title="Refresh Status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Documents: {verification.submittedDocuments}/{verification.requiredDocumentsCount} required</span>
            <span>{Math.round((verification.submittedDocuments / verification.requiredDocumentsCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((verification.submittedDocuments / verification.requiredDocumentsCount) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {verification.canSubmitDocuments && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </button>
          {student.verificationStatus === 'pending' && verification.submittedDocuments >= verification.requiredDocumentsCount && (
            <button
              onClick={handleRequestVerification}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Submit for Review
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h4>
          <div className="space-y-3">
            {verification.requiredDocuments.map((doc) => (
              <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className={`h-5 w-5 ${doc.submitted ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {doc.submitted ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h4>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Communication History */}
      {verification.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Communication History</h4>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {verification.notes.map((note, index) => (
              <div key={index} className={`p-4 rounded-lg ${note.isFromAdmin ? 'bg-purple-50 border-l-4 border-purple-400' : 'bg-gray-50 border-l-4 border-gray-400'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{note.note}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      note.isFromAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {note.isFromAdmin ? 'Admin' : 'You'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{formatDate(note.addedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select document type</option>
                  {verification.requiredDocuments.filter(doc => !doc.submitted).map(doc => (
                    <option key={doc.type} value={doc.type}>{doc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSubmitDocument}
                disabled={!uploadFile || !selectedDocType || uploading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Send Message to Admin</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your message to the verification team..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
