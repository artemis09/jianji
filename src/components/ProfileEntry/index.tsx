import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/contexts/AuthContext'
import './index.scss'

export default function ProfileEntry() {
  const { user } = useAuth()

  return (
    <View className='profile-entry'>
      <Text className='profile-entry__title'>简记</Text>
      <View
        className='profile-entry__mine pressable'
        onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })}
      >
        {user?.avatarUrl ? (
          <Image className='profile-entry__avatar' src={user.avatarUrl} />
        ) : (
          <View className='profile-entry__avatar profile-entry__avatar--placeholder'>
            <Text>我</Text>
          </View>
        )}
        <Text className='profile-entry__label'>我的</Text>
      </View>
    </View>
  )
}
