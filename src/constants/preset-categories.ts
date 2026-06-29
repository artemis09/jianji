import type { RecordType } from '@/types'

/** 预设分类版本 — 递增后本地旧分类会被替换为新预设 */
export const CATEGORIES_PRESET_VERSION = 2

/** 主流记账工具预设分类 */
export const PRESET_CATEGORIES: Array<{
  name: string
  icon: string
  type: RecordType
  sort: number
}> = [
  // 支出 16 项
  { name: '餐饮', icon: 'dining', type: 'expense', sort: 1 },
  { name: '交通', icon: 'transport', type: 'expense', sort: 2 },
  { name: '购物', icon: 'shopping', type: 'expense', sort: 3 },
  { name: '服饰', icon: 'clothing', type: 'expense', sort: 4 },
  { name: '娱乐', icon: 'entertainment', type: 'expense', sort: 5 },
  { name: '医疗', icon: 'medical', type: 'expense', sort: 6 },
  { name: '住房', icon: 'housing', type: 'expense', sort: 7 },
  { name: '通讯', icon: 'phone', type: 'expense', sort: 8 },
  { name: '汽车', icon: 'car', type: 'expense', sort: 9 },
  { name: '人情', icon: 'social', type: 'expense', sort: 10 },
  { name: '育儿', icon: 'childcare', type: 'expense', sort: 11 },
  { name: '学习', icon: 'education', type: 'expense', sort: 12 },
  { name: '宠物', icon: 'pet', type: 'expense', sort: 13 },
  { name: '美容', icon: 'beauty', type: 'expense', sort: 14 },
  { name: '旅游', icon: 'travel', type: 'expense', sort: 15 },
  { name: '其他', icon: 'misc', type: 'expense', sort: 16 },
  // 收入 5 项
  { name: '工资', icon: 'salary', type: 'income', sort: 1 },
  { name: '兼职', icon: 'parttime', type: 'income', sort: 2 },
  { name: '理财', icon: 'finance', type: 'income', sort: 3 },
  { name: '礼金', icon: 'gift', type: 'income', sort: 4 },
  { name: '其它', icon: 'other', type: 'income', sort: 5 },
]
