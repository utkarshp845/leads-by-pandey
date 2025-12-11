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
    <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-6 lg:p-8 h-full flex flex-col">
      <div className="mb-8 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md shadow-yellow-500/50">
            <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-yellow-500">
              Prospect Details
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Enter information to generate your strategy
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Name <span className="text-yellow-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={prospect.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={prospect.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="VP of Sales"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Company <span className="text-yellow-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            value={prospect.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="Acme Corp"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Industry
          </label>
          <input
            type="text"
            id="industry"
            value={prospect.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="Technology"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="knownPainPoints"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Known Pain Points
          </label>
          <textarea
            id="knownPainPoints"
            value={prospect.knownPainPoints}
            onChange={(e) => handleChange("knownPainPoints", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="What challenges or pain points do you know or suspect they have?"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={prospect.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="Any additional notes or context about this prospect..."
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="links"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Links
          </label>
          <input
            type="text"
            id="links"
            value={linksInput}
            onChange={(e) => handleLinksChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="LinkedIn URL, website, etc. (comma-separated)"
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-gray-400">
            Separate multiple links with commas
          </p>
        </div>

        <div>
          <label
            htmlFor="priorInteractions"
            className="block text-sm font-semibold text-gray-300 mb-2"
          >
            Prior Interactions
          </label>
          <textarea
            id="priorInteractions"
            value={prospect.priorInteractions}
            onChange={(e) => handleChange("priorInteractions", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none transition-all bg-gray-700 text-gray-100 placeholder-gray-500"
            placeholder="Any previous conversations, meetings, or interactions with this prospect..."
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700 space-y-3">
        {/* Save Prospect Button */}
        <button
          onClick={onSaveProspect}
          disabled={isLoading || !prospect.name.trim() || !prospect.company.trim()}
          className="w-full px-6 py-3 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg border border-gray-600"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {prospectId ? "Update Prospect" : "Save Prospect"}
          </span>
        </button>

        {/* Ask Mr Pandey Button */}
        <button
          onClick={onAskMrPandey}
          disabled={isLoading || !prospect.name.trim() || !prospect.company.trim()}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl shadow-yellow-500/50 transform hover:-translate-y-0.5 disabled:transform-none"
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

