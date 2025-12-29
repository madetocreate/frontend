# Drawer Kit Definition of Done (DoD)

Jeder Drawer (Rechtes Panel) muss folgende Kriterien erfüllen:

## Struktur & Layout
- [ ] Nutzt `AkDrawerScaffold` als Root-Komponente.
- [ ] Header ist fixiert (`sticky top-0`) und nutzt `ak-glass`.
- [ ] Footer (falls vorhanden) ist fixiert (`sticky bottom-0`) und nutzt `ak-glass`.
- [ ] Inhalt ist scrollbar und nutzt `<ScrollShadows>` wenn nötig.

## Komponenten
- [ ] **DrawerCard:** Inhalte sind in `DrawerCard` gruppiert.
- [ ] **ActionGroup:** Aktionen sind logisch gruppiert.
- [ ] **StatusChip:** Status wird mit `StatusChip` angezeigt (nicht manuell gebaut).
- [ ] **DrawerEmptyState:** Leere Zustände nutzen die Standard-Komponente.

## Styling
- [ ] Keine Raw Tailwind Colors (`bg-white`, `text-gray-*`).
- [ ] Radius nutzt `var(--ak-radius-*)`.
- [ ] Border nutzt `var(--ak-color-border-subtle)`.

## Interaktion
- [ ] Schließen über `ESC` funktioniert (via `AkDrawerScaffold` / Global Listener).
- [ ] Loading States (Skeleton) sind implementiert.
- [ ] Error States sind implementiert.

## Beispiel

```tsx
<AkDrawerScaffold
  title="Details"
  trailing={<AkIconButton onClick={onClose}><XMarkIcon /></AkIconButton>}
>
  <ScrollShadows className="p-4 space-y-4">
    <DrawerCard title="Info">
      <MetaRow label="Status" value={<StatusChip label="Aktiv" variant="success" />} />
    </DrawerCard>
  </ScrollShadows>
</AkDrawerScaffold>
```

