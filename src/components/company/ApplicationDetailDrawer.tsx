// components/company/modals/ApplicantDetailDrawer.tsx
"use client";
import React, { useState } from "react";
import { Application } from "@/types/JobTypes";
import {
  Download,
  User,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  X,
  Star,
  StarOff,
} from "lucide-react";

interface ApplicantDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onDownloadCV: (cvUrl: string, name: string) => void;
  onShortlist: (id: string) => void;
  onRemoveShortlist: (id: string) => void;
  isShortlisted: boolean;
  shortlisting: string | null;
}

// Extracted components for better organization
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start space-x-2">
    <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
    <div>
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="ml-1 text-gray-900">{value}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    PENDING: "bg-blue-100 text-blue-700",
    REVIEWED: "bg-purple-100 text-purple-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const colorClass =
    statusColors[status.replace("_", "").toUpperCase()] ||
    "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};

const ActionButton = ({
  onClick,
  disabled,
  loading,
  children,
  variant = "default",
  icon: Icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "danger";
  icon?: React.ElementType;
}) => {
  const baseClasses =
    "w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2";

  const variantClasses = {
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-green-100 text-green-700 hover:bg-green-200",
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default function ApplicantDetailDrawer({
  isOpen,
  onClose,
  application,
  onDownloadCV,
  onShortlist,
  onRemoveShortlist,
  isShortlisted,
  shortlisting,
}: ApplicantDetailDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen || !application) return null;

  const applicant = application.applicantId;
  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const isLoading = shortlisting === application._id;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match the animation duration
  };

  const handleDownloadCV = () => {
    onDownloadCV(
      application.cv,
      `${applicant.firstName}_${applicant.lastName}`
    );
  };

  const handleShortlistAction = () => {
    if (isShortlisted) {
      onRemoveShortlist(application._id);
    } else {
      onShortlist(application._id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="applicant-details-title"
    >
      {/* Backdrop with blur effect */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Centered Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2
                id="applicant-details-title"
                className="text-xl font-bold leading-tight"
              >
                Applicant Details
              </h2>
              <p className="text-indigo-100 text-sm mt-1">{fullName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-indigo-200 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Personal Information
            </h3>
            <div className="space-y-3">
              <InfoItem
                icon={Mail}
                label="Email"
                value={applicant.universityEmail}
              />
              <InfoItem
                icon={GraduationCap}
                label="Degree"
                value={applicant.education.degreeProgramme}
              />
              <InfoItem
                icon={Calendar}
                label="Applied"
                value={new Date(application.appliedAt).toLocaleDateString()}
              />
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2">
                  <StatusBadge status={application.status} />
                </span>
              </div>
            </div>
          </div>

          {/* Cover Letter Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Cover Letter
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {application.coverLetter || "No cover letter provided."}
            </div>
          </div>

          {/* Special Requirements Card */}
          {application.specialRequirements && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Additional Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
                {application.specialRequirements}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-white p-5 space-y-3 shadow-inner rounded-b-2xl">
          <ActionButton
            onClick={handleDownloadCV}
            icon={Download}
            variant="secondary"
          >
            Download CV
          </ActionButton>
          <ActionButton
            onClick={handleShortlistAction}
            loading={isLoading}
            icon={isShortlisted ? StarOff : Star}
            variant={isShortlisted ? "danger" : "primary"}
          >
            {isShortlisted ? "Remove from Shortlist" : "Shortlist Applicant"}
          </ActionButton>
          <ActionButton onClick={handleClose} variant="default">
            Close
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
