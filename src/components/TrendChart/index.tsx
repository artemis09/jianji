import { View, Text, Canvas } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface TrendPoint {
  month: string
  income: number
  expense: number
}

interface TrendChartProps {
  data: TrendPoint[]
}

const PADDING = { top: 24, right: 16, bottom: 40, left: 16 }
const CHART_WIDTH = 344
const CHART_HEIGHT = 220

export default function TrendChart({ data }: TrendChartProps) {
  const [expanded, setExpanded] = useState(false)
  const hasData = data.length > 0

  const maxValue = useMemo(() => {
    if (!hasData) return 100
    const max = Math.max(...data.map(d => Math.max(d.income, d.expense)))
    return max === 0 ? 100 : max * 1.2 // 20% headroom
  }, [data, hasData])

  useEffect(() => {
    if (!hasData || !expanded) return

    const query = Taro.createSelectorQuery()
    query.select('#trend-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = CHART_WIDTH * dpr
        canvas.height = CHART_HEIGHT * dpr
        ctx.scale(dpr, dpr)

        ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT)

        const plotW = CHART_WIDTH - PADDING.left - PADDING.right
        const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom
        const stepX = plotW / (data.length - 1 || 1)

        // Draw grid lines
        ctx.strokeStyle = 'rgba(168, 162, 158, 0.15)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 3; i++) {
          const y = PADDING.top + (plotH / 3) * i
          ctx.beginPath()
          ctx.moveTo(PADDING.left, y)
          ctx.lineTo(CHART_WIDTH - PADDING.right, y)
          ctx.stroke()
        }

        // Draw expense line
        drawLine(ctx, data, 'expense', maxValue, stepX, plotH, '#fb923c')
        // Draw income line
        drawLine(ctx, data, 'income', maxValue, stepX, plotH, '#4ade80')

        // Draw month labels
        ctx.fillStyle = '#a8a29e'
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        data.forEach((d, i) => {
          const x = PADDING.left + stepX * i
          const label = d.month.split('-')[1] + '月'
          ctx.fillText(label, x, CHART_HEIGHT - 8)
        })
      })
  }, [data, maxValue, hasData, expanded])

  if (!hasData) {
    return (
      <View className={`trend-chart ${expanded ? '' : 'trend-chart--collapsed'}`}>
        <View
          className='trend-chart__header pressable'
          onClick={() => setExpanded(v => !v)}
        >
          <Text className='trend-chart__title'>近6月趋势</Text>
          <Text className={`trend-chart__arrow ${expanded ? 'trend-chart__arrow--open' : ''}`}>▼</Text>
        </View>
        {expanded && (
          <View className='trend-chart__empty-body'>
            <Text className='trend-chart__empty-text'>暂无趋势数据</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className={`trend-chart ${expanded ? '' : 'trend-chart--collapsed'}`}>
      <View
        className='trend-chart__header pressable'
        onClick={() => setExpanded(v => !v)}
      >
        <Text className='trend-chart__title'>近6月趋势</Text>
        <Text className={`trend-chart__arrow ${expanded ? 'trend-chart__arrow--open' : ''}`}>▼</Text>
      </View>
      {expanded && (
        <>
          <View className='trend-chart__legend'>
            <View className='trend-chart__legend-item'>
              <View className='trend-chart__legend-dot' style={{ background: '#fb923c' }} />
              <Text className='trend-chart__legend-label'>支出</Text>
            </View>
            <View className='trend-chart__legend-item'>
              <View className='trend-chart__legend-dot' style={{ background: '#4ade80' }} />
              <Text className='trend-chart__legend-label'>收入</Text>
            </View>
          </View>
          <Canvas type='2d' id='trend-canvas' className='trend-chart__canvas' />
        </>
      )}
    </View>
  )
}

function drawLine(
  ctx: any,
  data: TrendPoint[],
  key: 'income' | 'expense',
  maxValue: number,
  stepX: number,
  plotH: number,
  color: string,
) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  data.forEach((d, i) => {
    const x = PADDING.left + stepX * i
    const y = PADDING.top + plotH - (d[key] / maxValue) * plotH
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Draw dots
  data.forEach((d, i) => {
    const x = PADDING.left + stepX * i
    const y = PADDING.top + plotH - (d[key] / maxValue) * plotH
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  })
}
