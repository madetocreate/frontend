import { WebsiteChatKitPanel } from "@/components/WebsiteChatKitPanel"

export default function WebsiteAssistantPage() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="h-[560px] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <WebsiteChatKitPanel />
      </div>
    </main>
  )
}
