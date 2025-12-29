# 🎨 Advanced UI Features - Dokumentation

Alle neuen stylischen Frontend-Features auf einen Blick!

## 📋 Übersicht

1. **Command Palette** (upgraded) - Spotlight-Search wie Raycast
2. **Skeleton Screens** - Shimmer-Effekt für bessere Perceived Performance
3. **Page Transitions** - Smooth Animationen beim Navigieren
4. **Empty States** - Interaktive leere Zustände mit Animationen
5. **Micro-Interactions** - Hover-Effekte, Ripples, Magnetic Buttons
6. **Dark Mode** - Auto-Switching basierend auf System-Präferenz
7. **Breadcrumbs** - Navigation mit Dropdowns
8. **Drag & Drop** - Reorderable Lists, Kanban Boards, File Upload

---

## 1️⃣ Command Palette (Upgraded)

**Was ist neu:**
- Glassmorphism mit Backdrop-Blur
- Spotlight-Effekt im Hintergrund
- Spring Animations beim Öffnen
- Stagger Animation für List-Items
- Verbesserte Hover-States

**Bereits implementiert in:** `CommandPalette.tsx`

**Keine Änderung nötig** - Wurde automatisch upgraded!

---

## 2️⃣ Skeleton Screens

**Import:**
```tsx
import { 
  DashboardStatsSkeleton, 
  TableSkeleton, 
  ListSkeleton,
  CardSkeleton,
  PageSkeleton,
  TextSkeleton,
  Shimmer
} from '@/components/ui'
```

**Verwendung:**
```tsx
{loading ? (
  <DashboardStatsSkeleton />
) : (
  <ActualContent />
)}
```

**Features:**
- ✨ Shimmer-Effekt läuft durch
- 🎯 Verschiedene Varianten für Dashboard, Tables, Lists
- 📱 Responsive Design
- 🌙 Dark Mode Support

---

## 3️⃣ Page Transitions

**Import:**
```tsx
import { 
  PageTransition,
  SlideTransition,
  FadeTransition,
  ScaleTransition,
  StaggerContainer,
  StaggerItem
} from '@/components/ui'
```

**Verwendung:**
```tsx
// In Layout oder Page
<PageTransition>
  <YourPageContent />
</PageTransition>

// Für Modals/Drawers
<SlideTransition direction="right">
  <Modal />
</SlideTransition>

// Stagger Children
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card {...item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Features:**
- 🚀 Automatische Transitions beim Route-Wechsel
- 📐 4 Richtungen für Slide
- ⚡ Spring Physics
- 🎭 Stagger Animations für Listen

---

## 4️⃣ Empty States

**Import:**
```tsx
import { EmptyState, CompactEmptyState } from '@/components/ui'
```

**Verwendung:**
```tsx
<EmptyState
  type="calls"  // or 'inbox', 'chats', 'documents', 'reviews', 'users'
  title="Keine Anrufe"
  description="Du hast heute noch keine Anrufe erhalten."
  action={{ 
    label: 'Test-Anruf starten', 
    onClick: () => console.log('Action!') 
  }}
  secondaryAction={{ 
    label: 'Dokumentation', 
    onClick: () => console.log('Docs!') 
  }}
/>

// Kompakte Version
<CompactEmptyState
  icon={<PhoneIcon className="h-8 w-8" />}
  message="Keine Einträge vorhanden"
  action={{ label: 'Neu erstellen', onClick: () => {} }}
/>
```

**Features:**
- 🎨 Animated Icons mit Glow-Effekt
- 🎯 Vordefinierte Types mit passenden Icons
- 📱 Primary & Secondary Actions
- 💫 Smooth Fade-in Animations

---

## 5️⃣ Micro-Interactions

**Import:**
```tsx
import { 
  HoverLift,
  HoverGlow,
  RippleButton,
  MagneticButton,
  Shake,
  Pulse,
  Bounce,
  CopyFeedback,
  HoverRotateIcon
} from '@/components/ui'
```

**Verwendung:**
```tsx
// Hover Lift (Cards)
<HoverLift>
  <Card />
