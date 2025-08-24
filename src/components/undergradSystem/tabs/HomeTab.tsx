'use client';

import { useState } from 'react';

export default function HomeTab() {
  const [userName] = useState('Student');

  const stats = [
    { 
      label: 'Applications Sent', 
      value: '12',
      icon: '📄',
      bgGradient: 'bg-gradient-to-br from-[#8243ff]/10 to-[#8243ff]/5',
      iconBg: 'bg-gradient-to-br from-[#8243ff] to-[#6c2bd9]',
      trend: '+12%'
    },
    { 
      label: 'Interview Scheduled', 
      value: '3',
      icon: '🎯',
      bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-25',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trend: '+25%'
    },
    { 
      label: 'Profile Views', 
      value: '45',
      icon: '👁️',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-25',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: '+8%'
    },
    { 
      label: 'Saved Jobs', 
      value: '8',
      icon: '💾',
      bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-25',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: '+15%'
    }
  ];

  const recentActivity = [
    { action: 'Applied to Software Developer position at TechCorp', time: '2 hours ago' },
    { action: 'Profile viewed by hiring manager', time: '1 day ago' },
    { action: 'Saved Frontend Developer job', time: '3 days ago' }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bgGradient} rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <span className="text-green-500 text-sm font-medium flex items-center">
                <span className="mr-1">📈</span>
                {stat.trend}
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-gray-600">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-lg flex items-center justify-center text-white mr-3">
              ⚡
            </span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group border border-gray-200 hover:border-[#8243ff]/20">
              <span className="mr-2 group-hover:scale-110 transition-transform duration-300">🔍</span>
              Browse Jobs
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
            <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group border border-gray-200 hover:border-[#8243ff]/20">
              <span className="mr-2 group-hover:scale-110 transition-transform duration-300">👤</span>
              Update Profile
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
            <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-[#8243ff]/10 hover:to-[#8243ff]/5 text-gray-700 hover:text-[#8243ff] py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center group border border-gray-200 hover:border-[#8243ff]/20">
              <span className="mr-2 group-hover:scale-110 transition-transform duration-300">📄</span>
              Upload Resume
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-lg flex items-center justify-center text-white mr-3">
              📊
            </span>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg hover:from-[#8243ff]/5 hover:to-[#8243ff]/2 transition-all duration-300 transform hover:scale-102 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-[#8243ff] to-[#6c2bd9] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium group-hover:text-[#8243ff] transition-colors duration-300">{activity.action}</p>
                  <p className="text-gray-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">🕒</span>
                    {activity.time}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[#8243ff] text-sm">→</span>
                </div>
              </div>
            ))}
            <button className="text-[#8243ff] hover:text-[#6c2bd9] text-sm font-medium flex items-center group transition-colors duration-300">
              <span className="group-hover:translate-x-1 transition-transform duration-300">View all activity</span>
              <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
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
    </div>
  );
}
