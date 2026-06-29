import { createDefaultCategories } from '@/constants/default-categories'
import { genId } from '@/utils/id'
import type { Category } from '@/types'
import { storage } from './storage'
import { enqueueSync, triggerSync } from './sync'

export function initDefaultCategories(userId: string): Category[] {
  const existing = storage.getCategories()
  if (existing.length > 0) return existing

  const categories = createDefaultCategories(userId)
  storage.setCategories(categories)
  for (const category of categories) {
    enqueueSync('categories', 'create', category)
  }
  return categories
}

export function addCategory(input: Omit<Category, '_id'>): Category {
  const category: Category = {
    ...input,
    _id: genId(),
  }
  const categories = storage.getCategories()
  storage.setCategories([...categories, category])
  enqueueSync('categories', 'create', category)
  void triggerSync()
  return category
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
  }
  categories[index] = updated
  storage.setCategories(categories)
  enqueueSync('categories', 'update', updated)
  void triggerSync()
  return updated
}

export function deleteCategory(id: string): boolean {
  const categories = storage.getCategories()
  const category = categories.find(c => c._id === id)
  if (!category || category.isDefault) return false

  storage.setCategories(categories.filter(c => c._id !== id))
  enqueueSync('categories', 'delete', category)
  void triggerSync()
  return true
}

export function getCategories(): Category[] {
  return storage.getCategories()
}