</HoverLift>

// Ripple Effect Button
<RippleButton 
  onClick={() => {}}
  className="px-6 py-3 bg-blue-600 text-white rounded-xl"
>
  Click me!
</RippleButton>

// Magnetic Button (folgt Cursor)
<MagneticButton onClick={() => {}}>
  Hover me!
</MagneticButton>

// Copy Feedback
const [copied, setCopied] = useState(false)
<CopyFeedback copied={copied}>
  <button onClick={() => {
    navigator.clipboard.writeText('text')
    setCopied(true)
  }}>
    Copy
  </button>
</CopyFeedback>

// Shake (für Errors)
<Shake trigger={hasError}>
  <Input />
</Shake>

// Pulse (für Notifications)
<Pulse>
  <NotificationBadge />
</Pulse>
```

**Features:**
- 🎭 10+ verschiedene Interactions
- 🎯 Einfache Wrapper-Components
- ⚡ Performance-optimiert
- 🎨 Customizable

---

## 6️⃣ Dark Mode Auto-Switching

**Import:**
```tsx
import { DarkModeToggle, DarkModeSwitch } from '@/components/ui'
```

**Verwendung:**
```tsx
// Vollständiger Toggle (Light/System/Dark)
<DarkModeToggle />

// Einfacher Switch (Light/Dark)
<DarkModeSwitch />
```

**Features:**
- 🌓 3 Modi: Light, Dark, System
- 🔄 Auto-Switch bei System-Änderung
- 💾 LocalStorage Persistence
- 🎨 Animated Toggle mit Framer Motion
- 🌙 Smooth Transitions

**Setup:**
Stelle sicher, dass deine `tailwind.config` dark mode enabled hat:
```js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}
```

---

## 7️⃣ Breadcrumbs Navigation

**Import:**
```tsx
import { Breadcrumbs, CompactBreadcrumbs } from '@/components/ui'
```

**Verwendung:**
```tsx
const breadcrumbs = [
  { 
    label: 'Dashboard', 
    href: '/dashboard',
    icon: <HomeIcon className="h-4 w-4" />
  },
  { 
    label: 'Telephony', 
    href: '/dashboard/telephony',
    children: [ // Optional: Dropdown für Geschwister
      { label: 'Reviews', href: '/dashboard/reviews' },
      { label: 'Website', href: '/dashboard/website' }
    ]
  },
  { label: 'Calls', href: '/dashboard/telephony/calls' }
]

<Breadcrumbs items={breadcrumbs} maxItems={5} />

// Kompakte Version für Mobile
<CompactBreadcrumbs items={breadcrumbs} />
```

**Features:**
- 🏠 Home Icon
- 📱 Collapsible bei vielen Items
- 🎯 Dropdowns für Sibling-Navigation
- 🎨 Gradient für aktiven Breadcrumb
- ⚡ Smooth Hover States

---

## 8️⃣ Drag & Drop System

**Import:**
```tsx
import { 
  ReorderableList,
  DropZone,
  SortableGrid,
  DraggableCard,
  DragHandle
} from '@/components/ui'
```

### Reorderable List
```tsx
const [items, setItems] = useState([
  { id: '1', content: <div>Item 1</div> },
  { id: '2', content: <div>Item 2</div> },
])

<ReorderableList
  items={items}
  onReorder={setItems}
  renderItem={(item, isDragging) => (
    <div className={isDragging ? 'opacity-50' : ''}>
      {item.content}
    </div>
  )}
/>
```

### File Drop Zone
```tsx
<DropZone
  onDrop={(files) => {
    console.log('Uploaded:', files)
  }}
  accept="image/*"
  multiple={true}
>
  {/* Optional: Custom Content */}
  <div>Drag files here</div>
