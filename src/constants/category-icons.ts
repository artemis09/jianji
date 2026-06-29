/** 分类图标 key — 线描 SVG */
export type CategoryIconKey =
  | 'dining'
  | 'transport'
  | 'shopping'
  | 'clothing'
  | 'entertainment'
  | 'medical'
  | 'housing'
  | 'phone'
  | 'car'
  | 'social'
  | 'childcare'
  | 'education'
  | 'pet'
  | 'beauty'
  | 'travel'
  | 'salary'
  | 'parttime'
  | 'finance'
  | 'gift'
  | 'other'
  | 'misc'
  | 'manage'

export const EXPENSE_ICON_OPTIONS: CategoryIconKey[] = [
  'dining', 'transport', 'shopping', 'clothing', 'entertainment', 'medical',
  'housing', 'phone', 'car', 'social', 'childcare', 'education', 'pet', 'beauty', 'travel',
]

export const INCOME_ICON_OPTIONS: CategoryIconKey[] = [
  'salary', 'parttime', 'finance', 'gift',
]

export const ICON_OPTION_LABELS: Record<CategoryIconKey, string> = {
  dining: '餐饮',
  transport: '交通',
  shopping: '购物',
  clothing: '服饰',
  entertainment: '娱乐',
  medical: '医疗',
  housing: '住房',
  phone: '通讯',
  car: '汽车',
  social: '人情',
  childcare: '育儿',
  education: '学习',
  pet: '宠物',
  beauty: '美容',
  travel: '旅游',
  salary: '工资',
  parttime: '兼职',
  finance: '理财',
  gift: '礼金',
  other: '其它',
  misc: '其他',
  manage: '设置',
}

const NAME_TO_ICON: Record<string, CategoryIconKey> = {
  餐饮: 'dining',
  交通: 'transport',
  购物: 'shopping',
  服饰: 'clothing',
  娱乐: 'entertainment',
  医疗: 'medical',
  居住: 'housing',
  住房: 'housing',
  通讯: 'phone',
  汽车: 'car',
  人情: 'social',
  育儿: 'childcare',
  学习: 'education',
  宠物: 'pet',
  美容: 'beauty',
  旅游: 'travel',
  工资: 'salary',
  兼职: 'parttime',
  理财: 'finance',
  礼金: 'gift',
  其他: 'misc',
  其它: 'other',
}

const VALID_KEYS = new Set<string>(Object.keys(ICON_OPTION_LABELS))

export function resolveCategoryIconKey(name: string, icon?: string): CategoryIconKey {
  if (icon && VALID_KEYS.has(icon)) return icon as CategoryIconKey
  return NAME_TO_ICON[name] || 'misc'
}
