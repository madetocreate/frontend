import { ChatJob } from "@/types/chatJobs";
import { WorkbenchActionDescriptor } from "@/types/workbench";
import { GatewayClient } from "@/sdk/gateway";

/**
 * Der ChatJobRunner orchestriert den Lebenszyklus eines Jobs, 
 * der von der Workbench ausgelöst wurde.
 */
export async function startChatJob(
  gatewayClient: GatewayClient,
  threadId: string,
  action: WorkbenchActionDescriptor,
  context: { module: string; viewKey: string; selectedItemId?: string; payload?: any },
  tenantId: string
): Promise<void> {
  const jobId = `job-${Date.now()}`;
  
  // 1. Job-Nachricht im Chat erzeugen (via Event)
  const job: ChatJob = {
    id: jobId,
    createdAt: Date.now(),
    status: "running",
    module: context.module as any,
    view: context.viewKey as any,
    actionId: action.id,
    label: action.label,
    context: {
      selectedItemId: context.selectedItemId,
      payload: context.payload
    }
  };

  window.dispatchEvent(new CustomEvent('aklow-chat-job-added', {
    detail: { threadId, job }
  }));

  try {
    // 2. Real Backend Call
    const response = await gatewayClient.workbenchAction({
      tenantId,
      threadId,
      module: context.module,
      viewKey: context.viewKey,
      intent: action.intent,
      selectedItemId: context.selectedItemId,
      payload: context.payload
    });

    // 3. Ergebnis-Nachricht posten
    const resultText = response.text || (response.status !== 'success' ? JSON.stringify(response) : 'OK')
    const status = response.status === 'success' ? 'done' : 'error'
    const error = response.status !== 'success' ? (response.details || response.status) : undefined

    window.dispatchEvent(new CustomEvent('aklow-chat-job-completed', {
      detail: { 
        threadId, 
        jobId, 
        resultText,
        status,
        ...(error ? { error } : {})
      }
    }));

  } catch (error: any) {
    window.dispatchEvent(new CustomEvent('aklow-chat-job-completed', {
      detail: { 
        threadId, 
        jobId, 
        error: error.message || "Unbekannter Fehler",
        status: "error"
      }
    }));
  }
}

