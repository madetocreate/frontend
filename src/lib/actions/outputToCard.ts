/**
 * Konvertiert ActionOutputV1 zu ChatCard.
 * 
 * Single Source of Truth für ActionOutputV1 → Card Konvertierung.
 * Unterstützt alle ActionOutputV1 Typen: summary, draft, tasks, extraction, classification, notification, plan, reply.
 */

import { ChatCard } from '@/components/chat/cards/types';
import { getActionDefinition } from './registry';
import type { ActionId } from './types';

/**
 * Konvertiert ActionOutputV1 zu ChatCard.
 * 
 * @param result - ActionOutputV1 Result (muss "type" haben)
 * @param actionId - Optional: Action ID für Label-Lookup
 * @returns ChatCard oder null wenn nicht konvertierbar
 */
export function actionOutputV1ToCard(
  result: Record<string, unknown>,
  actionId?: string
): ChatCard | null {
  // Prüfe, ob result ein ActionOutputV1 ist (muss "type" haben)
  if (!result.type || typeof result.type !== 'string') {
    return null;
  }

  const outputType = result.type as string;
  const cardId = `action-output-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Hole Action Label für Titel
  let actionLabel = 'Ergebnis';
  if (actionId) {
    try {
      const actionDef = getActionDefinition(actionId as ActionId);
      if (actionDef) {
        actionLabel = actionDef.label;
      }
    } catch {
      // Ignore errors
    }
  }

  switch (outputType) {
    case 'summary': {
      const summary = result.summary as string;
      if (!summary) return null;

      return {
        id: cardId,
        type: 'insight',
        title: actionLabel,
        content: summary,
        createdAt: Date.now(),
      };
    }

    case 'draft': {
      const draft = result.draft as string;
      if (!draft) return null;

      return {
        id: cardId,
        type: 'draft_reply',
        payload: {
          draftText: draft,
          tone: (result.tone as 'formal' | 'friendly' | 'casual' | 'professional' | undefined) || undefined,
          keyPointsAddressed: result.key_points_addressed as string[] | undefined,
          suggestedSubject: result.suggested_subject as string | undefined,
        },
        createdAt: Date.now(),
      };
    }

    case 'tasks': {
      const tasks = result.tasks as string[] | undefined;
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return null;

      return {
        id: cardId,
        type: 'list',
        title: actionLabel,
        columns: [{ key: 'task', label: 'Aufgabe', type: 'text' }],
        rows: tasks.map((task, idx) => ({
          id: `task-${idx}`,
          task: task,
        })),
        createdAt: Date.now(),
      };
    }

    case 'extraction': {
      const fields = result.fields as Record<string, string> | undefined;
      if (!fields || typeof fields !== 'object') return null;

      // Highlights als zusätzliche Felder hinzufügen
      const highlights = (result.highlights as string[] | undefined) || [];
      const dataWithHighlights: Record<string, string> = { ...fields };
      if (highlights.length > 0) {
        dataWithHighlights['_highlights'] = highlights.join('\n• ');
      }

      return {
        id: cardId,
        type: 'entity',
        title: actionLabel,
        data: dataWithHighlights,
        createdAt: Date.now(),
      };
    }

    case 'classification': {
      const label = result.label as string;
      const details = result.details as string | undefined;
      const confidence = result.confidence as number | undefined;

      if (!label) return null;

      // Nutze InsightCard für Klassifikation
      const content = details || label;
      const metrics = confidence !== undefined ? [{
        label: 'Konfidenz',
        value: `${Math.round(confidence * 100)}%`,
        trend: 'neutral' as const,
      }] : undefined;

      return {
        id: cardId,
        type: 'insight',
        title: actionLabel,
        content: content,
        metrics: metrics,
        createdAt: Date.now(),
      };
    }

    case 'notification': {
      const notification = result.notification as string;
      if (!notification) return null;

      // Nutze InsightCard für Notifications
      return {
        id: cardId,
        type: 'insight',
        title: actionLabel,
        content: notification,
        createdAt: Date.now(),
      };
    }

    case 'plan': {
      const steps = result.steps as string[] | undefined;
      const title = (result.title as string) || actionLabel;

      if (!steps || !Array.isArray(steps) || steps.length === 0) {
        // Fallback: Wenn keine steps, nutze notification falls vorhanden
        const notification = result.notification as string;
        if (notification) {
          return {
            id: cardId,
            type: 'insight',
            title: title,
            content: notification,
            createdAt: Date.now(),
          };
        }
        return null;
      }

      // Nutze ListCard für Plan mit Steps
      return {
        id: cardId,
        type: 'list',
        title: title,
        columns: [{ key: 'step', label: 'Schritt', type: 'text' }],
        rows: steps.map((step, idx) => ({
          id: `step-${idx}`,
          step: step,
        })),
        createdAt: Date.now(),
      };
    }

    case 'reply': {
      const reply = result.reply as string;
      if (!reply) return null;

      // Behandle reply wie draft (DraftReplyCard)
      return {
        id: cardId,
        type: 'draft_reply',
        payload: {
          draftText: reply,
          tone: (result.tone as 'formal' | 'friendly' | 'casual' | 'professional' | undefined) || undefined,
          keyPointsAddressed: result.key_points_addressed as string[] | undefined,
          suggestedSubject: result.suggested_subject as string | undefined,
        },
        createdAt: Date.now(),
      };
    }

    default:
      // Unbekannter output_type -> kein Card
      return null;
  }
}

