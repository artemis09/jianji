jest.mock('@tarojs/taro', () => ({
  __esModule: true,
  default: {
    getNetworkType: jest.fn(),
    cloud: { database: jest.fn() },
    onNetworkStatusChange: jest.fn(),
  },
}))

jest.mock('@/services/storage', () => ({
  storage: {
    getPendingQueue: jest.fn(() => []),
    setPendingQueue: jest.fn(),
  },
}))

jest.mock('@/utils/id', () => ({
  genId: jest.fn(() => 'test-id'),
}))

import { enqueueSync } from '@/services/sync'
import { storage } from '@/services/storage'
import type { Record } from '@/types'

const sampleRecord: Record = {
  _id: 'r1',
  userId: 'u1',
  type: 'expense',
  amount: 1000,
  categoryId: 'c1',
  note: '',
  date: '2026-06-25',
  createdAt: '2026-06-25T00:00:00.000Z',
  updatedAt: '2026-06-25T00:00:00.000Z',
  syncStatus: 'pending',
}

describe('enqueueSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(storage.getPendingQueue as jest.Mock).mockReturnValue([])
  })

  it('adds operation to pending queue', () => {
    enqueueSync('records', 'create', sampleRecord)

    expect(storage.setPendingQueue).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'test-id',
        collection: 'records',
        action: 'create',
        payload: sampleRecord,
        createdAt: expect.any(String),
      }),
    ])
  })
})
