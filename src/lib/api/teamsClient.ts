/**
 * Teams API Client
 * Functions to interact with the teams backend API
 */

import { authedFetch } from './authedFetch'

export interface Team {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  added_by?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  actor_user_id?: string;
  actor_role?: string;
}

export interface AddTeamMemberRequest {
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  actor_user_id?: string;
  actor_role?: string;
}

/**
 * Fetch all teams for a tenant
 */
export async function fetchTeams(): Promise<Team[]> {
  const response = await authedFetch(`/api/crm/teams`);
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  const data = await response.json();
  // Handle both { teams: [] } and direct array response from backend
  if (Array.isArray(data)) return data;
  return data.teams || [];
}

/**
 * Create a new team
 */
export async function createTeam(request: CreateTeamRequest): Promise<Team> {
  const response = await authedFetch('/api/crm/teams/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create team');
  }
  
  return await response.json();
}

/**
 * Update a team
 */
export async function updateTeam(
  teamId: string,
  updates: { name?: string; description?: string; status?: 'active' | 'inactive' }
): Promise<Team> {
  const response = await fetch(`/api/crm/teams/${teamId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update team');
  }
  
  return await response.json();
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<void> {
  const response = await authedFetch(`/api/crm/teams/${teamId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete team');
  }
}

/**
 * Fetch team members
 */
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  const response = await authedFetch(`/api/crm/teams/${teamId}/members`);
  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }
  const data = await response.json();
  return data.members || [];
}

/**
 * Add a team member
 */
export async function addTeamMember(request: AddTeamMemberRequest): Promise<TeamMember> {
  const response = await authedFetch('/api/crm/teams/member/upsert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add team member');
  }
  
  return await response.json();
}

/**
 * Remove a team member
 */
export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<void> {
  const response = await authedFetch('/api/crm/teams/member/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      team_id: teamId,
      user_id: userId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove team member');
  }
}