</DropZone>
```

### Kanban Board
```tsx
const [items, setItems] = useState([
  { id: '1', content: 'Task 1', column: 'Todo' },
  { id: '2', content: 'Task 2', column: 'In Progress' },
])

<SortableGrid
  items={items}
  columns={['Todo', 'In Progress', 'Done']}
  onItemMove={(itemId, newColumn) => {
    setItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, column: newColumn } : item
      )
    )
  }}
/>
```

**Features:**
- 🎯 Reorder Lists mit Drag Handles
- 📁 File Upload via Drag & Drop
- 📊 Kanban Boards
- 🎨 Visual Feedback beim Dragging
- 📱 Touch Support
- ⚡ Spring Animations

---

## 🚀 Quick Start

**1. Alle Components importieren:**
```tsx
import { 
  DashboardStatsSkeleton,
  PageTransition,
  EmptyState,
  HoverLift,
  DarkModeToggle,
  Breadcrumbs,
  ReorderableList
} from '@/components/ui'
```

**2. In deinem Dashboard verwenden:**
```tsx
export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  return (
    <PageTransition>
      <div>
        {/* Dark Mode Toggle in Header */}
        <DarkModeToggle />
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Loading State */}
        {loading ? (
          <DashboardStatsSkeleton />
        ) : data.length === 0 ? (
          <EmptyState 
            type="inbox"
            title="Keine Daten"
            action={{ label: 'Neu', onClick: () => {} }}
          />
        ) : (
          <HoverLift>
            <StatsCard />
          </HoverLift>
        )}
      </div>
    </PageTransition>
  )
}
```

---

## 🎨 Demo Page

Besuche `/demo-ui` um alle Features live zu sehen!

Die Demo-Seite zeigt:
- ✅ Alle Animations
- ✅ Interactive Examples
- ✅ Live Code Snippets
- ✅ Dark Mode Toggle
- ✅ Alle Drag & Drop Varianten

---

## 📦 Dependencies

Alle Features nutzen:
- **Framer Motion** - Für Animationen
- **Heroicons** - Für Icons
- **Next.js** - Für Routing
- **Tailwind CSS** - Für Styling

**Keine zusätzlichen Dependencies nötig!** Alles ist bereits installiert.

---

## 🎯 Best Practices

1. **Performance:**
   - Nutze Skeleton Screens statt Spinner
   - Lazy Load Components mit `next/dynamic`
   - Animations sollten < 300ms sein

2. **UX:**
   - Empty States sollten immer eine Action haben
   - Dark Mode sollte System-Präferenz respektieren
   - Micro-Interactions subtil halten (nicht übertreiben!)

3. **Accessibility:**
   - Alle Buttons haben Focus States
   - Keyboard Navigation funktioniert überall
   - Screen Reader Labels sind vorhanden

---

## 🐛 Troubleshooting

**Animationen ruckeln?**
- Stelle sicher, dass `will-change` nicht zu oft gesetzt ist
- Nutze `transform` statt `position` für Animations

**Dark Mode funktioniert nicht?**
- Check ob `darkMode: 'class'` in `tailwind.config` gesetzt ist
- HTML muss `class="dark"` haben

**Drag & Drop reagiert nicht?**
- Stelle sicher, dass Items unique IDs haben
- Check ob `cursor: grab` im CSS ist

---

## 📝 Changelog

**v1.0.0** (2025-12-25)
- ✨ Initial Release
- ✅ Command Palette Upgrade
- ✅ Skeleton Screens
- ✅ Page Transitions
- ✅ Empty States
- ✅ Micro-Interactions
- ✅ Dark Mode Auto-Switching
- ✅ Breadcrumbs
- ✅ Drag & Drop System

---

## 🙏 Credits

Designed & Built with ❤️ by Cursor AI
Inspired by: Vercel, Raycast, Linear, Apple Design

**Viel Spaß beim Stylen! 🚀**

