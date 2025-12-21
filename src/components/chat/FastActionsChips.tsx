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
        // payload kommt als unknown-Record; wir rendern nur, wenn es wirklich ein string ist.
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          className="group flex flex-col items-start gap-1 w-full p-4 rounded-xl border border-gray-200 bg-white text-left shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
        >
          <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {s.label}
          </span>
          {typeof (s.payload as Record<string, unknown> | undefined)?.text === "string" && (
            <span className="text-xs text-gray-500 line-clamp-2">
              {(s.payload as Record<string, unknown>).text as string}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
