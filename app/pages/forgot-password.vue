<script setup>
import { Rocket } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const handleForgotPassword = () => {
  // Logic to handle password reset
  console.log('Forgot password submit')
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#ecf5fb] relative overflow-hidden font-sans p-4">
    <div class="absolute top-0 right-0 w-96 h-96 bg-[#3dd5f3] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 transform rotate-45 pointer-events-none" />
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-[#ffa48d] rounded-full blur-[100px] opacity-30 -ml-20 -mb-20 pointer-events-none" />

    <div class="bg-white p-8 sm:p-10 rounded-3xl shadow-lg w-full max-w-[450px] relative z-10 border border-gray-100 text-center">
      <div class="flex items-center justify-center mb-6">
        <div class="w-12 h-12 bg-[#e0f2fe] rounded-xl flex items-center justify-center shadow-sm">
           <img src="/images.png" alt="Logo" class="w-8 h-8 object-contain" />
        </div>
      </div>
      
      <h1 class="text-2xl font-bold text-[#1e293b] mb-2">
        USSD ADMIN
      </h1>

      <p class="text-gray-500 text-sm mb-8 leading-relaxed">
        Please enter the email address associated with your account and we will email you a link to reset your password.
      </p>

      <form @submit.prevent="handleForgotPassword">
        <div class="mb-6 text-left">
          <label class="block text-gray-700 text-xs font-bold mb-2" for="email">
            Email Address
          </label>
          <input
            id="email"
            class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            type="email"
          >
        </div>

        <button class="bg-[#0085db] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full w-full focus:outline-none focus:shadow-outline transition duration-300 shadow-md mb-4" type="submit">
          Forgot Password
        </button>

        <NuxtLink to="/login" class="block w-full bg-[#ecf5fb] hover:bg-blue-100 text-[#0085db] font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300">
          Back To Login
        </NuxtLink>
      </form>
    </div>
  </div>
</template>
