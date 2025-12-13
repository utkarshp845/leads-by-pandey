"use client";

import { Prospect } from "@/lib/types";
import { useState, useEffect, memo } from "react";

interface ProspectFormProps {
  prospect: Prospect;
  prospectId: string | null;
  onProspectChange: (prospect: Prospect) => void;
  onSaveProspect: () => void;
  onAskMrPandey: () => void;
  isLoading: boolean;
}

function ProspectForm({
  prospect,
  prospectId,
  onProspectChange,
  onSaveProspect,
  onAskMrPandey,
  isLoading,
}: ProspectFormProps) {
  const [linksInput, setLinksInput] = useState(
    prospect.links.join(", ")
  );

  // Sync linksInput when prospect changes (only if prospect actually changed)
  useEffect(() => {
    const newLinksInput = prospect.links.join(", ");
    if (newLinksInput !== linksInput) {
      setLinksInput(newLinksInput);
    }
  }, [prospect.links]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    field: keyof Prospect,
    value: string | string[]
  ) => {
    onProspectChange({
      ...prospect,
      [field]: value,
    });
  };

  const handleLinksChange = (value: string) => {
    setLinksInput(value);
    const linksArray = value
      .split(",")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);
    handleChange("links", linksArray);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/98 to-gray-900/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-yellow-500/30 p-5 lg:p-6 h-full flex flex-col transition-all duration-300">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent rounded-2xl blur-xl pointer-events-none"></div>
      
      <div className="relative z-10 mb-6 pb-4 border-b border-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-500/30">
            <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-yellow-500 tracking-tight">
              Prospect Details
            </h2>
            <p className="text-xs text-gray-300 font-medium">
              Enter information to generate your strategy
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Row 1: Name and Title */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Name <span className="text-yellow-500 font-bold">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={prospect.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={prospect.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="VP of Sales"
            disabled={isLoading}
          />
        </div>

        {/* Row 2: Company and Industry */}
        <div>
          <label
            htmlFor="company"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Company <span className="text-yellow-500 font-bold">*</span>
          </label>
          <input
            type="text"
            id="company"
            value={prospect.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="Acme Corp"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="industry"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Industry
          </label>
          <input
            type="text"
            id="industry"
            value={prospect.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="Technology"
            disabled={isLoading}
          />
        </div>

        {/* Row 3: Known Pain Points (Full Width) */}
        <div className="col-span-2">
          <label
            htmlFor="knownPainPoints"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Known Pain Points
          </label>
          <textarea
            id="knownPainPoints"
            value={prospect.knownPainPoints}
            onChange={(e) => handleChange("knownPainPoints", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 resize-none transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="What challenges or pain points do you know or suspect they have?"
            disabled={isLoading}
          />
        </div>

        {/* Row 4: Notes and Links */}
        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={prospect.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 resize-none transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="Additional context..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="links"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Links
          </label>
          <input
            type="text"
            id="links"
            value={linksInput}
            onChange={(e) => handleLinksChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="LinkedIn, website (comma-separated)"
            disabled={isLoading}
          />
        </div>

        {/* Row 5: Prior Interactions (Full Width) */}
        <div className="col-span-2">
          <label
            htmlFor="priorInteractions"
            className="block text-xs font-bold text-gray-200 mb-1.5"
          >
            Prior Interactions
          </label>
          <textarea
            id="priorInteractions"
            value={prospect.priorInteractions}
            onChange={(e) => handleChange("priorInteractions", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border-2 border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 resize-none transition-all bg-gray-700/80 backdrop-blur-sm text-gray-100 placeholder-gray-500 hover:border-gray-500 text-sm"
            placeholder="Previous conversations, meetings, or interactions..."
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="relative z-10 mt-4 pt-4 border-t border-yellow-500/20 space-y-2.5">
        {/* Save Prospect Button */}
        <button
          onClick={onSaveProspect}
          disabled={isLoading || !prospect.name.trim() || !prospect.company.trim()}
          className="w-full px-4 py-2.5 bg-gray-700/90 backdrop-blur-sm text-gray-200 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg border-2 border-gray-600 hover:border-gray-500 text-sm"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {prospectId ? "Update Prospect" : "Save Prospect"}
          </span>
        </button>

        {/* Ask Mr Pandey Button */}
        <button
          onClick={onAskMrPandey}
          disabled={isLoading || !prospect.name.trim() || !prospect.company.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl shadow-yellow-500/50 transform hover:-translate-y-0.5 hover:scale-[1.01] disabled:transform-none"
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Strategy...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ask Mr Pandey
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export default memo(ProspectForm);

