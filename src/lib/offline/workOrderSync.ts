const QUEUE_KEY = "maintenease.offline.wo-status";

export type PendingWorkOrderStatus = {
  id: string;
  status: string;
  queuedAt: string;
};

function readQueue(): PendingWorkOrderStatus[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingWorkOrderStatus[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PendingWorkOrderStatus[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function enqueueWorkOrderStatus(id: string, status: string) {
  const queue = readQueue().filter((q) => q.id !== id);
  queue.push({ id, status, queuedAt: new Date().toISOString() });
  writeQueue(queue);
}

export function getPendingWorkOrderStatuses(): PendingWorkOrderStatus[] {
  return readQueue();
}

export function clearPendingWorkOrderStatus(id: string) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

export async function flushWorkOrderStatusQueue(
  apply: (id: string, status: string) => Promise<void>,
): Promise<number> {
  const queue = readQueue();
  let synced = 0;
  for (const item of queue) {
    try {
      await apply(item.id, item.status);
      clearPendingWorkOrderStatus(item.id);
      synced += 1;
    } catch {
      break;
    }
  }
  return synced;
}
