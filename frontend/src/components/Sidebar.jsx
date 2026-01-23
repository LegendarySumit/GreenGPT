export default function Sidebar({ onNewAnalysis }) {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          GreenGPT
        </h1>
        <p className="text-xs text-gray-400 mt-1">Environmental Intelligence</p>
      </div>

      <div className="p-4">
        <button
          onClick={onNewAnalysis}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent
          </div>
          {/* Placeholder for history - can be implemented later */}
          <p className="text-sm text-gray-500 italic">No recent analyses</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-gray-400">Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}
