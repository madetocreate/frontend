export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="ak-heading text-2xl font-bold mb-2">Offline</h1>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Du bist offline. Bitte überprüfe deine Internetverbindung.
        </p>
      </div>
    </div>
  );
}

