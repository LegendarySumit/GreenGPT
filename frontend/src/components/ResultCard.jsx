export default function ResultCard({ data }) {
  const normalizeRiskLevel = (level) => {
    if (!level) return 'Low';
    const normalized = String(level).toLowerCase();
    if (normalized === 'high') return 'High';
    if (normalized === 'medium') return 'Medium';
    return 'Low';
  };

  const getRiskConfig = (level) => {
    const configs = {
      High: {
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-100 dark:bg-red-900/40",
        border: "border-red-300 dark:border-red-700",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      },
      Medium: {
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-100 dark:bg-amber-900/40",
        border: "border-amber-300 dark:border-amber-700",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      },
      Low: {
        color: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
        border: "border-emerald-300 dark:border-emerald-700",
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      },
    };
    return configs[level] || configs.Low;
  };

  const normalizedRiskLevel = normalizeRiskLevel(data.risk_level);
  const risk = getRiskConfig(normalizedRiskLevel);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Risk Badge */}
      <div className={`${risk.bg} ${risk.border} border rounded-lg px-4 py-2.5 inline-flex items-center gap-2`}>
        <span className={risk.color}>{risk.icon}</span>
        <span className={`text-sm font-bold ${risk.color}`}>
          {normalizedRiskLevel} Risk Level
        </span>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Summary</h3>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
      </div>

      {/* Pollution Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Key Pollution Sources</h3>
        <ul className="space-y-2">
          {data.key_pollution_sources.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="text-emerald-600 mt-1 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Environmental Risks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Environmental Risks</h3>
        <ul className="space-y-2 sm:space-y-3">
          {data.environmental_risks.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-amber-600 text-xs sm:text-sm font-medium flex-shrink-0">{idx + 1}</span>
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Violations & Concerns */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Violations & Concerns</h3>
        <ul className="space-y-2">
          {data.violations_or_concerns.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-900 dark:text-gray-200">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
