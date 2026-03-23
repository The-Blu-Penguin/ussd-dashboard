<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalItems: number
  itemsPerPage?: number
}>()

const emit = defineEmits<{ (e: 'page-change', page: number): void }>()

const itemsPerPageVal = computed(() => props.itemsPerPage ?? 10)
const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPageVal.value))
const startItem = computed(() => ((props.currentPage - 1) * itemsPerPageVal.value) + 1)
const endItem = computed(() => Math.min(props.currentPage * itemsPerPageVal.value, props.totalItems))

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) emit('page-change', page)
}
</script>

<template>
  <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
    <span class="text-xs text-gray-500">
      Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} entries
    </span>
    <div class="flex items-center space-x-2">
      <button 
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      
      <button 
        v-for="page in Math.min(totalPages, 3)" 
        :key="page"
        @click="handlePageChange(page)"
        class="px-3 py-1 text-xs font-medium rounded-md shadow-sm transition-colors"
        :class="currentPage === page ? 'text-white bg-vibes-600 border border-vibes-600' : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'"
      >
        {{ page }}
      </button>
      <span v-if="totalPages > 3" class="text-gray-400 text-xs">...</span>
      
      <button 
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  </div>
</template>
