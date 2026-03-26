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
      
      <button 
        v-for="page in Math.min(totalPages, 3)" 
        :key="page"
        @click="handlePageChange(page)"
        class="px-3 py-1 text-xs font-medium rounded-md shadow-sm transition-colors"
        :class="currentPage === page ? 'text-white bg-vibes-600 border border-vibes-600' : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'"
        :aria-label="`Go to page ${page}`"
        :aria-current="currentPage === page ? 'page' : undefined"
      >
        {{ page }}
      </button>
      <span v-if="totalPages > 3" class="text-gray-400 text-xs" aria-hidden="true">...</span>
      
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
