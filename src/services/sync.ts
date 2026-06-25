import { genId } from '@/utils/id'
import type { Record, Category, PendingOp } from '@/types'
import { storage } from './storage'

type Collection = PendingOp['collection']
type Action = PendingOp['action']

export function enqueueSync(
  collection: Collection,
  action: Action,
  payload: Record | Category,
): void {
  const queue = storage.getPendingQueue()
  queue.push({
    id: genId(),
    collection,
    action,
    payload,
    createdAt: new Date().toISOString(),
  })
  storage.setPendingQueue(queue)
}

export async function triggerSync(): Promise<void> {
  // Task 7 will implement cloud sync
}
