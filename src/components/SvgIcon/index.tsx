import { Image, View } from '@tarojs/components'
import { useMemo } from 'react'
import { buildSvgDataUrl } from '@/utils/svg-icon'
import './index.scss'

interface SvgIconProps {
  paths: string
  color: string
  size?: number
  strokeWidth?: number
  className?: string
}

export default function SvgIcon({
  paths,
  color,
  size = 44,
  strokeWidth = 2.2,
  className = '',
}: SvgIconProps) {
  const src = useMemo(
    () => buildSvgDataUrl(paths, color, { strokeWidth }),
    [paths, color, strokeWidth],
  )

  return (
    <View className={`svg-icon ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image className='svg-icon__img' src={src} mode='aspectFit' svg />
    </View>
  )
}
