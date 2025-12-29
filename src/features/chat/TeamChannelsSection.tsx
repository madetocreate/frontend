'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HashtagIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { fetchTeamChannels, createTeamChannel, type TeamChannel } from '@/lib/api/teamChannelsClient';
import { fetchTeams, type Team } from '@/lib/api/teamsClient';
import { useAuth } from '@/contexts/AuthContext';

export function TeamChannelsSection({ defaultExpanded = true }: { defaultExpanded?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const userId = user?.id;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch data individually to handle partial failures
      const channelsPromise = fetchTeamChannels(undefined, userId).catch(err => {
        console.warn('Failed to fetch channels:', err);
        return [] as TeamChannel[];
      });

      const teamsPromise = fetchTeams().catch(err => {
        console.warn('Failed to fetch teams:', err);
        return [] as Team[];
      });

      const [channelsData, teamsData] = await Promise.all([
        channelsPromise,
        teamsPromise,
      ]);

      setChannels(channelsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Unexpected error in loadData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (channel: TeamChannel) => {
    router.push(`/chat?thread=${channel.session_id}&type=team_channel`);
  };

  const handleCreateChannel = async (teamId: string, channelName: string) => {
    if (!userId) return;
    
    try {
      const newChannel = await createTeamChannel({
        team_id: teamId,
        channel_name: channelName,
        title: `#${channelName}`,
        visibility: 'team',
        created_by: userId,
      });
      setChannels([...channels, newChannel]);
      setShowCreateModal(false);
      router.push(`/chat?thread=${newChannel.session_id}&type=team_channel`);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  // Group channels by team
  const channelsByTeam = channels.reduce((acc, channel) => {
    const teamId = channel.team_id || 'unknown';
    if (!acc[teamId]) {
      acc[teamId] = [];
    }
    acc[teamId].push(channel);
    return acc;
  }, {} as Record<string, TeamChannel[]>);

  return (
    <div className="mb-4">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors cursor-pointer"
      >
        <span>Team Channels</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateModal(true);
            }}
            className="p-1 hover:bg-[var(--ak-color-bg-surface-muted)] rounded"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
          {expanded ? (
            <ChevronDownIcon className="h-3.5 w-3.5" />
          ) : (
            <ChevronRightIcon className="h-3.5 w-3.5" />
          )}
        </div>
      </div>

      {/* Channels List */}
      {expanded && (
        <div className="mt-1 space-y-0.5">
          {loading ? (
            <div className="px-3 py-2 text-xs text-[var(--ak-color-text-muted)]">
              Lade Channels...
            </div>
          ) : Object.keys(channelsByTeam).length === 0 ? (
            <div className="px-3 py-2 text-xs text-[var(--ak-color-text-muted)]">
              Keine Team-Channels vorhanden
            </div>
          ) : (
            Object.entries(channelsByTeam).map(([teamId, teamChannels]) => {
              const team = teams.find((t) => t.id === teamId);
              const teamName = team?.name || teamChannels[0]?.team_name || 'Unknown Team';

              return (
                <div key={teamId} className="mb-3">
                  {/* Team Name */}
                  <div className="px-3 py-1 text-xs font-medium text-[var(--ak-color-text-muted)]">
                    {teamName}
                  </div>

                  {/* Team's Channels */}
                  {teamChannels.map((channel) => (
                    <button
                      key={channel.session_id}
                      onClick={() => handleChannelClick(channel)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] rounded-lg transition-colors group"
                    >
                      <HashtagIcon className="h-4 w-4 flex-shrink-0 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-accent)]" />
                      <span className="truncate">{channel.channel_name}</span>
                      {channel.message_count > 0 && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)]">
                          {channel.message_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          teams={teams}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}

function CreateChannelModal({
  teams,
  onClose,
  onCreate,
}: {
  teams: Team[];
  onClose: () => void;
  onCreate: (teamId: string, channelName: string) => void;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [channelName, setChannelName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !channelName.trim()) return;
    onCreate(selectedTeamId, channelName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
  };

  return (
    <div className="fixed inset-0 bg-[var(--ak-color-bg-app)]/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)] max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)]">
            Neuen Channel erstellen
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
              Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-lg text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)]"
              required
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
              Channel-Name
            </label>
            <div className="flex items-center">
              <span className="text-[var(--ak-color-text-muted)] mr-1">#</span>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="z.B. general"
                className="flex-1 px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-lg text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)]"
                required
              />
            </div>
            <p className="text-xs text-[var(--ak-color-text-muted)] mt-1">
              Nur Kleinbuchstaben, Zahlen, Bindestriche und Unterstriche
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--ak-color-text-inverted)] bg-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-strong)] rounded-lg transition-colors"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

