'use client';

import { useState } from 'react';

export default function HomeTab() {
  const [userName] = useState('Student');

  const stats = [
    { label: 'Applications Sent', value: '12' },
    { label: 'Interview Scheduled', value: '3' },
    { label: 'Profile Views', value: '45' },
    { label: 'Saved Jobs', value: '8' }
  ];

  const recentActivity = [
    { action: 'Applied to Software Developer position at TechCorp', time: '2 hours ago' },
    { action: 'Profile viewed by hiring manager', time: '1 day ago' },
    { action: 'Saved Frontend Developer job', time: '3 days ago' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-[#8243ff] rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-purple-100 text-lg">Ready to find your dream job?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-[#8243ff] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-[#8243ff] hover:bg-[#6c2bd9] text-white py-3 px-4 rounded-lg font-medium transition-colors">
              🔍 Browse Jobs
            </button>
            <button className="w-full bg-[#8243ff] hover:bg-[#6c2bd9] text-white py-3 px-4 rounded-lg font-medium transition-colors">
              👤 Update Profile
            </button>
            <button className="w-full bg-[#8243ff] hover:bg-[#6c2bd9] text-white py-3 px-4 rounded-lg font-medium transition-colors">
              📄 Upload Resume
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-[#8243ff] rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-800 text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            <button className="text-[#8243ff] hover:text-[#6c2bd9] text-sm font-medium">
              View all activity →
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Job Search Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-sm text-gray-700 font-medium">Tailor your resume for each application</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <p className="text-sm text-gray-700 font-medium">Network with professionals in your field</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm text-gray-700 font-medium">Keep learning and upgrading your skills</p>
          </div>
        </div>
      </div>
    </div>
  );
}
