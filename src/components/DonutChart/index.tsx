import { View, Text, Canvas } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { formatAmount } from '@/utils/amount'
import './index.scss'

export interface DonutSegment {
  name: string
  amount: number
  percent: number
  color: string
}

interface DonutChartProps {
  total: number
  label: string
  segments: DonutSegment[]
}

const RING_OUTER = 140
const RING_INNER = 72
const CANVAS_SIZE = 280

export default function DonutChart({ total, label, segments }: DonutChartProps) {
  const hasData = segments.length > 0

  useEffect(() => {
    if (!hasData) return

    const query = Taro.createSelectorQuery()
    query.select('#donut-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = CANVAS_SIZE * dpr
        canvas.height = CANVAS_SIZE * dpr
        ctx.scale(dpr, dpr)

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        const cx = CANVAS_SIZE / 2
        const cy = CANVAS_SIZE / 2
        let startAngle = -Math.PI / 2

        segments.forEach(seg => {
          const sweepAngle = (seg.percent / 100) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(cx, cy, RING_OUTER, startAngle, startAngle + sweepAngle)
          ctx.arc(cx, cy, RING_INNER, startAngle + sweepAngle, startAngle, true)
          ctx.closePath()
          ctx.fillStyle = seg.color
          ctx.fill()
          startAngle += sweepAngle
        })
      })
  }, [segments, total, label, hasData])

  return (
    <View className='donut-chart'>
      <View className='donut-chart__ring'>
        {hasData ? (
          <Canvas type='2d' id='donut-canvas' className='donut-chart__canvas' />
        ) : (
          <View className='donut-chart__placeholder' />
        )}
        <View className='donut-chart__hole'>
          <Text className='donut-chart__label'>{label}</Text>
          <Text className='donut-chart__total'>{formatAmount(total)}</Text>
        </View>
      </View>
    </View>
  )
}
