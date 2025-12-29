"use client";

import { PencilSquareIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { CardShell, CardHeader, CardBody, CardFooter, CardBadge } from '@/components/ui/CardShell';
import { AkButton } from '@/components/ui/AkButton';

interface DraftReplyCardProps {
  draftText: string;
  tone?: "formal" | "friendly" | "casual" | "professional";
  keyPointsAddressed?: string[];
  suggestedSubject?: string;
  onApply?: () => void;
  onEdit?: () => void;
}

export function DraftReplyCard({
  draftText,
  tone = "friendly",
  keyPointsAddressed = [],
  suggestedSubject,
  onApply,
  onEdit,
}: DraftReplyCardProps) {
  const toneLabels: Record<string, string> = {
    formal: "Formell",
    friendly: "Freundlich",
    casual: "Locker",
    professional: "Professionell",
  };

  return (
    <CardShell>
      <CardHeader
        icon={<PencilSquareIcon className="w-5 h-5 text-[var(--ak-accent-inbox)]" />}
        title="Antwortentwurf"
        meta={tone && (
          <CardBadge variant="info">
            {toneLabels[tone] || tone}
          </CardBadge>
        )}
      />

      <CardBody>
        <div className="space-y-4">
          {/* Suggested Subject */}
          {suggestedSubject && (
            <div>
              <label className="text-xs font-medium text-[var(--ak-color-text-tertiary)] uppercase tracking-wide mb-1 block">
                Betreff
              </label>
              <p className="text-sm text-[var(--ak-color-text-primary)] font-medium">{suggestedSubject}</p>
            </div>
          )}

          {/* Draft Text */}
          <div>
            <label className="text-xs font-medium text-[var(--ak-color-text-tertiary)] uppercase tracking-wide mb-2 block">
              Entwurf
            </label>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-[var(--ak-color-text-primary)] whitespace-pre-wrap leading-relaxed">
                {draftText}
              </p>
            </div>
          </div>

          {/* Key Points Addressed */}
          {keyPointsAddressed.length > 0 && (
            <div>
              <label className="text-xs font-medium text-[var(--ak-color-text-tertiary)] uppercase tracking-wide mb-2 block">
                Behandelte Punkte
              </label>
              <ul className="space-y-1">
                {keyPointsAddressed.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                    <CheckCircleIcon className="w-4 h-4 text-[var(--ak-semantic-success)] mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardBody>

      {/* Footer Actions */}
      <CardFooter>
        {onEdit && (
          <AkButton
            variant="secondary"
            onClick={onEdit}
            size="sm"
          >
            Bearbeiten
          </AkButton>
        )}
        {onApply && (
          <AkButton
            variant="primary"
            accent="graphite"
            onClick={onApply}
            size="sm"
          >
            In Composer übernehmen
          </AkButton>
        )}
      </CardFooter>
    </CardShell>
  );
}

