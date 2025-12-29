import { render } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

function TestHarness({
  shortcuts,
}: {
  shortcuts: Parameters<typeof useKeyboardShortcuts>[0]['shortcuts']
}) {
  useKeyboardShortcuts({ shortcuts })
  return <input aria-label="test-input" />
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('triggert j ohne allowInInput NICHT, wenn Fokus in <input> ist', () => {
    const action = vi.fn()
    const { getByLabelText } = render(
      <TestHarness
        shortcuts={[
          {
            key: 'j',
            action,
          },
        ]}
      />
    )

    const input = getByLabelText('test-input') as HTMLInputElement
    input.focus()

    fireEvent.keyDown(input, { key: 'j', bubbles: true })
    expect(action).not.toHaveBeenCalled()
  })

  it('triggert ctrlOrCmd+k MIT allowInInput auch im <input>', () => {
    const action = vi.fn()
    const { getByLabelText } = render(
      <TestHarness
        shortcuts={[
          {
            key: 'k',
            ctrlOrCmd: true,
            allowInInput: true,
            action,
          },
        ]}
      />
    )

    const input = getByLabelText('test-input') as HTMLInputElement
    input.focus()

    // In jsdom ist "Mac" typischerweise nicht gesetzt -> ctrlKey ist der ctrlOrCmd Pfad.
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true, bubbles: true })
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('event.repeat triggert standardmäßig NICHT, außer allowRepeat=true', () => {
    const action = vi.fn()
    const actionRepeat = vi.fn()

    const { getByLabelText } = render(
      <TestHarness
        shortcuts={[
          {
            key: 'k',
            ctrlOrCmd: true,
            allowInInput: true,
            action,
          },
          {
            key: 'p',
            ctrlOrCmd: true,
            allowInInput: true,
            allowRepeat: true,
            action: actionRepeat,
          },
        ]}
      />
    )

    const input = getByLabelText('test-input') as HTMLInputElement
    input.focus()

    fireEvent.keyDown(input, { key: 'k', ctrlKey: true, bubbles: true, repeat: false })
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true, bubbles: true, repeat: true })
    expect(action).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(input, { key: 'p', ctrlKey: true, bubbles: true, repeat: true })
    fireEvent.keyDown(input, { key: 'p', ctrlKey: true, bubbles: true, repeat: true })
    expect(actionRepeat).toHaveBeenCalledTimes(2)
  })
})


