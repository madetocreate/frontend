'use client'

import type { FC } from 'react'
import Image from 'next/image'
import {
  UserIcon,
  SparklesIcon,
  IdentificationIcon,
  AdjustmentsHorizontalIcon,
  LifebuoyIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export type ProfileMenuAction =
  | 'personalization'
  | 'memoryCrm'
  | 'settings'
  | 'help'
  | 'logout'
  | 'login'

export type ProfileUserState = {
  isAuthenticated: boolean
  displayName?: string | null
  email?: string | null
  avatarUrl?: string | null
  plan?: string | null
  initials?: string | null
}

type ProfileMenuProps = {
  user: ProfileUserState
  onAction?: (action: ProfileMenuAction) => void
}

export const ProfileMenu: FC<ProfileMenuProps> = ({ user, onAction }) => {
  const initials =
    user.initials ??
    (user.displayName
      ? user.displayName
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : undefined)

  const handleAction = (action: ProfileMenuAction) => {
    if (onAction) {
      onAction(action)
    }
  }

  const displayName = user.isAuthenticated
    ? user.displayName ?? user.email ?? 'Nicht angemeldet'
    : 'Nicht angemeldet'

  return (
    <div className="flex flex-col gap-y-3 rounded-2xl ak-bg-surface-1 p-3 shadow-xl ring-1 ring-[var(--ak-color-graphite-base)]/5">
      <div className="flex items-center gap-x-3 rounded-xl bg-[var(--ak-color-bg-surface-muted)] px-3 py-2.5">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-1 ak-border-default"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ak-color-bg-surface-muted)] text-xs font-semibold ak-text-secondary">
            {user.isAuthenticated && initials ? (
              initials
            ) : (
              <UserIcon className="h-5 w-5 ak-text-muted" aria-hidden="true" />
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
          <div className="flex items-baseline gap-x-2">
            <div className="truncate text-sm font-semibold ak-text-primary">
              {displayName}
            </div>
            {user.plan ? (
              <span className="inline-flex items-center truncate rounded-[var(--ak-radius-md)] bg-[var(--ak-accent-inbox-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--ak-accent-inbox)] ring-1 ring-[var(--ak-accent-inbox)]/25">
                {user.plan}
              </span>
            ) : null}
          </div>
          {user.isAuthenticated ? (
            user.email ? (
              <p className="truncate text-xs ak-text-secondary">{user.email}</p>
            ) : null
          ) : (
            <p className="text-xs ak-text-muted">Konto verbinden</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <ProfileMenuItem
          icon={SparklesIcon}
          title="Personalisierung"
          subtitle={user.isAuthenticated ? undefined : 'Anmeldung erforderlich'}
          disabled={!user.isAuthenticated}
          onClick={() => handleAction('personalization')}
        />
        <ProfileMenuItem
          icon={IdentificationIcon}
          title="Speicher & CRM"
          subtitle={user.isAuthenticated ? undefined : 'Anmeldung erforderlich'}
          disabled={!user.isAuthenticated}
          onClick={() => handleAction('memoryCrm')}
        />
        <ProfileMenuItem
          icon={AdjustmentsHorizontalIcon}
          title="Einstellungen"
          subtitle={user.isAuthenticated ? undefined : 'Anmeldung erforderlich'}
          disabled={!user.isAuthenticated}
          onClick={() => handleAction('settings')}
        />
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      <div className="space-y-1">
        <ProfileMenuItem
          icon={LifebuoyIcon}
          title="Hilfe & Kontakt"
          onClick={() => handleAction('help')}
        />
        {user.isAuthenticated ? (
          <ProfileMenuItem
            icon={ArrowRightOnRectangleIcon}
            title="Abmelden"
            titleClassName="text-[var(--ak-semantic-danger)]"
            iconClassName="text-[var(--ak-semantic-danger)]"
            onClick={() => handleAction('logout')}
          />
        ) : (
          <ProfileMenuItem
            icon={ArrowLeftOnRectangleIcon}
            title="Anmelden"
            titleClassName="text-[var(--ak-color-accent)]"
            iconClassName="text-[var(--ak-color-accent)]"
            onClick={() => handleAction('login')}
          />
        )}
      </div>
    </div>
  )
}

export type ItemIconComponent = typeof UserIcon

type ItemProps = {
  icon: ItemIconComponent
  title: string
  subtitle?: string
  disabled?: boolean
  onClick?: () => void
  titleClassName?: string
  iconClassName?: string
}

const ProfileMenuItem: FC<ItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  disabled,
  onClick,
  titleClassName,
  iconClassName,
}) => {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={clsx(
        'flex w-full items-center gap-x-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        disabled
          ? 'cursor-not-allowed ak-text-muted'
          : 'hover:bg-[var(--ak-color-bg-hover)] ak-text-secondary'
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--ak-color-bg-surface-muted)]">
        <Icon
          className={clsx('h-4 w-4 ak-text-secondary', iconClassName)}
          aria-hidden="true"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={clsx('truncate text-xs font-medium', titleClassName)}>
          {title}
        </span>
        {subtitle ? (
          <span className="truncate text-[11px] ak-text-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  )
}
