'use client'

import type { FC } from 'react'
import clsx from 'clsx'
import {
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'

export type ChatSidebarConversation = {
  id: string
  title: string
  lastMessagePreview: string
  updatedAt: string
  unreadCount?: number
  avatarInitials?: string
}

type ChatSidebarWidgetProps = {
  conversations: ChatSidebarConversation[]
  activeConversationId: string | null
  onSelectConversation: (chatId: string) => void
  onCreateNewChat?: () => void
  onSearchInChats?: () => void
  onOpenConversationMenu?: (chatId: string) => void
}

export const ChatSidebarWidget: FC<ChatSidebarWidgetProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateNewChat,
  onSearchInChats,
  onOpenConversationMenu,
}) => {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCreateNewChat}
          className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        >
          Neuer Chat
        </button>
        <button
          type="button"
          onClick={onSearchInChats}
          className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        >
          In Chats suchen
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={clsx(
                'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-800 hover:bg-slate-100'
              )}
            >
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                {conv.avatarInitials ? (
                  <span>{conv.avatarInitials}</span>
                ) : (
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold">
                    {conv.title}
                  </p>
                  <span className="flex-none text-[10px] text-slate-400">
                    {conv.updatedAt}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] text-slate-500">
                    {conv.lastMessagePreview}
                  </p>
                  {conv.unreadCount ? (
                    <span className="flex h-4 min-w-[16px] flex-none items-center justify-center rounded-full bg-[var(--ak-color-accent)] text-[9px] font-semibold text-white">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenConversationMenu?.(conv.id)
                }}
                className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Chat-Aktionen"
              >
                <EllipsisVerticalIcon className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
