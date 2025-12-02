'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAppProvider } from '@/app/app-provider'
import { useWindowWidth } from '@/components/utils/use-window-width'
import SidebarLinkGroup from './sidebar-link-group'
import SidebarLink from './sidebar-link'
import Logo from './logo'

type SidebarVariant = 'default' | 'v2'

interface SidebarProps {
  variant?: SidebarVariant
}

export default function Sidebar({ variant = 'default' }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const { sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded } = useAppProvider()
  const pathname = usePathname()
  const breakpoint = useWindowWidth()

  const expandOnly =
    !sidebarExpanded && breakpoint != null && breakpoint >= 1024 && breakpoint < 1536

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!sidebarOpen) return

      const target = event.target as Node | null
      const sidebarEl = sidebarRef.current
      const triggerEl = triggerRef.current
      if (!sidebarEl || !triggerEl || !target) return

      if (sidebarEl.contains(target) || triggerEl.contains(target)) return

      setSidebarOpen(false)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [sidebarOpen, setSidebarOpen])

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (!sidebarOpen) return
      if (event.key !== 'Escape') return
      setSidebarOpen(false)
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [sidebarOpen, setSidebarOpen])

  useEffect(() => {
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded')
    } else {
      document.body.classList.remove('sidebar-expanded')
    }
  }, [sidebarExpanded])

  const isOn = (segment: string) => pathname.startsWith(segment)

  return (
    <div className="min-w-fit">
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <div
        id="sidebar"
        ref={sidebarRef}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:translate-x-0 h-[100dvh] overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } ${
          variant === 'v2'
            ? 'border-r border-gray-200 dark:border-gray-700/60'
            : 'rounded-r-2xl shadow-xs'
        }`}
      >
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={triggerRef}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Sidebar schließen</span>
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.7 18.7 12.1 17.3 7.8 13H20v-2H7.8l4.3-4.3L10.7 5.3 4 12z" />
            </svg>
          </button>

          <Logo />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
              >
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Hauptbereich</span>
            </h3>

            <ul className="mt-3">
              <li className="mb-1 last:mb-0">
                <SidebarLink href="/chat">
                  <div className="flex items-center">
                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Chat
                    </span>
                  </div>
                </SidebarLink>
              </li>

              <SidebarLinkGroup open={isOn('/tasks')}>
                {(handleClick, openGroup) => (
                  <>
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between text-left text-gray-800 dark:text-gray-100 truncate transition ${
                        isOn('/tasks')
                          ? ''
                          : 'hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => {
                        if (expandOnly) {
                          setSidebarExpanded(true)
                        } else {
                          handleClick()
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Aufgaben
                        </span>
                      </div>
                      <div className="flex shrink-0 ml-2">
                        <svg
                          className={`w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500 transition-transform ${
                            openGroup ? 'rotate-180' : ''
                          }`}
                          viewBox="0 0 12 12"
                        >
                          <path d="M5.9 11.4.5 6 1.9 4.6l4 4 4-4L11.3 6z" />
                        </svg>
                      </div>
                    </button>
                    <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                      <ul className={`pl-8 mt-1 ${!openGroup ? 'hidden' : ''}`}>
                        <li className="mb-1 last:mb-0">
                          <SidebarLink href="/tasks/list">
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Aufgabenliste
                            </span>
                          </SidebarLink>
                        </li>
                        <li className="mb-1 last:mb-0">
                          <SidebarLink href="/tasks/kanban">
                            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Kanban
                            </span>
                          </SidebarLink>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>

              <li className="mb-1 last:mb-0">
                <SidebarLink href="/calendar">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Kalender
                  </span>
                </SidebarLink>
              </li>

              <li className="mb-1 last:mb-0">
                <SidebarLink href="/campaigns">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Kampagnen
                  </span>
                </SidebarLink>
              </li>

              <li className="mb-1 last:mb-0">
                <SidebarLink href="/memory">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Memory
                  </span>
                </SidebarLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Account</span>
            </h3>
            <ul className="mt-3">
              <li className="mb-1 last:mb-0">
                <SidebarLink href="/signin">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Anmelden
                  </span>
                </SidebarLink>
              </li>
              <li className="mb-1 last:mb-0">
                <SidebarLink href="/signup">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Registrieren
                  </span>
                </SidebarLink>
              </li>
              <li className="mb-1 last:mb-0">
                <SidebarLink href="/reset-password">
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Passwort zurücksetzen
                  </span>
                </SidebarLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Sidebar ein- oder ausklappen</span>
              <svg
                className="shrink-0 fill-current text-gray-400 dark:text-gray-500 transition-transform sidebar-expanded:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5a1 1 0 0 0 0-1.414l-4.5-4.5a1 1 0 1 0-1.414 1.414L8.586 7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
