<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const handleLogin = () => {
  error.value = ''

  if (!email.value) { error.value = 'Email is required'; return }
  if (!validateEmail(email.value)) { error.value = 'Please enter a valid email address'; return }
  if (!password.value) { error.value = 'Password is required'; return }

  login(email.value, password.value)
  navigateTo('/')
}

const floatingChars = ref<{
  char: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}[]>([])
const ussdChars = ['*', '8', '2', '0', '#']

const moveAway = (index: number, event: MouseEvent) => {
  const char = floatingChars.value[index]
  if (!char) return
  
  // Get viewport dimensions
  const vw = window.innerWidth
  const vh = window.innerHeight
  
  // Convert percentage position to pixels
  const currentX = (char.left / 100) * vw
  const currentY = (char.top / 100) * vh
  
  // Mouse position
  const mouseX = event.clientX
  const mouseY = event.clientY
  
  // Calculate distance
  const dx = currentX - mouseX
  const dy = currentY - mouseY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Repel radius (increase for stronger effect)
  const radius = 200
  
  if (distance < radius) {
    // Calculate repel angle
    const angle = Math.atan2(dy, dx)
    
    // Move significantly away (e.g., 100px)
    const moveDistance = 100
    const moveX = Math.cos(angle) * moveDistance
    const moveY = Math.sin(angle) * moveDistance
    
    // Update position back to percentage
    const newLeft = ((currentX + moveX) / vw) * 100
    const newTop = ((currentY + moveY) / vh) * 100
    
    char.left = Math.max(0, Math.min(100, newLeft))
    char.top = Math.max(0, Math.min(100, newTop))
  }
}

onMounted(() => {
  // Generate random floating characters
  for (let i = 0; i < 15; i++) {
    const randomChar = ussdChars[Math.floor(Math.random() * ussdChars.length)] || '*'
    floatingChars.value.push({
      char: randomChar,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 60 + 40, // 40px to 100px (Even Bigger)
      duration: Math.random() * 20 + 10, // Slower float
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1
    })
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#ecf5fb] relative overflow-hidden font-sans p-4">
    <div class="absolute top-0 right-0 w-96 h-96 bg-[#3dd5f3] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 transform rotate-45 pointer-events-none" />
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-[#ffa48d] rounded-full blur-[100px] opacity-30 -ml-20 -mb-20 pointer-events-none" />

    <!-- Floating USSD Characters -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
      <div v-for="(item, index) in floatingChars" :key="index"
           class="absolute font-mono font-bold text-blue-500 animate-float transition-all duration-500 ease-out pointer-events-auto"
           @mousemove="moveAway(index, $event)"
           :style="{
             left: `${item.left}%`,
             top: `${item.top}%`,
             fontSize: `${item.size}px`,
             animationDuration: `${item.duration}s`,
             animationDelay: `${item.delay}s`,
             opacity: item.opacity
           }">
        {{ item.char }}
      </div>
    </div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] p-8 sm:p-12 z-20 border border-white/50 backdrop-blur-lg">
      <div class="flex flex-col items-center mb-8">
        <div class="w-16 h-16 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <img src="/images.png" alt="Logo" class="w-10 h-10 object-contain" />
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
        <p class="text-gray-500 mt-2 text-sm font-medium">Sign in to your dashboard</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-xs font-bold mb-2" for="email">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            type="text"
            placeholder="info@wrappixel.com"
          >
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-xs font-bold mb-2" for="password">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            type="password"
            placeholder="•••••••"
          >
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
          {{ error }}
        </div>

        <div class="flex items-center justify-between mb-8">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <span class="ml-2 text-xs text-gray-500">Remember this Device</span>
          </label>
          <NuxtLink to="/forgot-password" class="inline-block align-baseline font-medium text-xs text-blue-500 hover:text-blue-800">
            Forgot Password ?
          </NuxtLink>
        </div>

        <button class="bg-[#0085db] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full w-full focus:outline-none focus:shadow-outline transition duration-300 shadow-md" type="submit">
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<style>
/* Additional custom styles if needed */
body {
  font-family: 'Inter', sans-serif;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

.animate-float {
  animation: float infinite ease-in-out;
}
</style>
