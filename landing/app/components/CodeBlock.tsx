/**
 * CodeBlock Component
 * Reusable code snippet display with optional terminal styling and copy button
 */

'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  isTerminal?: boolean;
  language?: string;
}

export default function CodeBlock({
  code,
  isTerminal = false,
  language = 'typescript',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      {isTerminal ? (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-500 ml-auto">Terminal</span>
          </div>
          <pre className="whitespace-pre-wrap break-words">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto shadow-sm">
          <code className="font-mono text-sm text-gray-800">{code}</code>
        </pre>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-accent-green hover:text-white transition-colors duration-200"
        aria-label="Copy code"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
