import { WorkbenchViewDescriptor } from "@/types/workbench";

export const WORKBENCH_VIEWS: Partial<Record<string, WorkbenchViewDescriptor>> = {
  // --- Website Bot ---
  "websiteBot:overview": {
    key: "websiteBot:overview",
    title: "Website-Bot Übersicht",
    description: "Status und Performance Ihres Chat-Widgets.",
    widgets: [
      { id: "ws-status", title: "Widget Status", kind: "status", defaultOpen: true },
      { 
        id: "ws-quick-actions", 
        title: "Schnellaktionen", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "insights", label: "Conversation Insights", intent: "analyze_insights", risk: "low" },
          { id: "open-questions", label: "Top offene Fragen", intent: "find_unanswered", risk: "low" }
        ]
      }
    ]
  },
  "websiteBot:conversations": {
    key: "websiteBot:conversations",
    title: "Website Gespräche",
    description: "Analysieren Sie die Interaktionen mit Ihren Besuchern.",
    widgets: [
      { id: "ws-sessions", title: "Sessions", kind: "collection", defaultOpen: true },
      { id: "ws-transcript", title: "Transcript", kind: "detail", defaultOpen: true, requiresSelection: true },
      { 
        id: "ws-conv-actions", 
        title: "Aktionen", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "summarize", label: "Zusammenfassen", intent: "summarize_session", requiresSelection: true },
          { id: "faq-v", label: "FAQ-Vorschläge", intent: "extract_faq", requiresSelection: true }
        ]
      }
    ]
  },
  "websiteBot:knowledge": {
    key: "websiteBot:knowledge",
    title: "Wissen & Inhalt",
    description: "Verwalten Sie die Datenbasis für den Bot.",
    widgets: [
      { id: "ws-sources", title: "Quellen", kind: "collection", defaultOpen: true, props: { type: "knowledge_source" } },
      { id: "ws-coverage", title: "Abdeckung", kind: "status", defaultOpen: true },
      { 
        id: "ws-knowledge-actions", 
        title: "Wissens-Aktionen", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "find-gaps", label: "Wissenslücken finden", intent: "identify_knowledge_gaps", risk: "medium" },
          { id: "gen-faq", label: "FAQ aus Chats generieren", intent: "generate_faq", risk: "medium" }
        ]
      }
    ]
  },
  "websiteBot:design": {
    key: "websiteBot:design",
    title: "Design & Verhalten",
    description: "Passen Sie das Erscheinungsbild des Bots an.",
    widgets: [
      { id: "ws-preview", title: "Vorschau", kind: "status", defaultOpen: true },
      { id: "ws-editor", title: "Greeting & Behavior", kind: "editor", defaultOpen: true },
      { id: "ws-design-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "gen-design", label: "Design-Vorschlag generieren", intent: "generate_design" }
      ]}
    ]
  },

  // --- Telephony Bot ---
  "telephonyBot:overview": {
    key: "telephonyBot:overview",
    title: "Telefon-Bot Übersicht",
    description: "Statistiken zu Ihren Anrufen.",
    widgets: [
      { id: "tb-status", title: "Status", kind: "status", defaultOpen: true },
      { id: "tb-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "brief", label: "Daily Call Brief", intent: "daily_call_brief" }
      ]}
    ]
  },
  "telephonyBot:conversations": {
    key: "telephonyBot:conversations",
    title: "Anrufe & Verlauf",
    description: "Analysieren Sie geführte Telefongespräche.",
    widgets: [
      { id: "tb-call-list", title: "Anrufliste", kind: "collection", defaultOpen: true },
      { id: "tb-call-detail", title: "Anruf-Details", kind: "detail", defaultOpen: true, requiresSelection: true },
      { 
        id: "tb-call-actions", 
        title: "KI-Unterstützung", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "summary", label: "Call Summary + Tasks", intent: "summarize_call", requiresSelection: true, risk: "low" },
          { id: "follow-up", label: "Follow-up Entwurf", intent: "draft_followup", requiresSelection: true, risk: "low" }
        ]
      }
    ]
  },
  "telephonyBot:knowledge": {
    key: "telephonyBot:knowledge",
    title: "Intents & Wissen",
    widgets: [
      { id: "tb-intents", title: "Intent Library", kind: "editor", defaultOpen: true },
      { id: "tb-intents-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "derive", label: "Intents aus Calls ableiten", intent: "derive_intents" }
      ]}
    ]
  },
  "telephonyBot:design": {
    key: "telephonyBot:design",
    title: "Stimme & Persona",
    widgets: [
      { id: "tb-persona", title: "Voice Persona", kind: "editor", defaultOpen: true },
      { id: "tb-persona-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "prop", label: "Persona Vorschlag", intent: "propose_persona" }
      ]}
    ]
  },

  // --- AI Shield ---
  "aiShield:overview": {
    key: "aiShield:overview",
    title: "AI-Shield Übersicht",
    description: "Überwachung und Sicherheit Ihrer KI-Infrastruktur.",
    widgets: [
      { id: "as-status", title: "Sicherheits-Status", kind: "status", defaultOpen: true },
      { 
        id: "as-quick-actions", 
        title: "Sicherheits-Aktionen", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "security-brief", label: "Daily Security Brief", intent: "generate_security_report", risk: "low" }
        ]
      }
    ]
  },
  "aiShield:registry": {
    key: "aiShield:registry",
    title: "Tool Registry",
    widgets: [
      { id: "as-tools", title: "Tools", kind: "collection", defaultOpen: true },
      { id: "as-tool-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "priv", label: "Least-Privilege Vorschlag", intent: "propose_privileges", requiresSelection: true }
      ]}
    ]
  },
  "aiShield:policies": {
    key: "aiShield:policies",
    title: "Richtlinien",
    description: "Definieren Sie Schutzregeln für Ihre Modelle.",
    widgets: [
      { id: "as-policy-list", title: "Policies", kind: "collection", defaultOpen: true },
      { id: "as-policy-editor", title: "Editor", kind: "editor", defaultOpen: true, requiresSelection: true },
      { 
        id: "as-policy-actions", 
        title: "Aktionen", 
        kind: "actions", 
        defaultOpen: true,
        actions: [
          { id: "simulate", label: "Simulieren", intent: "simulate_policy", requiresSelection: true, risk: "medium" },
          { id: "diff", label: "Diff erzeugen", intent: "generate_policy_diff", requiresSelection: true, risk: "low" }
        ]
      }
    ]
  },
  "aiShield:logs": {
    key: "aiShield:logs",
    title: "Security Logs",
    widgets: [
      { id: "as-incidents", title: "Incidents", kind: "collection", defaultOpen: true },
      { id: "as-incident-actions", title: "Aktionen", kind: "actions", defaultOpen: true, actions: [
        { id: "summary", label: "Incident Summary", intent: "summarize_incident", requiresSelection: true },
        { id: "mitigate", label: "Mitigation Checklist", intent: "generate_mitigation", requiresSelection: true }
      ]}
    ]
  }
};
