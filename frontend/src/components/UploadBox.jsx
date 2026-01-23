export default function UploadBox({ file, setFile, onAnalyze, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <label className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 lg:p-12 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            {!file ? (
              <div className="space-y-2 sm:space-y-3">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Drop PDF here or click to upload</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Maximum file size: 10MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!file || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
      >
        {loading ? "Analyzing..." : "Analyze Report"}
      </button>
    </div>
  );
}
