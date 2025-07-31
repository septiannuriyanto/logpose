'use client';

import { useAuth } from "@/components/AuthProvider";
import { getUserAchievements } from "@/lib/achievement-utils";
import { mockStats } from "@/lib/mock-stats";

const userAchievements = getUserAchievements(mockStats);

export default function DashboardPage() {
  const { profile } = useAuth();
  const displayName = profile?.full_name;
  console.log('>>>> ', displayName)
  
  return (
      <div className="p-6 space-y-6">
      {/* Welcome Pane with Rank Achievement */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Hello, {displayName} 👋</h1>
        <p className="text-gray-600 mb-4">Great work last month! Here's how you performed:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-xl">
            <p className="text-sm text-teal-700">🏆 Monthly Achievement</p>
            <h2 className="text-lg font-bold">#2 in Team</h2>
            <p className="text-sm text-gray-600">Logged 72h total last month</p>
          </div>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-xl">
            <p className="text-sm text-indigo-700">⭐ Weekly Rank</p>
            <h2 className="text-lg font-bold">#3 in Team</h2>
            <p className="text-sm text-gray-600">18h 30m this week</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Your Badges</h2>
        <div className="flex flex-wrap gap-4">
          {userAchievements.map((badge) => (
            <div
              key={badge.id}
              className="bg-gray-100 rounded-xl px-4 py-2 text-sm flex items-center gap-2 shadow-sm"
            >
              <span className="text-xl">{badge.icon}</span>
              <div>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold">Time Today</h2>
          <p className="text-2xl font-bold text-teal-600">3h 45m</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold">This Week</h2>
          <p className="text-2xl font-bold text-teal-600">18h 30m</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold">This Month</h2>
          <p className="text-2xl font-bold text-teal-600">72h 10m</p>
        </div>
      </div>

      {/* Active Task */}
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <h2 className="text-lg font-semibold">Active Task</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-md font-medium">Design Homepage UI</p>
            <p className="text-sm text-gray-500">Tracking for 00:42:10</p>
          </div>
          <button className="bg-red-500 text-white rounded-xl px-4 py-2 hover:bg-red-600">
            Stop Timer
          </button>
        </div>
      </div>

      {/* Task History Table */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Task History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Task</th>
              <th className="py-2">Duration</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">2025-06-26</td>
              <td className="py-2">Design Homepage UI</td>
              <td className="py-2">2h 15m</td>
              <td className="py-2 text-green-600">Completed</td>
            </tr>
            <tr>
              <td className="py-2">2025-06-25</td>
              <td className="py-2">Setup Auth System</td>
              <td className="py-2">3h 10m</td>
              <td className="py-2 text-green-600">Completed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}