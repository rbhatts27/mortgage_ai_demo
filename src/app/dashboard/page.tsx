import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Dashboard - Mortgage AI Demo',
  description: 'Monitor AI conversations and handoffs',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Conversation Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Conversations</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Handed Off Today</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">AI Resolution Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">0%</p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Conversations</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center">No conversations yet. Start by sending a message to your Twilio number.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
