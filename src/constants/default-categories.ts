import type { Category, RecordType } from '@/types'

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const PRESET_CATEGORIES: Array<{
  name: string
  icon: string
  type: RecordType
  sort: number
}> = [
  { name: '餐饮', icon: '🍜', type: 'expense', sort: 1 },
  { name: '交通', icon: '🚇', type: 'expense', sort: 2 },
  { name: '购物', icon: '🛒', type: 'expense', sort: 3 },
  { name: '居住', icon: '🏠', type: 'expense', sort: 4 },
  { name: '娱乐', icon: '🎮', type: 'expense', sort: 5 },
  { name: '医疗', icon: '💊', type: 'expense', sort: 6 },
  { name: '其他', icon: '', type: 'expense', sort: 7 },
  { name: '工资', icon: '💰', type: 'income', sort: 1 },
  { name: '兼职', icon: '💼', type: 'income', sort: 2 },
  { name: '其他', icon: '', type: 'income', sort: 3 },
]

export function createDefaultCategories(userId: string): Category[] {
  return PRESET_CATEGORIES.map((cat) => ({
    _id: genId(),
    userId,
    name: cat.name,
    icon: cat.icon,
    type: cat.type,
    sort: cat.sort,
    isDefault: true,
  }))
}
