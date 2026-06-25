import Taro from '@tarojs/taro'
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

async function applyOp(op: PendingOp): Promise<void> {
  const db = Taro.cloud.database()
  const col = db.collection(op.collection)

  switch (op.action) {
    case 'create':
      await col.add({ data: op.payload })
      break
    case 'update':
      await col.doc(op.payload._id).update({ data: op.payload })
      break
    case 'delete':
      if (op.collection === 'records') {
        await col.doc(op.payload._id).update({ data: op.payload })
      } else {
        await col.doc(op.payload._id).remove({})
      }
      break
  }
}

function markLocalSynced(op: PendingOp): void {
  if (op.collection !== 'records') return

  const records = storage.getRecords()
  const index = records.findIndex(r => r._id === op.payload._id)
  if (index === -1) return

  records[index] = { ...(op.payload as Record), syncStatus: 'synced' }
  storage.setRecords(records)
}

export async function triggerSync(): Promise<void> {
  const network = await Taro.getNetworkType()
  if (network.networkType === 'none') return

  const user = storage.getUser()
  if (!user?.openid) return

  const queue = storage.getPendingQueue()
  if (queue.length === 0) return

  const remaining: PendingOp[] = []
  for (const op of queue) {
    try {
      await applyOp(op)
      markLocalSynced(op)
    } catch (err) {
      console.error('sync failed', op.id, err)
      remaining.push(op)
    }
  }

  storage.setPendingQueue(remaining)
  if (remaining.length < queue.length) {
    storage.setLastSyncAt(Date.now())
  }
}

let listenerRegistered = false

export function setupNetworkListener(): void {
  if (listenerRegistered) return
  listenerRegistered = true

  Taro.onNetworkStatusChange(res => {
    if (res.isConnected) {
      void triggerSync()
    }
  })
}
