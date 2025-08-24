"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, XCircle, X } from "lucide-react";

interface VerificationBannerProps {
  user: {
    companyName: string;
    isEmailVerified: boolean;
    isVerified: boolean;
    verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  };
  onNavigateToVerification: () => void;
}

export default function VerificationBanner({ user, onNavigateToVerification }: VerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if company is fully verified or if user dismissed it
  if (user.verificationStatus === 'approved' || isDismissed) {
    return null;
  }

  const getBannerConfig = () => {
    if (!user.isEmailVerified) {
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: "bg-orange-50 border-orange-200",
        textColor: "text-orange-800",
        iconColor: "text-orange-500",
        title: "Email Verification Required",
        message: "Please verify your email address to maintain login access.",
        action: null
      };
    }

    switch (user.verificationStatus) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-500",
          title: "Complete Your Company Verification",
          message: "Submit required documents to get your company verified and unlock all features.",
          action: "Start Verification"
        };
      case 'under_review':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
          title: "Verification Under Review",
          message: "Our team is reviewing your documents. We'll notify you once the review is complete.",
          action: "View Status"
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-500",
          title: "Verification Rejected",
          message: "Your verification was rejected. Please review the feedback and resubmit.",
          action: "Review & Resubmit"
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <div className={`border rounded-lg p-4 mb-6 ${config.bgColor}`}>
      <div className="flex items-start">
        <div className={`${config.iconColor} mt-0.5 mr-3`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textColor}`}>
            {config.message}
          </p>
          {config.action && (
            <button
              onClick={onNavigateToVerification}
              className={`mt-3 text-sm font-medium ${config.textColor} hover:underline`}
            >
              {config.action} →
            </button>
          )}
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className={`${config.textColor} hover:opacity-70 ml-2`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
