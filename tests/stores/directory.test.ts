import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDirectoryStore } from '~/stores/directory'
import { createPinia, setActivePinia } from 'pinia'

const { mockApi } = vi.hoisted(() => ({ mockApi: vi.fn() }))

vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
  invalidateCache: vi.fn(),
  clearCache: vi.fn(),
}))

const sampleItem = {
  id: 'dir-1',
  merchantCode: null,
  assignedCode: '1',
  ussdCode: '*820#',
  menuConfig: {},
  menuConfigFlowId: 'flow-1',
  parentDirectoryId: null,
  parentUssdCode: null,
  path: '/1',
  level: 'PRIMARY',
  status: 'Active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  childrenCount: 0,
  createdBy: { id: 'u1', email: 'a@b.c', fullName: 'Test User' },
}

const makeResponse = (items: any[] = [sampleItem]) => ({
  success: true,
  message: 'ok',
  data: {
    content: items,
    totalPages: 1,
    totalElements: items.length,
    number: 0,
    size: 10,
  },
})

describe('useDirectoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApi.mockReset()
    mockApi.mockResolvedValue(makeResponse())
  })

  describe('activeSearchQuery tracking', () => {
    it('records the query after a search', async () => {
      const store = useDirectoryStore()

      await store.searchDirectories('acme', 0, 10)

      expect(store.activeSearchQuery).toBe('acme')
    })

    it('clears the query after a full list fetch', async () => {
      const store = useDirectoryStore()

      await store.searchDirectories('acme', 0, 10)
      await store.fetchDirectories(true, 0, 10)

      expect(store.activeSearchQuery).toBeNull()
    })
  })

  describe('cross-page search leak (regression)', () => {
    it('does not reuse another page\'s search results when mounting the list', async () => {
      const store = useDirectoryStore()

      // Simulate: user searches on the Allocate page
      await store.searchDirectories('acme', 0, 10)
      expect(store.activeSearchQuery).toBe('acme')
      mockApi.mockClear()

      // Simulate: Merchants page mounts and calls fetchDirectories(false, 0, 10)
      // with an empty local search box — it must refetch, not show Allocate's results
      await store.fetchDirectories(false, 0, 10)

      expect(mockApi).toHaveBeenCalledTimes(1)
      expect(store.activeSearchQuery).toBeNull()
    })

    it('still skips redundant fetches for the unfiltered list', async () => {
      const store = useDirectoryStore()

      await store.fetchDirectories(false, 0, 10)
      mockApi.mockClear()

      const result = await store.fetchDirectories(false, 0, 10)

      expect(mockApi).not.toHaveBeenCalled()
      expect(result.message).toBe('Directories already loaded')
    })
  })
})
