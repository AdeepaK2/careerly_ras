"use client";

import React, { useState, useEffect } from "react";

interface ApplicationFormData {
  cv: File | null;
  coverLetter: string;
  specialRequirements?: string;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ApplicationFormData) => void;
  isSubmitting: boolean;
  message: {
    type: "success" | "error" | null;
    text: string;
  };
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  message,
}) => {
  const [applicationForm, setApplicationForm] = useState<ApplicationFormData>({
    cv: null,
    coverLetter: "",
    specialRequirements: "",
  });

  useEffect(() => {
    if (isOpen) {
      setApplicationForm({
        cv: null,
        coverLetter: "",
        specialRequirements: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(applicationForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#8243ff] to-purple-600 text-white rounded-t-2xl">
          <h3 className="text-xl font-bold">Apply for Job</h3>
          <p className="text-purple-100 text-sm">
            Fill in your application details
          </p>
          <h3 className="text-red-100 text-sm">
            Important: Make sure you have updated your CV and skills in the
            profile tab
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CV Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload CV *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#8243ff] transition-colors duration-300">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size must be less than 5MB");
                      return;
                    }
                    // Validate file type
                    const allowedTypes = [
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ];
                    if (!allowedTypes.includes(file.type)) {
                      alert("Please upload only PDF, DOC, or DOCX files");
                      return;
                    }
                  }
                  setApplicationForm((prev) => ({
                    ...prev,
                    cv: file,
                  }));
                }}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-[#8243ff]/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#8243ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {applicationForm.cv ? applicationForm.cv.name : "Click to upload CV"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX (Max 5MB)
                </span>
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              rows={4}
              value={applicationForm.coverLetter}
              onChange={(e) =>
                setApplicationForm((prev) => ({
                  ...prev,
                  coverLetter: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all text-black"
              placeholder="Tell us why you're perfect for this role..."
              required
            />
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Special Requirements or Additional Information
            </label>
            <textarea
              rows={3}
              value={applicationForm.specialRequirements || ""}
              onChange={(e) =>
                setApplicationForm((prev) => ({
                  ...prev,
                  specialRequirements: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-transparent transition-all text-black"
              placeholder="Any special requirements, certifications, or additional information you'd like to share..."
            />
          </div>

          {/* Message Display and Buttons */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Message Display */}
              <div className="flex-1 mr-4">
                {message.type && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium ${
                      message.type === "success"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {message.type === "success" ? (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {message.text}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    message.type === "success" || 
                    !applicationForm.cv || 
                    !applicationForm.coverLetter.trim()
                  }
                  className="px-6 py-3 bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  title={
                    !applicationForm.cv 
                      ? "Please upload your CV" 
                      : !applicationForm.coverLetter.trim() 
                      ? "Please write a cover letter" 
                      : ""
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </span>
                  ) : message.type === "success" ? (
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Submitted</span>
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJobModal;
