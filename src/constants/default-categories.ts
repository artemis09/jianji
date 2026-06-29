import type { Category } from '@/types'
import { genId } from '@/utils/id'
import { PRESET_CATEGORIES } from './preset-categories'

export { PRESET_CATEGORIES }

export function createDefaultCategories(userId: string): Category[] {
  return PRESET_CATEGORIES.map(cat => ({
    _id: genId(),
    userId,
    name: cat.name,
    icon: cat.icon,
    type: cat.type,
    sort: cat.sort,
    isDefault: true,
  }))
}
