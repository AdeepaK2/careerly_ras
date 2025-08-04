'use client';

import { useState } from 'react';

export default function JobOpportunitiesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const jobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechStart Inc.',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      posted: '2 days ago',
      logo: '🚀',
      skills: ['React', 'JavaScript', 'CSS'],
      description: 'Looking for a passionate frontend developer to join our growing team.',
      urgent: true
    },
    {
      id: 2,
      title: 'Software Engineer Intern',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'Internship',
      salary: '$25/hour',
      posted: '1 week ago',
      logo: '💻',
      skills: ['Python', 'Java', 'Git'],
      description: 'Summer internship opportunity for computer science students.',
      urgent: false
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$55,000 - $70,000',
      posted: '3 days ago',
      logo: '🎨',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      description: 'Design beautiful and intuitive user experiences for our clients.',
      urgent: false
    },
    {
      id: 4,
      title: 'Data Analyst',
      company: 'DataCorp',
      location: 'Boston, MA',
      type: 'Full-time',
      salary: '$50,000 - $65,000',
      posted: '5 days ago',
      logo: '📊',
      skills: ['SQL', 'Python', 'Tableau'],
      description: 'Analyze data to drive business decisions and insights.',
      urgent: true
    },
    {
      id: 5,
      title: 'Mobile App Developer',
      company: 'AppWorks',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$70,000 - $90,000',
      posted: '1 day ago',
      logo: '📱',
      skills: ['React Native', 'Flutter', 'iOS'],
      description: 'Build amazing mobile applications for iOS and Android.',
      urgent: false
    }
  ];

  const filters = [
    { id: 'all', label: 'All Jobs', count: jobs.length },
    { id: 'fulltime', label: 'Full-time', count: jobs.filter(job => job.type === 'Full-time').length },
    { id: 'internship', label: 'Internship', count: jobs.filter(job => job.type === 'Internship').length },
    { id: 'contract', label: 'Contract', count: jobs.filter(job => job.type === 'Contract').length }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || job.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Job Opportunities 🎯</h1>
        <p className="text-purple-100">Discover your next career opportunity</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8243ff] focus:border-[#8243ff] outline-none"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-[#8243ff] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredJobs.length}</span> job opportunities
        </p>
        <button className="text-[#8243ff] hover:text-[#6c2bd9] font-medium flex items-center space-x-1">
          <span>Sort by: Newest</span>
          <span>⬇️</span>
        </button>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-xl flex items-center justify-center text-2xl">
                    {job.logo}
                  </div>

                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{job.title}</h3>
                        <p className="text-[#8243ff] font-medium mb-2">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{job.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💼</span>
                            <span>{job.type}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💰</span>
                            <span>{job.salary}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>🕒</span>
                            <span>{job.posted}</span>
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{job.description}</p>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-[#8243ff] rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Urgent Badge */}
                      {job.urgent && (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                          🔥 Urgent
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button className="bg-[#8243ff] hover:bg-[#6c2bd9] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Apply Now
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        Save Job
                      </button>
                      <button className="text-[#8243ff] hover:text-[#6c2bd9] font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center pt-6">
        <button className="bg-gradient-to-r from-[#8243ff] to-[#6c2bd9] hover:from-[#6c2bd9] hover:to-[#5a1fc7] text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Load More Jobs
        </button>
      </div>
    </div>
  );
}
