import { View, Text, Textarea } from '@tarojs/components'
import { useEffect, useState } from 'react'

interface AddFormNoteProps {
  value: string
  onChange: (value: string) => void
}

export default function AddFormNote({ value, onChange }: AddFormNoteProps) {
  const [expanded, setExpanded] = useState(!!value)

  useEffect(() => {
    if (value) setExpanded(true)
  }, [value])

  return (
    <View className='add-form__note'>
      {expanded || value ? (
        <Textarea
          className='add-form__note-input'
          placeholder='添加备注…'
          value={value}
          onInput={e => onChange(e.detail.value)}
          autoFocus={expanded && !value}
        />
      ) : (
        <View className='add-form__note-placeholder pressable' onClick={() => setExpanded(true)}>
          <Text>添加备注…</Text>
        </View>
      )}
    </View>
  )
}
