<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Preloader from '~/components/ui/Preloader.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
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
  // Simulate network request loading time
  setTimeout(() => {
    isLoading.value = false
  }, 300) // Reduced loading simulation from 1500ms to 300ms for snappier feeling
})

const stats = [
  { title: 'Total Merchants', value: '2,450', change: '+12%', trend: 'up', icon: Users, color: 'text-blue-100 bg-vibes-500/20', cardClass: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { title: 'Active Sessions', value: '145', change: '+24', trend: 'up', icon: Smartphone, color: 'text-purple-100 bg-purple-500/20', cardClass: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { title: 'Today\'s Volume', value: 'GHS 45,231', change: '+8.2%', trend: 'up', icon: CreditCard, color: 'text-emerald-100 bg-emerald-500/20', cardClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  { title: 'Success Rate', value: '98.5%', change: '-0.5%', trend: 'down', icon: Activity, color: 'text-orange-100 bg-orange-500/20', cardClass: 'bg-gradient-to-br from-orange-500 to-orange-600' },
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
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Overview</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening today.</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
         <select class="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-vibes-500 focus:border-vibes-500 block px-4 py-2">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
         </select>
         <button class="flex-1 sm:flex-none bg-vibes-600 hover:bg-vibes-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Generate Report
         </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <Shimmer width="48px" height="48px" class="rounded-lg" />
            <Shimmer width="40px" height="20px" class="rounded-full" />
          </div>
          <Shimmer width="120px" height="32px" class="mb-2" />
          <Shimmer width="80px" height="16px" />
        </div>
      </template>
      <template v-else>
        <div v-for="(stat, index) in stats" :key="index" 
             class="relative overflow-hidden p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
             :class="stat.cardClass">
          
          <!-- Texture Pattern Overlay -->
          <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
          <!-- Soft glow effects -->
          <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
          <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

          <div class="relative z-10">
            <div class="flex justify-between items-start mb-4">
              <div class="p-3 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner" :class="stat.color">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <span class="flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="w-3 h-3 mr-1" />
                {{ stat.change }}
              </span>
            </div>
            <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ stat.value }}</h3>
            <p class="text-sm text-white/90 font-medium tracking-wide">{{ stat.title }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Traffic Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">USSD Traffic Volume</h3>
          <button class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><MoreHorizontal class="w-5 h-5" /></button>
        </div>
        
        <!-- Chart Visualization -->
        <div class="h-80 w-full">
           <LineChart :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Network Distribution -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">Network Distribution</h3>
        
        <div class="space-y-6">
           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700 dark:text-gray-300">MTN</span>
               <span class="font-bold text-gray-900 dark:text-gray-100">65%</span>
             </div>
             <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
               <div class="bg-yellow-400 h-2.5 rounded-full" style="width: 65%"></div>
             </div>
           </div>
           
           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700 dark:text-gray-300">Telecel</span>
               <span class="font-bold text-gray-900 dark:text-gray-100">25%</span>
             </div>
             <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
               <div class="bg-red-500 h-2.5 rounded-full" style="width: 25%"></div>
             </div>
           </div>

           <div>
             <div class="flex justify-between text-sm mb-2">
               <span class="font-medium text-gray-700 dark:text-gray-300">AT</span>
               <span class="font-bold text-gray-900 dark:text-gray-100">10%</span>
             </div>
             <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
               <div class="bg-vibes-600 h-2.5 rounded-full" style="width: 10%"></div>
             </div>
           </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
           <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Total Sessions</p>
                <p class="text-xl font-bold text-gray-900 dark:text-gray-100">145,203</p>
              </div>
              <div class="h-10 w-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                 <Smartphone class="w-5 h-5 text-gray-400 dark:text-gray-400" />
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
       <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Recent Transactions</h3>
          <button class="text-sm text-vibes-600 dark:text-vibes-400 hover:text-vibes-700 dark:hover:text-vibes-300 font-medium">View All</button>
       </div>
       <div class="overflow-x-auto">
          <table class="w-full">
             <thead class="bg-gray-50/50 dark:bg-gray-900/50">
                <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                   <th class="px-6 py-3">Transaction ID</th>
                   <th class="px-6 py-3">Merchant</th>
                   <th class="px-6 py-3">Amount</th>
                   <th class="px-6 py-3">Status</th>
                   <th class="px-6 py-3">Time</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
                <tr v-for="txn in recentTransactions" :key="txn.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                   <td class="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">{{ txn.id }}</td>
                   <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ txn.merchant }}</td>
                   <td class="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">{{ txn.amount }}</td>
                   <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                        :class="{
                           'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': txn.status === 'Success',
                           'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': txn.status === 'Failed',
                           'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': txn.status === 'Pending'
                        }">
                         {{ txn.status }}
                      </span>
                   </td>
                   <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ txn.time }}</td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>
    </div>
  </div>
</template>
