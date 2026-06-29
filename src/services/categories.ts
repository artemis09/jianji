import { createDefaultCategories } from '@/constants/default-categories'
import { PRESET_CATEGORIES, CATEGORIES_PRESET_VERSION } from '@/constants/preset-categories'
import { genId } from '@/utils/id'
import type { Category } from '@/types'
import { storage } from './storage'
import { enqueueSync, scheduleSync } from './sync'
import { notifyDataChanged } from './data-events'

function presetKey(c: { type: string; name: string }) {
  return `${c.type}:${c.name}`
}

/** 是否已包含全部最新预设项（允许存在用户自定义分类） */
function hasAllPresets(mine: Category[]): boolean {
  const keys = new Set(mine.map(c => presetKey(c)))
  return PRESET_CATEGORIES.every(p => keys.has(presetKey(p)))
}

/** 是否存在重复预设（如两个「餐饮」） */
function hasDuplicatePresets(mine: Category[]): boolean {
  return PRESET_CATEGORIES.some(p => {
    const count = mine.filter(c => c.type === p.type && c.name === p.name).length
    return count > 1
  })
}

/** 是否存在已废弃的预设分类（如「居住」） */
function hasObsoleteDefaults(mine: Category[]): boolean {
  const presetKeys = new Set(PRESET_CATEGORIES.map(p => presetKey(p)))
  return mine.some(c => c.isDefault && !presetKeys.has(presetKey(c)))
}

function needsPresetReset(userId: string): boolean {
  const version = storage.getCategoriesPresetVersion()
  if (version !== CATEGORIES_PRESET_VERSION) return true

  const mine = storage.getCategories().filter(c => c.userId === userId)
  if (!hasAllPresets(mine)) return true
  if (hasObsoleteDefaults(mine)) return true
  if (hasDuplicatePresets(mine)) return true
  return false
}

/** 删除该用户全部分类并写入最新预设 */
function replaceWithPresets(userId: string): Category[] {
  const all = storage.getCategories()
  const mine = all.filter(c => c.userId === userId)
  const others = all.filter(c => c.userId !== userId)

  for (const cat of mine) {
    enqueueSync('categories', 'delete', cat)
  }

  const fresh = createDefaultCategories(userId)
  for (const cat of fresh) {
    enqueueSync('categories', 'create', cat)
  }

  storage.setCategories([...others, ...fresh])
  storage.setCategoriesPresetVersion(CATEGORIES_PRESET_VERSION)
  scheduleSync()
  notifyDataChanged()
  return fresh
}

/** 确保仅加载当前版本预设分类（升级时清除旧分类与自定义项） */
export function initDefaultCategories(userId: string): Category[] {
  if (!needsPresetReset(userId)) {
    return storage.getCategories()
  }

  return replaceWithPresets(userId)
}

/** 清除后重建预设分类（不 enqueue 旧分类删除） */
export function reinitializeCategories(userId: string): Category[] {
  const others = storage.getCategories().filter(c => c.userId !== userId)
  const fresh = createDefaultCategories(userId)
  storage.setCategories([...others, ...fresh])
  storage.setCategoriesPresetVersion(CATEGORIES_PRESET_VERSION)
  for (const cat of fresh) {
    enqueueSync('categories', 'create', cat)
  }
  scheduleSync()
  notifyDataChanged()
  return fresh
}

function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, '').toLowerCase()
}

export function hasCategoryName(userId: string, type: Category['type'], name: string): boolean {
  const key = normalizeCategoryName(name)
  if (!key) return false
  return storage.getCategories().some(
    c => c.userId === userId
      && c.type === type
      && normalizeCategoryName(c.name) === key,
  )
}

export function addCategory(input: Omit<Category, '_id'>): Category | null {
  const name = input.name.trim()
  if (!name || hasCategoryName(input.userId, input.type, name)) {
    return null
  }

  const category: Category = {
    ...input,
    name,
    _id: genId(),
    syncStatus: 'pending',
  }
  const categories = storage.getCategories()
  storage.setCategories([...categories, category])
  enqueueSync('categories', 'create', category)
  scheduleSync()
  notifyDataChanged()
  return category
}

/** 批量更新同类型分类的 sort（与分类管理页拖拽顺序一致） */
export function reorderCategories(
  userId: string,
  type: Category['type'],
  orderedIds: string[],
): void {
  const categories = storage.getCategories()
  const sortById = new Map(orderedIds.map((id, index) => [id, index]))
  const updated: Category[] = []
  const toSync: Category[] = []

  for (const cat of categories) {
    if (cat.userId !== userId || cat.type !== type) {
      updated.push(cat)
      continue
    }
    const sort = sortById.get(cat._id)
    if (sort === undefined || cat.sort === sort) {
      updated.push(cat)
      continue
    }
    const next: Category = { ...cat, sort, syncStatus: 'pending' }
    updated.push(next)
    toSync.push(next)
  }

  if (toSync.length === 0) return

  storage.setCategories(updated)
  for (const cat of toSync) {
    enqueueSync('categories', 'update', cat)
  }
  scheduleSync()
  notifyDataChanged()
}

export function updateCategory(
  id: string,
  patch: Partial<Omit<Category, '_id'>>,
): Category | null {
  const categories = storage.getCategories()
  const index = categories.findIndex(c => c._id === id)
  if (index === -1) return null

  const updated: Category = {
    ...categories[index],
    ...patch,
    _id: categories[index]._id,
    syncStatus: 'pending',
  }
  categories[index] = updated
  storage.setCategories(categories)
  enqueueSync('categories', 'update', updated)
  scheduleSync()
  notifyDataChanged()
  return updated
}

export function deleteCategory(id: string): boolean {
  const categories = storage.getCategories()
  const category = categories.find(c => c._id === id)
  if (!category || category.isDefault) return false

  storage.setCategories(categories.filter(c => c._id !== id))
  enqueueSync('categories', 'delete', category)
  scheduleSync()
  notifyDataChanged()
  return true
}

export function getCategories(): Category[] {
  return storage.getCategories()
}

/** 与分类管理页一致的排序（按 sort 升序） */
export function getSortedCategories(
  userId: string,
  type?: Category['type'],
  source?: Category[],
): Category[] {
  let list = (source ?? storage.getCategories()).filter(c => c.userId === userId)
  if (type) list = list.filter(c => c.type === type)
  return list.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'))
}
