'use client';

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  PlusIcon, 
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { 
  fetchTeams, 
  createTeam, 
  deleteTeam,
  fetchTeamMembers,
  addTeamMember,
  removeTeamMember,
  type Team,
  type TeamMember 
} from '@/lib/api/teamsClient';
import { AkButton } from '@/components/ui/AkButton';
import { AkCard } from '@/components/ui/AkCard';
import { AkBadge } from '@/components/ui/AkBadge';
import clsx from 'clsx';

import { useAuth } from '@/contexts/AuthContext'

export function TeamsSettings() {
  const { tenantId } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await fetchTeams();
      setTeams(data);
    } catch (error) {
      console.warn('Backend teams API not available');
      if (!tenantId) {
        setTeams([]);
        return;
      }
      // Fallback to demo data for now (only if authenticated)
      setTeams([
        {
          id: '1',
          tenant_id: tenantId,
          name: 'Sales Team',
          description: 'Vertriebsteam für DACH-Region',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_count: 5,
        },
        {
          id: '2',
          tenant_id: tenantId,
          name: 'Support Team',
          description: 'Customer Success & Support',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_count: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await fetchTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
      // Demo fallback
      setTeamMembers([
        {
          team_id: teamId,
          user_id: 'user-1',
          role: 'admin',
          created_at: new Date().toISOString(),
          user_name: 'Max Mustermann',
          user_email: 'max@example.com',
        },
        {
          team_id: teamId,
          user_id: 'user-2',
          role: 'member',
          created_at: new Date().toISOString(),
          user_name: 'Anna Schmidt',
          user_email: 'anna@example.com',
        },
      ]);
    }
  };

  const handleSelectTeam = async (team: Team) => {
    setSelectedTeam(team);
    await loadTeamMembers(team.id);
  };

  const handleCreateTeam = async (name: string, description: string) => {
    try {
      const newTeam = await createTeam({
        name,
        description,
      });
      setTeams([...teams, newTeam]);
      setShowCreateModal(false);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'success', message: 'Team erfolgreich erstellt' },
        })
      );
    } catch (error) {
      console.error('Failed to create team:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Team konnte nicht erstellt werden' },
        })
      );
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Möchtest du dieses Team wirklich löschen?')) return;
    
    try {
      await deleteTeam(teamId);
      setTeams(teams.filter(t => t.id !== teamId));
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'success', message: 'Team gelöscht' },
        })
      );
    } catch (error) {
      console.error('Failed to delete team:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Team konnte nicht gelöscht werden' },
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)]">Teams</h2>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            Organisiere deine Mitarbeiter in Teams für bessere Zusammenarbeit.
          </p>
        </div>
        <AkButton
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          accent="graphite"
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          Neues Team
        </AkButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1 space-y-3">
          {teams.length === 0 ? (
            <AkCard className="p-8 text-center flex flex-col items-center justify-center border-dashed">
              <UsersIcon className="h-10 w-10 text-[var(--ak-color-text-muted)] opacity-30 mb-3" />
              <p className="text-sm text-[var(--ak-color-text-muted)] font-medium">
                Noch keine Teams vorhanden
              </p>
            </AkCard>
          ) : (
            teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className={clsx(
                  "w-full text-left transition-all duration-200 rounded-2xl p-5 border shadow-sm group",
                  selectedTeam?.id === team.id 
                    ? "bg-[var(--ak-color-bg-surface-muted)] border-[var(--ak-color-accent-soft)] ring-1 ring-[var(--ak-color-accent-soft)]" 
                    : "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-fine)] hover:bg-[var(--ak-color-bg-hover)]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "p-2 rounded-lg transition-colors",
                      selectedTeam?.id === team.id ? "bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]" : "bg-[var(--ak-color-accent-soft)]/20 text-[var(--ak-color-accent)]"
                    )}>
                      <UsersIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--ak-color-text-primary)] text-[15px]">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <AkBadge tone="neutral" size="sm">{team.member_count || 0} Mitglieder</AkBadge>
                        {team.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--ak-semantic-success)]" />}
                      </div>
                    </div>
                  </div>
                </div>
                {team.description && (
                  <p className="text-sm text-[var(--ak-color-text-muted)] line-clamp-2 mt-3 font-medium opacity-80">
                    {team.description}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <TeamDetailsPanel
              team={selectedTeam}
              members={teamMembers}
              onDelete={() => handleDeleteTeam(selectedTeam.id)}
              onAddMember={async (userId, role) => {
                try {
                  await addTeamMember({
                    team_id: selectedTeam.id,
                    user_id: userId,
                    role,
                  });
                  await loadTeamMembers(selectedTeam.id);
                } catch (error) {
                  console.error('Failed to add member:', error);
                }
              }}
              onRemoveMember={async (userId) => {
                try {
                  await removeTeamMember(selectedTeam.id, userId);
                  await loadTeamMembers(selectedTeam.id);
                } catch (error) {
                  console.error('Failed to remove member:', error);
                }
              }}
            />
          ) : (
            <AkCard className="p-12 text-center h-full flex flex-col items-center justify-center border-dashed">
              <div className="w-20 h-20 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center mb-6">
                <UsersIcon className="h-10 w-10 text-[var(--ak-color-text-muted)] opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-2">
                Wähle ein Team aus
              </h3>
              <p className="text-sm text-[var(--ak-color-text-muted)] font-medium max-w-xs mx-auto">
                Klicke auf ein Team in der Liste, um Details und Mitglieder zu verwalten.
              </p>
            </AkCard>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
        />
      )}
    </div>
  );
}

