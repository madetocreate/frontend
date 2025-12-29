import { InboxActionId, InboxTabId, INBOX_ACTIONS } from './actions';

/**
 * Maps an action to its primary output tab in the reading pane.
 */
export const getTargetTabForAction = (actionId: InboxActionId): InboxTabId => {
  return INBOX_ACTIONS[actionId]?.targetTab || 'history';
};

/**
 * Logic to decide if an action output should be appended or replace current content.
 */
export const shouldAppendContent = (actionId: InboxActionId): boolean => {
  return actionId === 'inbox.next_steps';
};

