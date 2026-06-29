import Taro from '@tarojs/taro'
import { genId } from '@/utils/id'
import type { Record, Category, PendingOp } from '@/types'
import {
  CLOUD_DB_TIMEOUT,
  getMissingCollectionName,
  isCollectionNotExistError,
  isTimeoutError,
  withTimeout,
} from './cloud'
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

let collectionHintShown = false

function showCollectionSetupHint(missing?: string | null): void {
  if (collectionHintShown) return
  collectionHintShown = true

  const hint = missing
    ? `缺少集合「${missing}」。请在云开发控制台 → 数据库中新建：users、categories、records（共 3 个）。`
    : '请在云开发控制台 → 数据库中新建：users、categories、records（共 3 个）。'

  Taro.showModal({
    title: '数据库集合未创建',
    content: `${hint}权限建议设为「仅创建者可读写」。`,
    showCancel: false,
  })
}

async function applyOp(op: PendingOp): Promise<void> {
  await withTimeout(runOp(op), CLOUD_DB_TIMEOUT, `sync:${op.collection}`)
}

async function runOp(op: PendingOp): Promise<void> {
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
  const batch = queue.slice(0, 20)
  for (const op of batch) {
    try {
      await applyOp(op)
      markLocalSynced(op)
    } catch (err) {
      if (isTimeoutError(err)) {
        console.warn('sync timeout', op.id)
      } else {
        console.error('sync failed', op.id, err)
      }
      if (isCollectionNotExistError(err)) {
        showCollectionSetupHint(getMissingCollectionName(err))
      }
      remaining.push(op)
    }
  }

  const untouched = queue.slice(batch.length)
  storage.setPendingQueue([...remaining, ...untouched])
  if (remaining.length < batch.length) {
    storage.setLastSyncAt(Date.now())
  }
}

let listenerRegistered = false

export function setupNetworkListener(): void {
  if (listenerRegistered) return
  listenerRegistered = true

  Taro.onNetworkStatusChange(res => {
    if (res.isConnected) {
      setTimeout(() => {
        void triggerSync()
      }, 1500)
    }
  })
}
