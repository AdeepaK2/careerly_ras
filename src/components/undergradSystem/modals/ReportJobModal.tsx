"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ReportJobModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
}

const reportReasons = [
  "Inappropriate content",
  "Spam or misleading",
  "Discriminatory language",
  "Fake job posting",
  "Inappropriate salary/benefits",
  "Incorrect job information",
  "Scam or fraudulent",
  "Other",
];

export default function ReportJobModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onReportSubmitted,
}: ReportJobModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setMessage("Please select a reason for reporting");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("undergrad_access_token");

      if (!token) {
        setMessage("You must be logged in to report a job");
        setMessageType("error");
        return;
      }

      const response = await fetch("/api/job/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        setMessage("Job reported successfully. Thank you for your feedback.");
        setMessageType("success");
        setTimeout(() => {
          onReportSubmitted();
          handleClose();
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to report job");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error reporting job:", error);
      setMessage("Error reporting job. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setDescription("");
    setMessage("");
    setMessageType("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Report Job</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              You are reporting: <strong>{jobTitle}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Please help us understand why you're reporting this job posting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide more details about the issue..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={loading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !selectedReason}
              >
                {loading ? "Reporting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
