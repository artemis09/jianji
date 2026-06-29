/** 分类色块 — 参考鲨鱼/随手记多彩分类识别 */
const EXPENSE_COLORS: Record<string, string> = {
  餐饮: '#FF9500',
  交通: '#3B82F6',
  购物: '#EC4899',
  居住: '#8B5CF6',
  娱乐: '#F59E0B',
  医疗: '#10B981',
  其他: '#78716C',
}

const INCOME_COLORS: Record<string, string> = {
  工资: '#22C55E',
  兼职: '#06B6D4',
  其他: '#84CC16',
}

export function getCategoryColor(name: string, type: 'expense' | 'income'): string {
  const map = type === 'income' ? INCOME_COLORS : EXPENSE_COLORS
  return map[name] || (type === 'income' ? '#22C55E' : '#FF9500')
}
