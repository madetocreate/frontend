"use client";

import type { FC } from "react";
import type { FastActionSuggestion } from "@/lib/fastActionsClient";

type Props = {
  suggestions: FastActionSuggestion[];
  onSelect: (s: FastActionSuggestion) => void;
  className?: string;
};

export const FastActionsChips: FC<Props> = ({ suggestions, onSelect, className }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;

  const cls = ["flex flex-wrap gap-2", className].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
