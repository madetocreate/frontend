/**
 * Tests für ActionBar Komponente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionBar } from '@/components/actions/ActionBar'
import type { ActionContext } from '@/lib/actions/types'

// Mock dispatchActionStart
vi.mock('@/lib/actions/dispatch', () => ({
  dispatchActionStart: vi.fn(),
}))

// Mock window.dispatchEvent
beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent = vi.fn() as typeof window.dispatchEvent
  }
})

describe('ActionBar', () => {
  const validInboxContext: ActionContext = {
    target: {
      module: 'inbox',
      targetId: 'item-123',
      title: 'Test Item',
    },
    moduleContext: {
      inbox: {
        itemId: 'item-123',
        threadId: 'thread-123',
        channel: 'email',
      },
    },
  }

  it('should render primary actions for inbox', () => {
    render(<ActionBar module="inbox" context={validInboxContext} />)
    
    // Sollte mindestens eine Action anzeigen
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should filter by whitelist', () => {
    render(
      <ActionBar
        module="inbox"
        context={validInboxContext}
        whitelist={['inbox.summarize']}
      />
    )
    
    // Sollte nur "Zusammenfassen" Button zeigen
    const summarizeButton = screen.queryByText(/Zusammenfassen/i)
    expect(summarizeButton).toBeInTheDocument()
  })

  it('should filter by blacklist', () => {
    render(
      <ActionBar
        module="inbox"
        context={validInboxContext}
        blacklist={['inbox.summarize']}
      />
    )
    
    // Sollte "Zusammenfassen" NICHT zeigen
    const summarizeButton = screen.queryByText(/Zusammenfassen/i)
    expect(summarizeButton).not.toBeInTheDocument()
  })

  it('should call dispatchActionStart on button click', async () => {
    const user = userEvent.setup()
    const { dispatchActionStart } = await import('@/lib/actions/dispatch')
    
    render(<ActionBar module="inbox" context={validInboxContext} />)
    
    const button = screen.getByText(/Zusammenfassen/i)
    await user.click(button)
    
    expect(dispatchActionStart).toHaveBeenCalledWith(
      'inbox.summarize',
      validInboxContext,
      undefined,
      'ActionBar'
    )
  })

  it('should disable buttons when context is invalid', () => {
    const invalidContext: ActionContext = {
      target: {
        module: 'inbox',
      },
      moduleContext: {},
    }
    
    render(<ActionBar module="inbox" context={invalidContext} />)
    
    const buttons = screen.queryAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should show approval indicator for actions requiring approval', () => {
    render(<ActionBar module="inbox" context={validInboxContext} />)
    
    // "Antwortentwurf" benötigt Approval
    const draftButton = screen.queryByText(/Antwortentwurf/i)
    expect(draftButton).toBeInTheDocument()
    // Sollte Lock-Icon oder ähnliches haben (prüfe ob Lock-Emoji vorhanden)
    expect(draftButton?.textContent).toContain('🔒')
  })
})

