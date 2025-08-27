"use client";

import React, { useState } from "react";
import { Flag } from "lucide-react";
import ReportJobModal from "./ReportJobModal";

interface ReportJobButtonProps {
  jobId: string;
  jobTitle: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "text" | "button" | "icon";
}

export default function ReportJobButton({
  jobId,
  jobTitle,
  className = "",
  size = "md",
  variant = "text",
}: ReportJobButtonProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-2",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleReportSubmitted = () => {
    // Could add any additional logic here, like refreshing the job list
    console.log(`Job ${jobId} reported successfully`);
  };

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={() => setShowReportModal(true)}
          className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}
          title="Report this job"
        >
          <Flag className={iconSizeClasses[size]} />
        </button>

        <ReportJobModal
          jobId={jobId}
          jobTitle={jobTitle}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={handleReportSubmitted}
        />
      </>
    );
  }

  if (variant === "button") {
    return (
      <>
        <button
          onClick={() => setShowReportModal(true)}
          className={`inline-flex items-center ${sizeClasses[size]} border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors ${className}`}
        >
          <Flag className={`${iconSizeClasses[size]} mr-1`} />
          Report
        </button>

        <ReportJobModal
          jobId={jobId}
          jobTitle={jobTitle}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={handleReportSubmitted}
        />
      </>
    );
  }

  // Default "text" variant
  return (
    <>
      <button
        onClick={() => setShowReportModal(true)}
        className={`inline-flex items-center text-gray-500 hover:text-red-600 transition-colors ${className}`}
      >
        <Flag className={`${iconSizeClasses[size]} mr-1`} />
        <span
          className={
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          }
        >
          Report
        </span>
      </button>

      <ReportJobModal
        jobId={jobId}
        jobTitle={jobTitle}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReportSubmitted={handleReportSubmitted}
      />
    </>
  );
}
