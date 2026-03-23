<script setup>
import { 
  X,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle
} from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  txn: Object,
  isCollapsed: Boolean
})

const emit = defineEmits(['close'])

const getStatusColor = (status) => {
  switch (status) {
    case 'Success': return 'bg-green-100 text-green-800 border-green-200'
    case 'Failed': return 'bg-red-100 text-red-800 border-red-200'
    case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status) => {
    switch (status) {
    case 'Success': return CheckCircle
    case 'Failed': return XCircle
    case 'Pending': return Clock
    default: return AlertCircle
  }
}
</script>

<template>
  <div 
    v-if="show" 
    class="fixed bottom-0 top-16 right-0 z-40 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'left-20' : 'left-64'"
  >
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-full">
      <!-- Modal Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h3 class="text-lg font-bold text-gray-800">Transaction Details</h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">{{ txn?.id }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6 overflow-y-auto" v-if="txn">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p class="text-xs text-gray-500 mb-1">Amount</p>
            <p class="text-2xl font-bold text-gray-900">{{ txn.amount }}</p>
          </div>
           <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
              :class="getStatusColor(txn.status)"
            >
              <component :is="getStatusIcon(txn.status)" class="w-3.5 h-3.5 mr-1.5" />
              {{ txn.status }}
            </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Date & Time</p>
            <p class="text-sm font-medium text-gray-900">{{ txn.date }}</p>
          </div>
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Type</p>
            <p class="text-sm font-medium text-gray-900">{{ txn.type }}</p>
          </div>
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Payment Method</p>
            <p class="text-sm font-medium text-gray-900">{{ txn.method }}</p>
          </div>
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Merchant</p>
            <p class="text-sm font-medium text-vibes-600">{{ txn.merchant }}</p>
          </div>
        </div>

        <div class="space-y-3">
           <div class="flex justify-between items-center py-2 border-b border-gray-50">
             <span class="text-sm text-gray-500">MSISDN</span>
             <span class="text-sm font-mono font-medium text-gray-900">{{ txn.msisdn }}</span>
           </div>
           <div class="flex justify-between items-center py-2 border-b border-gray-50" v-if="txn.error">
             <span class="text-sm text-gray-500">Error Message</span>
             <span class="text-sm font-medium text-red-600">{{ txn.error }}</span>
           </div>
        </div>
        
        <!-- JSON Payload Mock -->
        <div>
          <h4 class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Payload Data</h4>
          <div class="bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <pre class="text-xs text-green-400 font-mono">
{
  "transactionId": "{{ txn.id }}",
  "msisdn": "{{ txn.msisdn }}",
  "amount": "{{ txn.amount }}",
  "timestamp": "{{ txn.date }}",
  "status": "{{ txn.status }}"
}</pre>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
        <button @click="$emit('close')" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
      </div>
    </div>
  </div>
</template>
