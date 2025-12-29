import { AISettingsPanel } from '@/components/settings/AISettingsPanel';

export const metadata = {
  title: 'KI-Einstellungen | AKLOW',
  description: 'Steuere die Intelligence-Features von AKLOW',
};

export default function AISettingsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <AISettingsPanel />
    </div>
  );
}

