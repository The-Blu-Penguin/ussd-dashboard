<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import AuthNotification from '~/components/ui/AuthNotification.vue'
import { useToast } from '~/composables/useToast'
import { validateEmailWithError } from '~/utils/validation'

definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()
const toast = useToast()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showSuccessModal = ref(false)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  if (!email.value) {
    error.value = 'Email is required'
    loading.value = false
    return
  }
  
  const emailValidation = validateEmailWithError(email.value)
  if (!emailValidation.valid) {
    error.value = emailValidation.error || 'Invalid email'
    loading.value = false
    return
  }
  
  if (!password.value) {
    error.value = 'Password is required'
    loading.value = false
    return
  }

  const result = await login(email.value, password.value)

  if (result.success) {
    showSuccessModal.value = true
    setTimeout(() => {
      navigateTo('/live-sessions')
    }, 1500)
  } else {
    error.value = result.message || 'Login failed'
    toast.error(error.value)
    loading.value = false
  }
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

  const vw = window.innerWidth
  const vh = window.innerHeight

  const currentX = (char.left / 100) * vw
  const currentY = (char.top / 100) * vh

  const mouseX = event.clientX
  const mouseY = event.clientY

  const dx = currentX - mouseX
  const dy = currentY - mouseY
  const distance = Math.sqrt(dx * dx + dy * dy)

  const radius = 200

  if (distance < radius) {
    const angle = Math.atan2(dy, dx)

    const moveDistance = 100
    const moveX = Math.cos(angle) * moveDistance
    const moveY = Math.sin(angle) * moveDistance

    const newLeft = ((currentX + moveX) / vw) * 100
    const newTop = ((currentY + moveY) / vh) * 100

    char.left = Math.max(0, Math.min(100, newLeft))
    char.top = Math.max(0, Math.min(100, newTop))
  }
}

onMounted(() => {
  // Only initialize if array is empty to prevent duplicates on remount
  if (floatingChars.value.length === 0) {
    for (let i = 0; i < 20; i++) {
      floatingChars.value.push({
        char: ussdChars[Math.floor(Math.random() * ussdChars.length)] ?? '*',
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 60 + 40, // Increased size: minimum 40px, up to 100px
        duration: Math.random() * 10 + 5,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }
  }
})

onUnmounted(() => {
  // Clean up floating characters array
  floatingChars.value = []
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-vibes-900 via-vibes-800 to-indigo-900 relative overflow-hidden p-4">
    <!-- Success Notification -->
    <AuthNotification 
      :show="showSuccessModal" 
      message="Login Successful!" 
      type="success" 
    />

    <!-- Floating USSD characters -->
    <div
      v-for="(char, index) in floatingChars"
      :key="index"
      class="absolute text-vibes-400 select-none pointer-events-none animate-float"
      :style="{
        left: `${char.left}%`,
        top: `${char.top}%`,
        fontSize: `${char.size}px`,
        opacity: char.opacity,
        animationDuration: `${char.duration}s`,
        animationDelay: `${char.delay}s`,
      }"
      @mouseenter="moveAway(index, $event)"
    >
      {{ char.char }}
    </div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo & Title -->
      <div class="text-center mb-8 flex flex-col items-center">
        <div class="mb-6 bg-white p-3 rounded-2xl shadow-xl w-32 h-32 flex items-center justify-center">
          <img src="/images.png" alt="Blupay Logo" class="w-full h-auto object-contain" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p class="text-vibes-200">Sign in to your account</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-blue-100 mb-2">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-vibes-200/50 focus:outline-none focus:ring-2 focus:ring-vibes-400 focus:border-transparent transition-all"
              placeholder="admin@vibes.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-blue-100 mb-2">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-vibes-200/50 focus:outline-none focus:ring-2 focus:ring-vibes-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="togglePassword"
              >
                <!-- Eye icon (show password) -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="eye-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.578-3.007-9.964-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Eye-off icon (hide password) -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="eye-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            class="w-full"
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 text-center">
          <a href="#" class="text-sm text-vibes-200 hover:text-white transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.password-toggle-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(255, 255, 255, 0.1);
}

.password-toggle-btn:focus {
  outline: none;
  color: rgba(255, 255, 255, 0.9);
}

.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
