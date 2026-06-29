import Taro from '@tarojs/taro'
import { clearBudgetsForUser } from './budget'
import { reinitializeCategories } from './categories'
import { notifyDataChanged } from './data-events'
import { storage } from './storage'
import { initCloud, isCollectionNotExistError } from './cloud'
import { cancelScheduledSync, triggerFullSync } from './sync'

const MAX_BATCH = 100
const MAX_ROUNDS = 50

async function deleteCloudDocs(collection: string, userId: string): Promise<void> {
  const db = Taro.cloud.database()
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const res = await db.collection(collection)
      .where({ userId })
      .limit(MAX_BATCH)
      .get()
    const docs = res.data as Array<{ _id: string }>
    if (docs.length === 0) return
    for (const doc of docs) {
      await db.collection(collection).doc(doc._id).remove({})
    }
    if (docs.length < MAX_BATCH) return
  }
}

async function clearCloudUserData(userId: string): Promise<void> {
  const ready = await initCloud()
  if (!ready) throw new Error('云开发未就绪')

  try {
    await deleteCloudDocs('records', userId)
    await deleteCloudDocs('categories', userId)
  } catch (err) {
    if (isCollectionNotExistError(err)) return
    throw err
  }
}

function clearLocalUserData(userId: string): void {
  storage.setRecords(storage.getRecords().filter(r => r.userId !== userId))
  storage.setCategories(storage.getCategories().filter(c => c.userId !== userId))
  clearBudgetsForUser(userId)
  storage.setPendingQueue([])
  storage.removeLastSyncAt()
  storage.setCategoriesPresetVersion(0)
}

export interface ClearUserDataResult {
  localCleared: boolean
  cloudCleared: boolean
}

/** 清除该账户本地与云端数据，并恢复初始预设分类 */
export async function clearAllUserData(userId: string): Promise<ClearUserDataResult> {
  cancelScheduledSync()
  storage.setPendingQueue([])

  const network = await Taro.getNetworkType()
  let cloudCleared = false

  if (network.networkType !== 'none') {
    try {
      await clearCloudUserData(userId)
      cloudCleared = true
    } catch (err) {
      console.error('clearCloudUserData failed', err)
      throw err instanceof Error ? err : new Error('云端数据清除失败')
    }
  }

  clearLocalUserData(userId)
  reinitializeCategories(userId)
  notifyDataChanged()

  if (network.networkType !== 'none') {
    await triggerFullSync()
  }

  return { localCleared: true, cloudCleared }
}
