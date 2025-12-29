/**
 * Service Hub Action Checker
 * 
 * Prüft, ob alle Service Hub Action IDs korrekt registriert sind:
 * - In EXECUTABLE_ACTION_IDS
 * - In ACTION_REGISTRY
 * - Im Backend Manifest (manuell prüfbar)
 * - Im Backend ACTION_WORKFLOW_MAPPING (manuell prüfbar)
 */

import { SERVICE_HUB_CARDS } from '../src/lib/hubs/serviceHubCards';
import { EXECUTABLE_ACTION_IDS, ACTION_REGISTRY } from '../src/lib/actions/registry';
import { normalizeExecutableActionId } from '../src/lib/actions/registry';

interface Issue {
  cardId: string;
  cardTitle: string;
  actionId: string;
  issue: string;
}

const issues: Issue[] = [];

console.log('🔍 Service Hub Action Checker\n');
console.log('=' .repeat(60));

// Sammle alle Action IDs aus Service Hub
const serviceHubActionIds = new Set<string>();

for (const card of SERVICE_HUB_CARDS) {
  if (card.onClickActionId && card.kind !== 'link') {
    serviceHubActionIds.add(card.onClickActionId);
    
    // Prüfe ob executable
    const normalized = normalizeExecutableActionId(card.onClickActionId);
    if (!normalized) {
      issues.push({
        cardId: card.id,
        cardTitle: card.title,
        actionId: card.onClickActionId,
        issue: 'NICHT in EXECUTABLE_ACTION_IDS',
      });
    }
    
    // Prüfe ob in ACTION_REGISTRY
    if (!ACTION_REGISTRY[card.onClickActionId as keyof typeof ACTION_REGISTRY]) {
      issues.push({
        cardId: card.id,
        cardTitle: card.title,
        actionId: card.onClickActionId,
        issue: 'NICHT in ACTION_REGISTRY',
      });
    }
  }
}

// Report
console.log(`\n📊 Statistik:`);
console.log(`   Service Hub Cards mit onClickActionId: ${serviceHubActionIds.size}`);
console.log(`   EXECUTABLE_ACTION_IDS: ${EXECUTABLE_ACTION_IDS.length}`);
console.log(`   ACTION_REGISTRY Einträge: ${Object.keys(ACTION_REGISTRY).length}`);

if (issues.length === 0) {
  console.log(`\n✅ Alle Service Hub Actions sind korrekt registriert!`);
  console.log(`\n📋 Service Hub Action IDs (${serviceHubActionIds.size}):`);
  Array.from(serviceHubActionIds).sort().forEach(id => {
    console.log(`   - ${id}`);
  });
} else {
  console.log(`\n❌ Probleme gefunden (${issues.length}):\n`);
  issues.forEach(issue => {
    console.log(`   Card: ${issue.cardTitle} (${issue.cardId})`);
    console.log(`   Action: ${issue.actionId}`);
    console.log(`   Problem: ${issue.issue}\n`);
  });
}

// Vergleich: Executable IDs, die nicht im Service Hub verwendet werden
const executableNotInServiceHub = EXECUTABLE_ACTION_IDS.filter(
  id => !serviceHubActionIds.has(id)
);
if (executableNotInServiceHub.length > 0) {
  console.log(`\n📝 Executable Actions, die NICHT im Service Hub verwendet werden:`);
  executableNotInServiceHub.forEach(id => {
    console.log(`   - ${id}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Nächste Schritte:');
console.log('   1. Prüfe Backend actions_manifest.json für fehlende Actions');
console.log('   2. Prüfe Backend ACTION_WORKFLOW_MAPPING für fehlende Mappings');
console.log('   3. Prüfe ob Workflow Templates in addons_v1.py existieren');

