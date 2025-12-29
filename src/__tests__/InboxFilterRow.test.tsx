import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { AkChip } from '@/components/ui/AkChip'

type FilterOption = { label: string; value: string }

function FilterRow({
  label,
  options,
  active,
  onToggle,
}: {
  label: string
  options: FilterOption[]
  active: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <span>{label}</span>
      {options.map((opt) => (
        <AkChip
          key={opt.value}
          pressed={active.includes(opt.value)}
          onClick={() => onToggle(opt.value)}
        >
          {opt.label}
        </AkChip>
      ))}
    </div>
  )
}

describe('Inbox FilterRow', () => {
  it('toggles selection and calls onToggle', () => {
    const onToggle = vi.fn()
    render(
      <FilterRow
        label="Status"
        options={[
          { label: 'Open', value: 'open' },
          { label: 'Pending', value: 'pending' },
        ]}
        active={['open']}
        onToggle={onToggle}
      />,
    )

    const openChip = screen.getByText('Open')
    const pendingChip = screen.getByText('Pending')

    expect(openChip).toBeInTheDocument()
    expect(pendingChip).toBeInTheDocument()

    fireEvent.click(pendingChip)
    expect(onToggle).toHaveBeenCalledWith('pending')
  })
})

