export type ModuleKey = "chat" | "inbox" | "growth" | "documents" | "customers" | "aiShield" | "telephonyBot" | "websiteBot" | "settings";

export type SubViewKey = 
  | "overview" 
  | "conversations" 
  | "knowledge" 
  | "design" 
  | "widgets" 
  | "settings" 
  | "policies" 
  | "registry" 
  | "logs";

export type ViewKey = `${ModuleKey}:${SubViewKey}`;

export interface WorkbenchActionDescriptor {
  id: string;
  label: string;
  intent: string;
  requiresSelection?: boolean;
  kind?: "button" | "checklist";
  risk?: "low" | "medium" | "high";
}

export interface WorkbenchWidgetDescriptor {
  id: string;
  title: string;
  kind: "collection" | "detail" | "editor" | "actions" | "status";
  defaultOpen?: boolean;
  requiresSelection?: boolean;
  props?: Record<string, any>;
  actions?: WorkbenchActionDescriptor[];
}

export interface WorkbenchViewDescriptor {
  key: ViewKey;
  title: string;
  description?: string;
  widgets: WorkbenchWidgetDescriptor[];
}

