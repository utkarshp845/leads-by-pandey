"use client";

import { SavedProspect } from "@/lib/types";
import { useState } from "react";

interface ProspectListProps {
  prospects: SavedProspect[];
  selectedProspectId: string | null;
  onSelectProspect: (id: string) => void;
  onNewProspect: () => void;
  onDeleteProspect: (id: string) => void;
}

export default function ProspectList({
  prospects,
  selectedProspectId,
  onSelectProspect,
  onNewProspect,
  onDeleteProspect,
}: ProspectListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteProspect(id);
    setDeleteConfirmId(null);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-500">Prospects</h2>
          <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-full border border-yellow-500/30">
            {prospects.length}
          </span>
        </div>
        <button
          onClick={onNewProspect}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg shadow-yellow-500/50"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prospect
          </span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {prospects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No prospects yet</p>
            <p className="text-gray-500 text-xs mt-1">Create your first prospect to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prospects.map((prospect) => {
              const isSelected = prospect.id === selectedProspectId;
              const hasStrategy = prospect.strategy !== null;

              return (
                <div
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect.id)}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-yellow-500 bg-gray-800 shadow-md shadow-yellow-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-yellow-500/50 hover:bg-gray-800 hover:shadow-sm"
                    }
                  `}
                >
                  {/* Strategy indicator */}
                  {hasStrategy && (
                    <div className="absolute top-3 right-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" title="Strategy generated" />
                    </div>
                  )}

                  {/* Prospect info */}
                  <div className="pr-6">
                    <h3 className="font-semibold text-yellow-500 mb-1 truncate">
                      {prospect.name || "Unnamed"}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2 truncate">
                      {prospect.company || "No company"}
                    </p>
                    {prospect.title && (
                      <p className="text-xs text-gray-400 mb-2 truncate">{prospect.title}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(prospect.createdAt)}
                      </span>
                      {hasStrategy && (
                        <span className="text-xs text-yellow-500 font-medium">Has Strategy</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, prospect.id)}
                    className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded z-10"
                    title="Delete prospect"
                    aria-label="Delete prospect"
                  >
                    {deleteConfirmId === prospect.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleDeleteConfirm(e, prospect.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Confirm delete"
                          aria-label="Confirm delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="text-gray-400 hover:text-gray-300"
                          title="Cancel"
                          aria-label="Cancel delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

