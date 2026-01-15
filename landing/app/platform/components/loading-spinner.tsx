'use client';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className={`${sizeClass} border-2 border-accent-green border-t-transparent rounded-full animate-spin`} />
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="font-mono text-gray-700">Processing...</p>
      </div>
    </div>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-accent-green h-full transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

export function InlineSpinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span className="font-mono text-sm text-gray-600">Loading...</span>
    </span>
  );
}
