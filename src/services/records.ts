import { genId } from '@/utils/id'
import type { Record } from '@/types'
import { storage } from './storage'
import { enqueueSync, triggerSync } from './sync'

export function addRecord(
  input: Omit<Record, '_id' | 'syncStatus' | 'createdAt' | 'updatedAt'>,
): Record {
  const now = new Date().toISOString()
  const record: Record = {
    ...input,
    _id: genId(),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  }
  const records = storage.getRecords()
  storage.setRecords([record, ...records])
  enqueueSync('records', 'create', record)
  void triggerSync()
  return record
}

export function deleteRecord(id: string): void {
  const records = storage.getRecords()
  const index = records.findIndex(r => r._id === id)
  if (index === -1) return

  const now = new Date().toISOString()
  const updated: Record = {
    ...records[index],
    updatedAt: now,
    syncStatus: 'deleted',
  }
  records[index] = updated
  storage.setRecords(records)
  enqueueSync('records', 'delete', updated)
  void triggerSync()
}

export function updateRecord(
  id: string,
  patch: Partial<Omit<Record, '_id' | 'createdAt'>>,
): Record | null {
  const records = storage.getRecords()
  const index = records.findIndex(r => r._id === id)
  if (index === -1) return null

  const now = new Date().toISOString()
  const updated: Record = {
    ...records[index],
    ...patch,
    _id: records[index]._id,
    createdAt: records[index].createdAt,
    updatedAt: now,
    syncStatus: 'pending',
  }
  records[index] = updated
  storage.setRecords(records)
  enqueueSync('records', 'update', updated)
  void triggerSync()
  return updated
}

export function getRecords(): Record[] {
  return storage.getRecords()
}
