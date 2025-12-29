/**
 * Team Channels API Client
 * Functions to interact with team channels (chat-integrated teams)
 */

import { authedFetch } from './authedFetch'

export interface TeamChannel {
  session_id: string;
  tenant_id: string;
  team_id: string;
  channel_name: string;
  title: string;
  thread_type: 'team_channel';
  visibility: 'private' | 'team' | 'public';
  message_count: number;
  last_message_at?: string;
  created_at: string;
  team_name?: string;
  team_description?: string;
}

export interface CreateTeamChannelRequest {
  team_id: string;
  channel_name: string;
  title?: string;
  visibility?: 'private' | 'team' | 'public';
  created_by?: string;
}

/**
 * Fetch all team channels for a user
 */
export async function fetchTeamChannels(
  teamId?: string,
  userId?: string
): Promise<TeamChannel[]> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (teamId) params.append('team_id', teamId);

  const response = await authedFetch(`/api/team-channels/list?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team channels');
  }
  const data = await response.json();
  return data.channels || [];
}

/**
 * Create a new team channel
 */
export async function createTeamChannel(
  request: CreateTeamChannelRequest
): Promise<TeamChannel> {
  const response = await authedFetch('/api/team-channels/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create team channel');
  }

  return await response.json();
}

/**
 * Get a specific team channel
 */
export async function getTeamChannel(
  sessionId: string,
  userId?: string
): Promise<TeamChannel> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await authedFetch(
    `/api/team-channels/${sessionId}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch team channel');
  }

  return await response.json();
}

/**
 * Delete a team channel
 */
export async function deleteTeamChannel(
  sessionId: string,
  userId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await authedFetch(
    `/api/team-channels/${sessionId}?${params.toString()}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete team channel');
  }
}

