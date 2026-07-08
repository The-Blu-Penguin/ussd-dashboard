import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    const toast = useToast()
    toast.toasts.value = []
  })

  it('starts with empty toasts array', () => {
    const toast = useToast()
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('adds a toast with default type and duration', () => {
    const toast = useToast()
    toast.add('Test message')
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.message).toBe('Test message')
    expect(toast.toasts.value[0]?.type).toBe('info')
    expect(toast.toasts.value[0]?.duration).toBe(3000)
  })

  it('adds a toast with custom type and duration', () => {
    const toast = useToast()
    toast.add('Custom', 'success', 5000)
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.type).toBe('success')
    expect(toast.toasts.value[0]?.duration).toBe(5000)
  })

  it('removes a toast by id', () => {
    const toast = useToast()
    toast.add('Toast 1')
    toast.add('Toast 2')
    
    expect(toast.toasts.value).toHaveLength(2)
    
    const id = toast.toasts.value[0]!.id
    toast.remove(id)
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.message).toBe('Toast 2')
  })

  it('handles removing non-existent toast gracefully', () => {
    const toast = useToast()
    toast.add('Toast 1')
    toast.remove('non-existent-id')
    expect(toast.toasts.value).toHaveLength(1)
  })

  it('adds success toast', () => {
    const toast = useToast()
    toast.success('Success!')
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.type).toBe('success')
    expect(toast.toasts.value[0]?.duration).toBe(3000)
  })

  it('adds error toast', () => {
    const toast = useToast()
    toast.error('Error!')
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.type).toBe('error')
    expect(toast.toasts.value[0]?.duration).toBe(4000)
  })

  it('adds info toast', () => {
    const toast = useToast()
    toast.info('Info')
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.type).toBe('info')
    expect(toast.toasts.value[0]?.duration).toBe(3000)
  })

  it('adds warning toast', () => {
    const toast = useToast()
    toast.warning('Warning')
    
    expect(toast.toasts.value).toHaveLength(1)
    expect(toast.toasts.value[0]?.type).toBe('warning')
    expect(toast.toasts.value[0]?.duration).toBe(3500)
  })

  it('auto-removes toast after duration', async () => {
    vi.useFakeTimers()
    const toast = useToast()
    
    toast.add('Auto-remove', 'info', 1000)
    expect(toast.toasts.value).toHaveLength(1)
    
    vi.advanceTimersByTime(1500)
    expect(toast.toasts.value).toHaveLength(0)
    
    vi.useRealTimers()
  })

  it('does not auto-remove toast when duration is 0', async () => {
    vi.useFakeTimers()
    const toast = useToast()
    
    toast.add('Persistent', 'info', 0)
    expect(toast.toasts.value).toHaveLength(1)
    
    vi.advanceTimersByTime(10000)
    expect(toast.toasts.value).toHaveLength(1)
    
    vi.useRealTimers()
  })

  it('generates unique IDs for each toast', () => {
    const toast = useToast()
    toast.add('Toast 1')
    toast.add('Toast 2')
    toast.add('Toast 3')
    
    const ids = toast.toasts.value.map((t: any) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(3)
  })
})
