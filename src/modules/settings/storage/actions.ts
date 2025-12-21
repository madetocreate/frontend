import { StorageAction, StorageActionId } from './types'

export const STORAGE_ACTIONS: Record<StorageActionId, StorageAction> = {
  'storage.summarize': { id: 'storage.summarize', label: 'Kurzfassung', description: 'Inhalt kompakt zusammenfassen.' },
  'storage.extractFacts': { id: 'storage.extractFacts', label: 'Fakten extrahieren', description: 'Wichtige Details automatisch finden.' },
  'storage.saveAsMemory': { id: 'storage.saveAsMemory', label: 'Als Memory speichern', description: 'In Langzeitspeicher übernehmen.' },
  'storage.suggestTags': { id: 'storage.suggestTags', label: 'Tags vorschlagen', description: 'Kategorisierung automatisiert anregen.' },
  'storage.editMemory': { id: 'storage.editMemory', label: 'Memory bearbeiten', description: 'Inhalt der Erinnerung anpassen (Stub).' },
}
