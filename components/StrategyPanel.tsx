"use client";

import { StrategyResponse } from "@/lib/types";
import { formatStrategyContent } from "@/lib/formatStrategy";
import { memo } from "react";

interface StrategyPanelProps {
  strategy: StrategyResponse | null;
  strategyGeneratedAt: number | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate?: () => void;
}

function StrategyPanel({
  strategy,
  strategyGeneratedAt,
  isLoading,
  error,
  onRegenerate,
}: StrategyPanelProps) {
  // Initial placeholder state
  if (!strategy && !isLoading && !error) {
    return (
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-8 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-yellow-500 text-lg font-medium">
            Ready to generate your strategy
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Enter prospect details and click "Ask Mr. Pandey" to generate your strategy
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500 mb-6"></div>
          <p className="text-yellow-500 text-lg font-medium">Analyzing prospect information...</p>
          <p className="text-gray-400 text-sm mt-2">Generating your personalized lead generation strategy</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-red-500/30 p-8 h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-900/50 border border-red-500/50 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-yellow-500 mb-3">
            Something went wrong
          </h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-400">
            Please try again or check your connection.
          </p>
        </div>
      </div>
    );
  }

  // Success state - display strategy
  if (strategy) {
    const formatContent = (content: string) => {
      const formatted = formatStrategyContent(content);
      return formatted.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        
        // Format section headers (lines ending with colon)
        if (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.startsWith('•')) {
          return (
            <div key={idx} className="font-semibold text-yellow-500 mt-4 mb-2 first:mt-0">
              {trimmed}
            </div>
          );
        }
        
        // Format bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
            <div key={idx} className="ml-6 mb-2 text-gray-200 flex items-start">
              <span className="text-yellow-500 mr-2 mt-1">•</span>
              <span className="flex-1">{trimmed.replace(/^[•\-\*]\s*/, '')}</span>
            </div>
          );
        }
        
        // Format numbered lists
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="ml-6 mb-2 text-gray-200 flex items-start">
              <span className="text-yellow-500 mr-2 mt-1 font-medium">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span className="flex-1">{trimmed.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }
        
        // Regular paragraphs
        if (trimmed.length > 0) {
          return (
            <p key={idx} className="mb-3 text-gray-200 leading-relaxed last:mb-0">
              {trimmed}
            </p>
          );
        }
        
        // Empty lines for spacing
        return <div key={idx} className="h-2" />;
      });
    };

    return (
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 p-6 lg:p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-500/50">
              <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-500">
                Strategy from Mr. Pandey
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Your personalized 5-piece lead generation strategy
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Prospect Summary */}
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700 hover:shadow-md hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-500">
                Prospect Summary
              </h3>
            </div>
            <div className="text-gray-200 leading-relaxed">
              {formatContent(strategy.prospectSummary)}
            </div>
          </div>

          {/* Pain Point Hypothesis */}
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700 hover:shadow-md hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-500">
                Pain Point Hypothesis
              </h3>
            </div>
            <div className="text-gray-200 leading-relaxed">
              {formatContent(strategy.painPointHypothesis)}
            </div>
          </div>

          {/* Positioning Strategy */}
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700 hover:shadow-md hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-500">
                Positioning Strategy
              </h3>
            </div>
            <div className="text-gray-200 leading-relaxed">
              {formatContent(strategy.positioningStrategy)}
            </div>
          </div>

          {/* Communication Tone Suggestions */}
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700 hover:shadow-md hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-500">
                Communication Tone Suggestions
              </h3>
            </div>
            <div className="text-gray-200 leading-relaxed">
              {formatContent(strategy.toneSuggestions)}
            </div>
          </div>

          {/* First Message Structure */}
          <div className="bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-700 hover:shadow-md hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-yellow-500">
                First Message Structure
              </h3>
            </div>
            <div className="text-gray-200 leading-relaxed bg-yellow-500/10 rounded-md p-4 border border-yellow-500/30">
              {formatContent(strategy.firstMessageStructure)}
            </div>
          </div>
        </div>

        {/* Footer message from Mr. Pandey */}
        <div className="mt-10 pt-6 border-t border-gray-700 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-yellow-500/50">
              <span className="text-black font-bold text-lg">MP</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-200 italic leading-relaxed">
                "Take a moment. Your voice matters more than you think. Let's take the next step together."
              </p>
              <p className="text-sm text-yellow-500 mt-2 font-medium">— Mr. Pandey</p>
            </div>
          </div>
          
          {/* Strategy metadata and regenerate button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            {strategyGeneratedAt && (
              <p className="text-xs text-gray-400">
                Generated {new Date(strategyGeneratedAt).toLocaleString()}
              </p>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-500/30"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate Strategy
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(StrategyPanel);

