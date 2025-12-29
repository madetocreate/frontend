"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/api/authedFetch";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpIconSolid, HandThumbDownIcon as HandThumbDownIconSolid } from "@heroicons/react/24/solid";
import clsx from "clsx";

interface FeedbackButtonsProps {
  messageId: string;
  sessionId: string;
  tenantId: string;
  agentName?: string;
  className?: string;
}

export function FeedbackButtons({
  messageId,
  sessionId,
  tenantId,
  agentName,
  className,
}: FeedbackButtonsProps) {
  const [feedbackSent, setFeedbackSent] = useState<"thumbs_up" | "thumbs_down" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedback = async (type: "thumbs_up" | "thumbs_down") => {
    if (feedbackSent || isLoading) return;

    setIsLoading(true);
    try {
      const response = await authedFetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          session_id: sessionId,
          message_id: messageId,
          agent_name: agentName,
          feedback_type: type,
        }),
      });

      if (response.ok) {
        setFeedbackSent(type);
      } else {
        console.error("Failed to submit feedback:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => handleFeedback("thumbs_up")}
        disabled={isLoading || feedbackSent !== null}
        className={clsx(
          "inline-flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors",
          "hover:bg-[var(--ak-color-bg-surface-muted)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          feedbackSent === "thumbs_up"
            ? "text-[var(--ak-semantic-success)]"
            : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
        )}
        aria-label="Positive feedback"
      >
        {feedbackSent === "thumbs_up" ? (
          <HandThumbUpIconSolid className="h-4 w-4" />
        ) : (
          <HandThumbUpIcon className="h-4 w-4" />
        )}
        <span className="sr-only">Gut</span>
      </button>
      <button
        type="button"
        onClick={() => handleFeedback("thumbs_down")}
        disabled={isLoading || feedbackSent !== null}
        className={clsx(
          "inline-flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors",
          "hover:bg-[var(--ak-color-bg-surface-muted)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          feedbackSent === "thumbs_down"
            ? "text-[var(--ak-semantic-danger)]"
            : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
        )}
        aria-label="Negative feedback"
      >
        {feedbackSent === "thumbs_down" ? (
          <HandThumbDownIconSolid className="h-4 w-4" />
        ) : (
          <HandThumbDownIcon className="h-4 w-4" />
        )}
        <span className="sr-only">Schlecht</span>
      </button>
    </div>
  );
}

