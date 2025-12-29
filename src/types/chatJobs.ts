import { ModuleKey, ViewKey } from "./workbench";

export interface ChatJob {
  id: string;
  createdAt: number;
  status: "queued" | "running" | "done" | "error";
  module: ModuleKey;
  view: ViewKey;
  actionId: string;
  label: string;
  context?: { 
    selectedItemId?: string; 
    payload?: any;
  };
  resultMessageId?: string;
  error?: string;
}

