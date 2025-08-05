"use client";

import { useState, useEffect } from "react";
import CompanyVerificationStatus from "@/components/companySystem/VerificationStatus";

export default function VerificationTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Company Verification
        </h2>
        <p className="text-gray-600">
          Complete your company verification to unlock all features and gain credibility with job seekers.
        </p>
      </div>
      
      <CompanyVerificationStatus />
    </div>
  );
}
