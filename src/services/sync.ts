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
const SYNC_BATCH_SIZE = 20
const SYNC_MAX_BACKGROUND_ROUNDS = 30

export interface SyncResult {
  syncedCount: number
  remainingCount: number
  complete: boolean
}

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

function mergeOps(prev: PendingOp, next: PendingOp): PendingOp | null {
  const payload = { ...prev.payload, ...next.payload } as BillRecord | Category

  if (prev.action === 'create' && next.action === 'update') {
    return { ...next, action: 'create', payload }
  }
  if (prev.action === 'create' && next.action === 'delete') {
    return null
  }
  if (prev.action === 'update' && next.action === 'delete') {
    return { ...next, payload }
  }
  if (prev.action === 'update' && next.action === 'update') {
    return { ...next, payload }
  }
  return next
}

function dedupeQueue(queue: PendingOp[]): PendingOp[] {
  const groups = new Map<string, PendingOp[]>()
  for (const op of queue) {
    const key = `${op.collection}:${op.payload._id}`
    const list = groups.get(key) || []
    list.push(op)
    groups.set(key, list)
  }

  const merged: PendingOp[] = []
  for (const ops of groups.values()) {
    ops.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let current: PendingOp | null = ops[0]
    for (let i = 1; i < ops.length; i += 1) {
      current = current ? mergeOps(current, ops[i]) : ops[i]
    }
    if (current) merged.push(current)
  }

  return merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
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
export function cancelScheduledSync(): void {
  if (scheduleTimer) {
    clearTimeout(scheduleTimer)
    scheduleTimer = undefined
  }
}

export function scheduleSync(delay = 1500): void {
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

async function tryApplyOp(op: PendingOp): Promise<boolean> {
  try {
    await applyOp(op)
    markLocalSynced(op)
    return true
  } catch (err) {
    if (isTimeoutError(err)) {
      console.warn('sync timeout', op.id)
    } else {
      console.error('sync failed', op.id, err)
    }
    if (isCollectionNotExistError(err)) {
      showCollectionSetupHint(getMissingCollectionName(err))
    }
    return false
  }
}

/** 逐条处理队列，直到全部成功或无法继续推进 */
async function drainPendingQueue(): Promise<SyncResult> {
  let syncedCount = 0

  while (true) {
    const queue = dedupeQueue(storage.getPendingQueue())
    if (queue.length === 0) break

    storage.setPendingQueue(queue)
    const remaining: PendingOp[] = []
    let progressed = false

    for (const op of queue) {
      const ok = await tryApplyOp(op)
      if (ok) {
        syncedCount += 1
        progressed = true
      } else {
        remaining.push(op)
      }
    }

    storage.setPendingQueue(remaining)
    if (!progressed) break
  }

  const remainingCount = storage.getPendingQueue().length
  if (remainingCount === 0) {
    storage.setLastSyncAt(Date.now())
  }

  return {
    syncedCount,
    remainingCount,
    complete: remainingCount === 0,
  }
}

async function runSyncSession(): Promise<boolean> {
  const network = await Taro.getNetworkType()
  if (network.networkType === 'none') return false

  const user = storage.getUser()
  if (!user?.openid) return false

  const queue = dedupeQueue(storage.getPendingQueue())
  if (queue.length === 0) return false

  storage.setPendingQueue(queue)
  const ready = await initCloud()
  if (!ready) return false

  const remaining: PendingOp[] = []
  const batch = queue.slice(0, SYNC_BATCH_SIZE)
  let processed = 0
  for (const op of batch) {
    const ok = await tryApplyOp(op)
    if (ok) {
      processed += 1
    } else {
      remaining.push(op)
      break
    }
  }

  const untouched = queue.slice(batch.length)
  storage.setPendingQueue([...remaining, ...untouched])
  if (processed > 0) {
    storage.setLastSyncAt(Date.now())
  }
  return processed > 0
}

/** 清理云端多余分类（本地已删但云端仍残留） */
async function purgeOrphanCloudCategories(userId: string): Promise<void> {
  const ready = await initCloud()
  if (!ready) return

  const localIds = new Set(
    storage.getCategories().filter(c => c.userId === userId).map(c => c._id),
  )
  if (localIds.size === 0) return

  try {
    const db = Taro.cloud.database()
    const res = await db.collection('categories')
      .where({ userId })
      .limit(MAX_PULL_LIMIT)
      .get()
    const cloudCategories = res.data as Category[]
    for (const cat of cloudCategories) {
      if (localIds.has(cat._id)) continue
      await db.collection('categories').doc(cat._id).remove({})
    }
  } catch (err) {
    console.warn('purge orphan categories failed', err)
  }
}

/** 立即同步：一次性处理全部待同步数据 */
export async function triggerFullSync(): Promise<SyncResult> {
  if (syncing) {
    return {
      syncedCount: 0,
      remainingCount: getPendingSyncCount(),
      complete: false,
    }
  }

  syncing = true
  cancelScheduledSync()

  try {
    const network = await Taro.getNetworkType()
    if (network.networkType === 'none') {
      return {
        syncedCount: 0,
        remainingCount: getPendingSyncCount(),
        complete: false,
      }
    }

    const ready = await initCloud()
    if (!ready) {
      return {
        syncedCount: 0,
        remainingCount: getPendingSyncCount(),
        complete: false,
      }
    }

    const result = await drainPendingQueue()

    const user = storage.getUser()
    if (user?.openid && result.complete) {
      await purgeOrphanCloudCategories(user.openid)
    }

    return result
  } finally {
    syncing = false
  }
}

/** 后台增量同步（页面展示时自动触发） */
export async function triggerSync(): Promise<boolean> {
  if (syncing) return false

  syncing = true
  try {
    let rounds = 0
    let progressed = false
    while (storage.getPendingQueue().length > 0 && rounds < SYNC_MAX_BACKGROUND_ROUNDS) {
      const before = storage.getPendingQueue().length
      const ok = await runSyncSession()
      if (!ok) break
      progressed = true
      rounds += 1
      if (storage.getPendingQueue().length >= before) break
    }

    const user = storage.getUser()
    if (user?.openid && storage.getPendingQueue().length === 0) {
      await purgeOrphanCloudCategories(user.openid)
    }

    return progressed || storage.getPendingQueue().length === 0
  } finally {
    syncing = false
  }
}

export function getPendingSyncCount(): number {
  return storage.getPendingQueue().length
}

/** 合并云端记录到本地（本地 pending / deleted 优先） */
function mergeCloudRecords(userId: string, cloudRecords: BillRecord[]): void {
  const all = storage.getRecords()
  const others = all.filter(r => r.userId !== userId)
  const localMap = new Map(all.filter(r => r.userId === userId).map(r => [r._id, r]))

  for (const cloud of cloudRecords) {
    const local = localMap.get(cloud._id)
    if (!local) {
      localMap.set(cloud._id, { ...cloud, syncStatus: 'synced' })
      continue
    }
    if (local.syncStatus === 'pending' || local.syncStatus === 'deleted') continue

    const cloudUpdated = cloud.updatedAt || cloud.createdAt || ''
    const localUpdated = local.updatedAt || local.createdAt || ''
    if (cloudUpdated > localUpdated) {
      localMap.set(cloud._id, { ...cloud, syncStatus: 'synced' })
    }
  }

  storage.setRecords([...others, ...localMap.values()])
}

const MAX_PULL_LIMIT = 100

/** 登录后从云端拉取并合并数据 */
export async function pullFromCloud(): Promise<void> {
  const network = await Taro.getNetworkType()
  if (network.networkType === 'none') return

  const user = storage.getUser()
  if (!user?.openid) return

  const ready = await initCloud()
  if (!ready) return

  const db = Taro.cloud.database()
  const localCategories = storage.getCategories().filter(c => c.userId === user.openid)
  const localRecords = storage.getRecords().filter(r => r.userId === user.openid)
  const hasLocalCategories = localCategories.length > 0
  const hasLocalRecords = localRecords.length > 0

  if (!hasLocalCategories) {
    try {
      const catRes = await db.collection('categories')
        .where({ userId: user.openid })
        .limit(MAX_PULL_LIMIT)
        .get()
      const cloudCategories = catRes.data as Category[]
      if (cloudCategories.length > 0) {
        const others = storage.getCategories().filter(c => c.userId !== user.openid)
        storage.setCategories([...others, ...cloudCategories])
      }
    } catch (err) {
      if (isCollectionNotExistError(err)) {
        console.warn('pull categories: collection not exist')
      } else {
        console.warn('pull categories failed', err)
      }
    }
  }

  try {
    const recRes = await db.collection('records')
      .where({ userId: user.openid })
      .limit(MAX_PULL_LIMIT)
      .get()
    const cloudRecords = recRes.data as BillRecord[]
    if (cloudRecords.length > 0) {
      if (!hasLocalRecords) {
        storage.setRecords(cloudRecords)
      } else {
        mergeCloudRecords(user.openid, cloudRecords)
      }
    }
  } catch (err) {
    if (isCollectionNotExistError(err)) {
      console.warn('pull records: collection not exist')
    } else {
      console.warn('pull records failed', err)
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
