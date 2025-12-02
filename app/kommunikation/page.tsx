import ModularSidebar from '../../components/custom/ModularSidebar'
export default function KommunikationPage() {
  return (
    <div className="flex">
      <ModularSidebar />
      <main className="p-4 space-y-4">
        <h1 className="text-xl font-semibold mb-4">Kommunikation</h1>
        <ul className="space-y-2">
          <li>
            <a href="/messages" className="text-blue-500 underline">
              Nachrichten
            </a>
          </li>
          <li>
            <a href="/inbox" className="text-blue-500 underline">
              E-Mail
            </a>
          </li>
        </ul>
      </main>
    </div>
  )
}
