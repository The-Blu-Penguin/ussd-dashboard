<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalItems: number
  itemsPerPage?: number
  itemsPerPageOptions?: number[]
}>()

const emit = defineEmits<{ 
  (e: 'page-change', page: number): void
  (e: 'update:itemsPerPage', limit: number): void
}>()

const itemsPerPageVal = computed(() => props.itemsPerPage ?? 10)
const options = computed(() => props.itemsPerPageOptions ?? [10, 20, 50, 100])
const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPageVal.value))
const startItem = computed(() => ((props.currentPage - 1) * itemsPerPageVal.value) + 1)
const endItem = computed(() => Math.min(props.currentPage * itemsPerPageVal.value, props.totalItems))

// Calculate visible page numbers
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const pages: number[] = []
  
  if (total <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    let start = Math.max(2, current - 1)
    let end = Math.min(total - 1, current + 1)
    
    // Adjust range if near start or end
    if (current <= 3) {
      end = 5
    } else if (current >= total - 2) {
      start = total - 4
    }
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push(-1) // -1 represents ellipsis
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (end < total - 1) {
      pages.push(-2) // -2 represents second ellipsis
    }
    
    // Always show last page
    pages.push(total)
  }
  
  return pages
})

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) emit('page-change', page)
}

const handleLimitChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const limit = parseInt(select.value, 10)
  emit('update:itemsPerPage', limit)
  // Reset to first page when changing items per page to prevent empty states
  emit('page-change', 1)
}
</script>

<template>
  <nav class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30" aria-label="Pagination">
    <div class="flex items-center space-x-4">
      <span class="text-xs text-gray-500" role="status" aria-live="polite">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} entries
      </span>
      <div class="flex items-center space-x-2">
        <label for="items-per-page" class="text-xs text-gray-500">Rows per page:</label>
        <select 
          id="items-per-page"
          :value="itemsPerPageVal"
          @change="handleLimitChange"
          class="text-xs border-gray-200 rounded-md focus:ring-vibes-500 focus:border-vibes-500 bg-white py-1 pl-2 pr-6 text-gray-600"
          aria-label="Select number of rows per page"
        >
          <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>
    <div class="flex items-center space-x-2" role="navigation" aria-label="Pagination navigation">
      <button 
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to previous page"
        :aria-disabled="currentPage === 1"
      >
        Previous
      </button>
      
      <template v-for="page in visiblePages" :key="page">
        <!-- Ellipsis -->
        <span 
          v-if="page < 0" 
          class="text-gray-400 text-xs px-2" 
          aria-hidden="true"
        >
          ...
        </span>
        
        <!-- Page button -->
        <button 
          v-else
          @click="handlePageChange(page)"
          class="px-3 py-1 text-xs font-medium rounded-md shadow-sm transition-colors"
          :class="currentPage === page ? 'text-white bg-vibes-600 border border-vibes-600' : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'"
          :aria-label="`Go to page ${page}`"
          :aria-current="currentPage === page ? 'page' : undefined"
        >
          {{ page }}
        </button>
      </template>
      
      <button 
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages || totalPages === 0"
        class="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to next page"
        :aria-disabled="currentPage === totalPages || totalPages === 0"
      >
        Next
      </button>
    </div>
  </nav>
</template>
