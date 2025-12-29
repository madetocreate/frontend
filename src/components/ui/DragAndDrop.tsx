'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import { Bars3Icon } from '@heroicons/react/24/outline'

// Reorderable List Item
interface ReorderableItem {
  id: string
  content: ReactNode
}

interface ReorderableListProps {
  items: ReorderableItem[]
  onReorder: (items: ReorderableItem[]) => void
  renderItem?: (item: ReorderableItem, isDragging: boolean) => ReactNode
}

export function ReorderableList({ items, onReorder, renderItem }: ReorderableListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="space-y-2">
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          onDragStart={() => setDraggingId(item.id)}
          onDragEnd={() => setDraggingId(null)}
          className="list-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: draggingId === item.id ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              relative flex items-center gap-3 p-4 rounded-xl bg-[var(--ak-color-bg-surface)] 
              border border-[var(--ak-color-border-subtle)] cursor-move
              ${draggingId === item.id ? 'shadow-2xl z-50' : 'shadow-sm'}
              hover:shadow-md transition-shadow
            `}
          >
            <Bars3Icon className="h-5 w-5 text-[var(--ak-color-text-muted)] flex-shrink-0" />
            {renderItem ? renderItem(item, draggingId === item.id) : item.content}
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}

// Drag Handle Component
export function DragHandle({ className = '' }: { className?: string }) {
  const controls = useDragControls()

  return (
    <motion.div
      onPointerDown={(e) => controls.start(e)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      <Bars3Icon className="h-5 w-5 text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]" />
    </motion.div>
  )
}

// File Upload Drop Zone
interface DropZoneProps {
  onDrop: (files: FileList) => void
  accept?: string
  multiple?: boolean
  children?: ReactNode
}

export function DropZone({ onDrop, accept, multiple = true, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(e.target.files)
    }
  }

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      animate={{
        scale: isDragging ? 1.02 : 1,
        borderColor: isDragging ? '#3b82f6' : '#e5e7eb'
      }}
      className={`
        relative p-8 rounded-2xl border-2 border-dashed 
        ${isDragging ? 'border-[var(--ak-semantic-info)] bg-[var(--ak-semantic-info-soft)]' : 'border-[var(--ak-color-border-subtle)]'}
        cursor-pointer transition-all hover:border-[var(--ak-color-border-default)]
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />
      
      {/* Overlay Effect */}
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[var(--ak-semantic-info-soft)] rounded-2xl flex items-center justify-center"
        >
          <div className="text-[var(--ak-semantic-info)] font-semibold text-lg">
            📁 Dateien hier ablegen
          </div>
        </motion.div>
      )}

      {children || (
        <div className="text-center">
          <div className="text-4xl mb-4">📎</div>
          <p className="text-sm font-medium text-[var(--ak-color-text-muted)] mb-1">
            Dateien hierher ziehen oder klicken zum Auswählen
          </p>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">
            {accept ? `Unterstützte Formate: ${accept}` : 'Alle Formate unterstützt'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Draggable Card
interface DraggableCardProps {
  id: string
  children: ReactNode
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function DraggableCard({ id, children, onDragStart, onDragEnd }: DraggableCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => {
        setIsDragging(true)
        onDragStart?.()
      }}
      onDragEnd={() => {
        setIsDragging(false)
        onDragEnd?.()
      }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 3,
        zIndex: 100,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
      className={`
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-70' : 'opacity-100'}
      `}
    >
      {children}
    </motion.div>
  )
}

// Sortable Grid (Kanban-style)
interface GridItem {
  id: string
  content: ReactNode
  column: string
}

interface SortableGridProps {
  items: GridItem[]
  columns: string[]
  onItemMove: (itemId: string, newColumn: string) => void
}

export function SortableGrid({ items, columns, onItemMove }: SortableGridProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.column === column)

        return (
          <div
            key={column}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverColumn(column)
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => {
              if (draggedItem) {
                onItemMove(draggedItem, column)
                setDraggedItem(null)
                setDragOverColumn(null)
              }
            }}
            className={`
              p-4 rounded-2xl border-2 border-dashed min-h-[400px]
              ${dragOverColumn === column && draggedItem 
                ? 'border-[var(--ak-semantic-info)] bg-[var(--ak-semantic-info-soft)] dark:bg-[var(--ak-semantic-info-soft)]' 
                : 'border-[var(--ak-color-border-subtle)] dark:border-[var(--ak-color-border-strong)]'
              }
              transition-colors
            `}
          >
            <h3 className="text-lg font-bold mb-4 text-[var(--ak-color-text-primary)]">
              {column}
            </h3>
            <div className="space-y-3">
              {columnItems.map((item) => (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedItem(item.id)}
                  onDragEnd={() => setDraggedItem(null)}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 rounded-xl bg-[var(--ak-color-bg-surface)] 
                    border border-[var(--ak-color-border-subtle)] 
                    shadow-sm hover:shadow-md cursor-move
                    ${draggedItem === item.id ? 'opacity-50' : 'opacity-100'}
                    transition-all
                  `}
                >
                  {item.content}
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

