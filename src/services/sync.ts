import Taro from '@tarojs/taro'
import { genId } from '@/utils/id'
import type { Record as BillRecord, Category, PendingOp } from '@/types'
import {
  CLOUD_DB_TIMEOUT,
  getMissingCollectionName,
  initCloud,
  isCollectionNotExistError,
  isTimeoutError,
  withTimeout,
} from './cloud'
import { storage } from './storage'

type Collection = PendingOp['collection']
type Action = PendingOp['action']

const CLOUD_RESERVED_KEYS = ['_id', '_openid'] as const
const SYNC_BATCH_SIZE = 5
const SYNC_SESSION_TIMEOUT = 20000

let collectionHintShown = false
let syncing = false
let scheduleTimer: ReturnType<typeof setTimeout> | undefined

function toCloudData(payload: BillRecord | Category): Record<string, unknown> {
  const data = { ...payload } as Record<string, unknown>
  for (const key of CLOUD_RESERVED_KEYS) {
    delete data[key]
  }
  return data
}

function dedupeQueue(queue: PendingOp[]): PendingOp[] {
  const map = new Map<string, PendingOp>()
  for (const op of queue) {
    map.set(`${op.collection}:${op.payload._id}:${op.action}`, op)
  }
  return [...map.values()]
}

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

export function enqueueSync(
  collection: Collection,
  action: Action,
  payload: BillRecord | Category,
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

/** 防抖调度同步，避免启动或操作时并发打满云 API */
export function scheduleSync(delay = 8000): void {
  if (scheduleTimer) clearTimeout(scheduleTimer)
  scheduleTimer = setTimeout(() => {
    scheduleTimer = undefined
    void triggerSync()
  }, delay)
}

async function applyOp(op: PendingOp): Promise<void> {
  await withTimeout(runOp(op), CLOUD_DB_TIMEOUT, `sync:${op.collection}`)
}

async function runOp(op: PendingOp): Promise<void> {
  const db = Taro.cloud.database()
  const col = db.collection(op.collection)
  const docId = op.payload._id
  const data = toCloudData(op.payload)

  switch (op.action) {
    case 'create':
      await col.doc(docId).set({ data })
      break
    case 'update':
      await col.doc(docId).update({ data })
      break
    case 'delete':
      if (op.collection === 'records') {
        await col.doc(docId).update({ data })
      } else {
        await col.doc(docId).remove({})
      }
      break
  }
}

function markLocalSynced(op: PendingOp): void {
  if (op.collection === 'records') {
    const records = storage.getRecords()
    const index = records.findIndex(r => r._id === op.payload._id)
    if (index === -1) return

    records[index] = { ...(op.payload as BillRecord), syncStatus: 'synced' }
    storage.setRecords(records)
  } else if (op.collection === 'categories') {
    const categories = storage.getCategories()
    const index = categories.findIndex(c => c._id === op.payload._id)
    if (index === -1) return

    categories[index] = { ...(op.payload as Category), syncStatus: 'synced' }
    storage.setCategories(categories)
  }
}

async function runSyncSession(): Promise<void> {
  const network = await Taro.getNetworkType()
  if (network.networkType === 'none') return

  const user = storage.getUser()
  if (!user?.openid) return

  const queue = dedupeQueue(storage.getPendingQueue())
  if (queue.length === 0) return

  storage.setPendingQueue(queue)
  const ready = await initCloud()
  if (!ready) return

  const remaining: PendingOp[] = []
  const batch = queue.slice(0, SYNC_BATCH_SIZE)
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
      break
    }
  }

  const untouched = queue.slice(batch.length)
  storage.setPendingQueue([...remaining, ...untouched])
  if (remaining.length < batch.length) {
    storage.setLastSyncAt(Date.now())
  }
}

export async function triggerSync(): Promise<boolean> {
  if (syncing) return false

  syncing = true
  try {
    await withTimeout(runSyncSession(), SYNC_SESSION_TIMEOUT, 'triggerSync')
    return true
  } catch (err) {
    if (isTimeoutError(err)) {
      console.warn('triggerSync session timeout')
    } else {
      console.error('triggerSync failed', err)
    }
    return false
  } finally {
    syncing = false
  }
}

export function getPendingSyncCount(): number {
  return storage.getPendingQueue().length
}

const MAX_PULL_LIMIT = 100

/** 首次启动时从云端拉取已有数据，避免新设备产生重复 */
export async function pullFromCloud(): Promise<void> {
  const network = await Taro.getNetworkType()
  if (network.networkType === 'none') return

  const user = storage.getUser()
  if (!user?.openid) return

  const ready = await initCloud()
  if (!ready) return

  const db = Taro.cloud.database()
  const hasLocalCategories = storage.getCategories().length > 0
  const hasLocalRecords = storage.getRecords().length > 0

  // 只有本地无数据时才从云端拉取（新设备首次启动）
  if (!hasLocalCategories) {
    try {
      const catRes = await db.collection('categories')
        .where({ userId: user.openid })
        .limit(MAX_PULL_LIMIT)
        .get()
      const cloudCategories = catRes.data as Category[]
      if (cloudCategories.length > 0) {
        storage.setCategories(cloudCategories)
      }
    } catch (err) {
      if (isCollectionNotExistError(err)) {
        console.warn('pull categories: collection not exist')
      } else {
        console.warn('pull categories failed', err)
      }
    }
  }

  if (!hasLocalRecords) {
    try {
      const recRes = await db.collection('records')
        .where({ userId: user.openid })
        .limit(MAX_PULL_LIMIT)
        .get()
      const cloudRecords = recRes.data as BillRecord[]
      if (cloudRecords.length > 0) {
        storage.setRecords(cloudRecords)
      }
    } catch (err) {
      if (isCollectionNotExistError(err)) {
        console.warn('pull records: collection not exist')
      } else {
        console.warn('pull records failed', err)
      }
    }
  }
}

let listenerRegistered = false
let wasConnected: boolean | null = null

export function setupNetworkListener(): void {
  if (listenerRegistered) return
  listenerRegistered = true

  void Taro.getNetworkType().then(res => {
    wasConnected = res.networkType !== 'none'
  })

  Taro.onNetworkStatusChange(res => {
    if (wasConnected === false && res.isConnected && getPendingSyncCount() > 0) {
      scheduleSync(10000)
    }
    wasConnected = res.isConnected
  })
}
