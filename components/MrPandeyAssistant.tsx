"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AssistantMessage {
  id: string;
  text: string;
  type: "tip" | "help" | "suggestion";
  timestamp: number;
}

interface MrPandeyAssistantProps {
  context?: string; // Current page/section context
}

const contextTips: Record<string, string[]> = {
  strategy: [
    "Fill in at least the prospect's name and company to generate a strategy",
    "The more details you provide, the more personalized your strategy will be",
    "You can regenerate strategies if you want a different approach",
  ],
  prospects: [
    "Click on any prospect to view or edit their details",
    "Use the status field to track where each prospect is in your pipeline",
    "Set follow-up dates to never miss an important touchpoint",
  ],
  analytics: [
    "Track your progress over time to see your growth",
    "Use insights to identify your most successful strategies",
    "Compare month-over-month performance",
  ],
  default: [
    "Welcome! I'm here to help you succeed with your lead generation",
    "Start by creating your first prospect and generating a strategy",
    "Need help? Just ask - I'm always here",
  ],
};

export function MrPandeyAssistant({ context = "default" }: MrPandeyAssistantProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (text: string, type: AssistantMessage["type"] = "help") => {
    const newMessage: AssistantMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickHelp = () => {
    const tips = contextTips[context] || contextTips.default;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    addMessage(randomTip, "help");
    setIsMinimized(false);
  };

  const handleToggle = () => {
    setIsMinimized(!isMinimized);
  };

  // Always show the button, only expand when clicked
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[1060]">
        <button
          onClick={handleToggle}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/60 transition-all hover:scale-110 border-2 border-yellow-500/30 group"
          aria-label="Open Mr. Pandey Assistant"
        >
          <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
            <span className="text-yellow-500 font-bold text-lg">MP</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1060]">
      <div
        className={cn(
          "bg-gradient-to-br from-gray-800/98 to-gray-900/98 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 transition-all duration-300 w-80 h-96"
        )}
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                  <span className="text-black font-bold text-lg">MP</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-yellow-500">Mr. Pandey</h3>
                  <p className="text-xs text-gray-400">Your AI advisor</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Minimize"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Click "Get Help" to receive guidance from Mr. Pandey</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="animate-slide-up bg-gray-700/50 rounded-lg p-3 border border-gray-600/50"
                    >
                      <p className="text-sm text-gray-200 leading-relaxed">{message.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-t border-gray-700/50">
              <button
                onClick={handleQuickHelp}
                className="w-full px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-medium transition-colors border border-yellow-500/30"
              >
                Get Help
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}

