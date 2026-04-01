'use client';

import { useEffect, useState } from 'react';
import { useAuthenticatedRequest } from "@/hooks/useAuthenticatedRequest";
import AppliedJobsModal from '@/components/undergradSystem/modals/AppliedJobsModal';
import SavedJobsModal from '@/components/undergradSystem/modals/SavedJobsModal';

interface Company {
  _id: string;
  companyName: string;
}

interface Job {
  _id: string;
  title: string;
  companyId: Company;
  location: string;
  jobType: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
}

interface Application {
  _id: string;
  jobId: Job;
  status: "applied" | "interviewed" | "interview_called" | "selected" | "rejected";
  appliedAt: string;
  interviewCall: boolean;
  expectingSalary?: number;
  coverLetter?: string;
}

interface SavedJob {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    companyId: Company;
    location: string;
    jobType: string;
    workPlaceType?: string;
    description: string;
    salaryRange?: {
      min?: number;
      max?: number;
    };
    deadline: string;
    skillsRequired: string[];
    status: string;
    urgent: boolean;
    posted_date: string;
  };
  savedAt: string;
}

interface HomeTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function HomeTab({ onNavigateToTab }: HomeTabProps) {
  const [userName] = useState('Student');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showAppliedJobsModal, setShowAppliedJobsModal] = useState(false);
  const [showSavedJobsModal, setShowSavedJobsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { makeAuthenticatedRequest } = useAuthenticatedRequest();
  
  const makeRequest = async (url: string, options: RequestInit = {}) => {
    const response = await makeAuthenticatedRequest(url, options);
    return await response.json();
  };

  // Navigation handlers
  const handleBrowseJobs = () => {
    if (onNavigateToTab) {
      onNavigateToTab('jobs');
    }
  };

  const handleUpdateProfile = () => {
    if (onNavigateToTab) {
      onNavigateToTab('profile');
    }
  };

  useEffect(() => {
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  const stats = [
    { 
      label: 'Applications Sent', 
      value: appliedJobs.length.toString(),
      icon: '📄',
      bgGradient: 'bg-gradient-to-br from-[#8243ff]/10 to-[#8243ff]/5',
      iconBg: 'bg-gradient-to-br from-[#8243ff] to-[#6c2bd9]',
      trend: '+12%',
      onClick: () => setShowAppliedJobsModal(true)
    },
    { 
      label: 'Saved Jobs', 
      value: savedJobs.length.toString(),
      icon: '💾',
      bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-25',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: '+15%',
      onClick: () => setShowSavedJobsModal(true) 
    }
  ];

  const fetchSavedJobs = async () => {
    try {
      const response = await makeRequest("/api/job/undergrad/saved", {
        method: "GET",
      });

      if (response.success) {
        const savedJobsData = response.data?.savedJobs || response.data || [];
        setSavedJobs(Array.isArray(savedJobsData) ? savedJobsData : []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs([]);
    }
  };

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const response = await makeRequest("/api/application/applied", {
        method: "GET",
      });

      if (response.success) {
        const appliedJobsData = response.data;
        setAppliedJobs(appliedJobsData);
        
        const jobIds = new Set<string>(appliedJobsData.map((app: Application) => app.jobId._id));
        setAppliedJobIds(jobIds);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAppliedJobs = () => {
    fetchAppliedJobs();
  };

  const handleRefreshSavedJobs = () => {
    fetchSavedJobs();
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      const response = await makeRequest(`/api/job/${jobId}/save`, {
        method: "DELETE",
      });

      if (response.success || !response.error) {
        setSavedJobs(prevSaved => prevSaved.filter(job => job.jobId._id !== jobId));
      } else {
        console.error("Failed to unsave job:", response.error);
        alert(response.error || "Failed to remove saved job");
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
      alert("Failed to remove saved job. Please try again.");
    }
  };

  const handleApplyToJob = (jobId: string) => {
    setShowSavedJobsModal(false);
    console.log("Apply to job:", jobId);
  };

  return (
    <div className="p-6 space-y-6">
      <style jsx>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-2xl shadow-lg p-8 text-white">
        <div>
          <h1 className="text-4xl font-bold mb-3 flex items-center">
            Welcome back, {userName}!
            <span className="ml-3 text-3xl animate-pulse origin-bottom-right" style={{
              animation: 'wave 1s ease-in-out infinite',
              transformOrigin: '70% 70%'
            }}>👋</span>
          </h1>
          <p className="text-white/90 text-lg font-medium mb-3">Ready to find your dream job?</p>
          <div className="flex items-center space-x-4 text-sm text-white/80">
            <span className="flex items-center space-x-1">
              <span>🚀</span>
              <span>Your journey starts here</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>✨</span>
              <span>Personalized dashboard</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={stat.onClick}
            className={`${stat.bgGradient} rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300  cursor-pointer  group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 ">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-lg flex items-center justify-center text-white mr-3">
              ⚡
            </span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleBrowseJobs}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group border border-gray-200 hover:border-[#8243ff]/20 cursor-pointer"
            >
              <span className="mr-2 group-hover:scale-110 transition-transform duration-300">🔍</span>
              Browse Jobs
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
       
            <button 
              onClick={handleUpdateProfile}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group border border-gray-200 hover:border-[#8243ff]/20 cursor-pointer"
            >
              <span className="mr-2 group-hover:scale-110 transition-transform duration-300">👤</span>
              Update Profile
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
          </div>
        </div>

 
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-lg flex items-center justify-center text-white mr-3">
            💡
          </span>
          Job Search Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🎯
            </div>
            <p className="text-sm text-gray-700 font-medium group-hover:text-[#8243ff] transition-colors duration-300">Tailor your resume for each application</p>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🤝
            </div>
            <p className="text-sm text-gray-700 font-medium group-hover:text-[#8243ff] transition-colors duration-300">Network with professionals in your field</p>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              📈
            </div>
            <p className="text-sm text-gray-700 font-medium group-hover:text-[#8243ff] transition-colors duration-300">Keep learning and upgrading your skills</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppliedJobsModal
        isOpen={showAppliedJobsModal}
        onClose={() => setShowAppliedJobsModal(false)}
        appliedJobs={appliedJobs}
        onRefresh={handleRefreshAppliedJobs}
      />

      <SavedJobsModal
        isOpen={showSavedJobsModal}
        onClose={() => setShowSavedJobsModal(false)}
        savedJobs={savedJobs}
        onRefresh={handleRefreshSavedJobs}
        onUnsaveJob={handleUnsaveJob}
        onApplyToJob={handleApplyToJob}
        appliedJobs={appliedJobIds}
      />
    </div>
  );
}