function TeamDetailsPanel({
  team,
  members,
  onDelete,
  onAddMember,
  onRemoveMember,
}: {
  team: Team;
  members: TeamMember[];
  onDelete: () => void;
  onAddMember: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}) {
  const [showAddMember, setShowAddMember] = useState(false);

  return (
    <AkCard className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--ak-color-border-fine)] pb-6">
        <div>
          <h3 className="text-2xl font-bold text-[var(--ak-color-text-primary)] mb-1.5">
            {team.name}
          </h3>
          <p className="text-sm text-[var(--ak-color-text-muted)] font-medium">
            {team.description || 'Keine Beschreibung vorhanden.'}
          </p>
        </div>
        <AkButton
          onClick={onDelete}
          variant="ghost"
          accent="graphite"
          size="sm"
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <TrashIcon className="h-5 w-5" />
        </AkButton>
      </div>

      {/* Members Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[var(--ak-color-text-primary)] text-lg">
              Mitglieder
            </h4>
            <AkBadge tone="neutral">{members.length}</AkBadge>
          </div>
          <AkButton
            onClick={() => setShowAddMember(true)}
            variant="secondary"
            accent="graphite"
            size="sm"
            leftIcon={<UserPlusIcon className="h-4 w-4" />}
          >
            Hinzufügen
          </AkButton>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)] flex items-center justify-center text-[var(--ak-color-text-primary)] font-bold text-lg shadow-sm">
                  {member.user_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-[var(--ak-color-text-primary)] text-sm">
                    {member.user_name || 'Unbekannt'}
                  </p>
                  <p className="text-xs text-[var(--ak-color-text-muted)] font-medium">
                    {member.user_email || 'Keine Email'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AkBadge tone={member.role === 'admin' ? 'accent' : 'neutral'} size="sm">
                  {member.role === 'admin' ? 'Admin' : member.role === 'member' ? 'Mitglied' : 'Betrachter'}
                </AkBadge>
                <button
                  onClick={() => onRemoveMember(member.user_id)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-danger-soft)]/20 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-danger)] transition-all opacity-0 group-hover:opacity-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddMember && (
        <div className="border-t border-[var(--ak-color-border-fine)] pt-8 mt-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="flex items-center justify-between mb-4">
             <h4 className="font-bold text-[var(--ak-color-text-primary)]">Mitglied einladen</h4>
             <button onClick={() => setShowAddMember(false)} className="text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]">
               <XMarkIcon className="h-5 w-5" />
             </button>
           </div>
           <AddMemberForm
            onClose={() => setShowAddMember(false)}
            onAdd={onAddMember}
          />
        </div>
      )}
    </AkCard>
  );
}

function CreateTeamModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, description);
  };

  return (
    <div className="fixed inset-0 bg-[var(--ak-color-bg-app)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <AkCard className="max-w-md w-full p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">
            Neues Team erstellen
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[var(--ak-color-text-primary)] mb-2">
              Team-Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Sales Team"
              className="w-full px-4 py-2.5 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--ak-color-text-primary)] mb-2">
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was macht dieses Team?"
              className="w-full px-4 py-2.5 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <AkButton type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Abbrechen
            </AkButton>
            <AkButton type="submit" variant="primary" accent="graphite" className="flex-1">
              Erstellen
            </AkButton>
          </div>
        </form>
      </AkCard>
    </div>
  );
}

function AddMemberForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    // In production, this would look up the user by email first
    const userId = `user-${Date.now()}`;
    await onAdd(userId, role);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-[var(--ak-color-text-primary)] mb-2">
          E-Mail-Adresse
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full px-4 py-2.5 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--ak-color-text-primary)] mb-2">
          Rolle
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full px-4 py-2.5 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="viewer">Betrachter</option>
          <option value="member">Mitglied</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <AkButton type="button" variant="ghost" size="sm" className="flex-1" onClick={onClose}>
          Abbrechen
        </AkButton>
        <AkButton type="submit" variant="primary" accent="graphite" size="sm" className="flex-1">
          Einladen
        </AkButton>
      </div>
    </form>
  );
}

