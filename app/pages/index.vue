<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Preloader from '~/components/ui/Preloader.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import LineChart from '~/components/charts/LineChart.vue'
import { 
  Users, 
  Activity, 
  Smartphone, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-vue-next'

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})

const stats = [
  { title: 'Total Merchants', value: '2,450', change: '+12%', trend: 'up', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { title: 'Active Sessions', value: '145', change: '+24', trend: 'up', icon: Smartphone, color: 'text-purple-600 bg-purple-50' },
  { title: 'Today\'s Volume', value: 'GHS 45,231', change: '+8.2%', trend: 'up', icon: CreditCard, color: 'text-green-600 bg-green-50' },
  { title: 'Success Rate', value: '98.5%', change: '-0.5%', trend: 'down', icon: Activity, color: 'text-orange-600 bg-orange-50' },
]

const recentTransactions = [
  { id: 'TXN-892341', merchant: 'Kofi Electronics', amount: 'GHS 50.00', status: 'Success', time: '2 mins ago' },
  { id: 'TXN-892342', merchant: 'Ama Provisions', amount: 'GHS 10.00', status: 'Success', time: '5 mins ago' },
  { id: 'TXN-892343', merchant: 'Tech Solutions', amount: 'GHS 200.00', status: 'Failed', time: '12 mins ago' },
  { id: 'TXN-892344', merchant: 'Accra Mall Pharmacy', amount: 'GHS 125.50', status: 'Pending', time: '15 mins ago' },
]

const trafficData = [30, 45, 60, 50, 70, 45, 80, 95, 85, 60, 50, 40]

const chartData = computed(() => ({
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  datasets: [
    {
      label: 'USSD Requests',
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx
        const gradient = ctx.createLinearGradient(0, 0, 0, 300)
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)')
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)')
        return gradient
      },
      borderColor: '#2563eb',
      borderWidth: 2,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#2563eb',
      fill: true,
      tension: 0.4,
      data: trafficData
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#f3f4f6',
      bodyColor: '#f3f4f6',
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (context: any) => `${context.parsed.y} requests`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 11
        },
        stepSize: 20
      },
      min: 0
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <Preloader v-if="isLoading" full-screen label="Loading Dashboard..." size="lg" color="blue" />

    <div v-else class="space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p class="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
      </div>
      <div class="flex space-x-3">
         <select class="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
         </select>
         <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Generate Report
         </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
          <div class="flex justify-between items-start mb-4">
            <Skeleton width="48px" height="48px" class="rounded-lg" />
            <Skeleton width="40px" height="20px" class="rounded-full" />
          </div>
          <Skeleton width="120px" height="32px" class="mb-2" />
          <Skeleton width="80px" height="16px" />
        </div>
      </template>
      <template v-else>
        <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-lg" :class="stat.color">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
            <span class="flex items-center text-xs font-medium px-2 py-1 rounded-full" 
              :class="stat.trend === 'up' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'">
              <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="w-3 h-3 mr-1" />
              {{ stat.change }}
            </span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">{{ stat.value }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ stat.title }}</p>
        </div>
      </template>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Traffic Chart -->
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800">USSD Traffic Volume</h3>
          <button class="text-gray-400 hover:text-gray-600"><MoreHorizontal class="w-5 h-5" /></button>
        </div>
        
        <!-- Chart Visualization -->
        <div class="h-80 w-full">
           <LineChart :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Network Distribution -->
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">Network Distribution</h3>
        
        <div class="space-y-6">
           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700">MTN</span>
               <span class="font-bold text-gray-900">65%</span>
             </div>
             <div class="w-full bg-gray-100 rounded-full h-2.5">
               <div class="bg-yellow-400 h-2.5 rounded-full" style="width: 65%"></div>
             </div>
           </div>
           
           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700">Telecel</span>
               <span class="font-bold text-gray-900">25%</span>
             </div>
             <div class="w-full bg-gray-100 rounded-full h-2.5">
               <div class="bg-red-500 h-2.5 rounded-full" style="width: 25%"></div>
             </div>
           </div>

           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700">AT</span>
               <span class="font-bold text-gray-900">10%</span>
             </div>
             <div class="w-full bg-gray-100 rounded-full h-2.5">
               <div class="bg-blue-600 h-2.5 rounded-full" style="width: 10%"></div>
             </div>
           </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100">
           <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500">Total Sessions</p>
                <p class="text-xl font-bold text-gray-900">145,203</p>
              </div>
              <div class="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
                 <Smartphone class="w-5 h-5 text-gray-400" />
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
       <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
       </div>
       <div class="overflow-x-auto">
          <table class="w-full">
             <thead class="bg-gray-50/50">
                <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   <th class="px-6 py-3">Transaction ID</th>
                   <th class="px-6 py-3">Merchant</th>
                   <th class="px-6 py-3">Amount</th>
                   <th class="px-6 py-3">Status</th>
                   <th class="px-6 py-3">Time</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-50">
                <tr v-for="txn in recentTransactions" :key="txn.id" class="hover:bg-gray-50 transition-colors">
                   <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ txn.id }}</td>
                   <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ txn.merchant }}</td>
                   <td class="px-6 py-4 text-sm font-bold text-gray-900">{{ txn.amount }}</td>
                   <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        :class="{
                           'bg-green-100 text-green-800': txn.status === 'Success',
                           'bg-red-100 text-red-800': txn.status === 'Failed',
                           'bg-amber-100 text-amber-800': txn.status === 'Pending'
                        }">
                         {{ txn.status }}
                      </span>
                   </td>
                   <td class="px-6 py-4 text-sm text-gray-500">{{ txn.time }}</td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
    </div>
  </div>
</template>
