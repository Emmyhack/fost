'use client';

import { motion } from 'framer-motion';

interface SDKGenerationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  sdkId: string;
  projectName: string;
  languages: string[];
  creditsRemaining: number;
  downloadUrl: string;
  isWeb3?: boolean;
}

export function SDKGenerationSuccess({
  isOpen,
  onClose,
  sdkId,
  projectName,
  languages,
  creditsRemaining,
  downloadUrl,
  isWeb3 = false,
}: SDKGenerationSuccessProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full p-8"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isWeb3 ? 'Web3 SDK' : 'REST API SDK'} Generated!
        </h2>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Project Name:</span>
            <span className="font-semibold text-gray-900">{projectName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Languages:</span>
            <span className="font-semibold text-gray-900">
              {languages.map(l => l.toUpperCase()).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Credits Remaining:</span>
            <span className="font-semibold text-accent-green">{creditsRemaining}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SDK ID:</span>
            <span className="font-mono text-xs text-gray-600 truncate">{sdkId}</span>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-600 mb-6 text-center">
          Your {isWeb3 ? 'Web3 SDK' : 'REST API SDK'} is ready for download. Click the button below to get started.
        </p>

        {/* Download Button */}
        <a
          href={downloadUrl}
          download
          className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold text-center hover:from-green-700 hover:to-green-800 transition-all mb-3"
        >
          Download SDK
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Close
        </button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can download this SDK again later from your generation history.
        </p>
      </motion.div>
    </div>
  );
}
