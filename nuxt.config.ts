// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api', // This MUST be /api for the proxy to work
    },
  },
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: process.env.API_TARGET_URL ? `${process.env.API_TARGET_URL}/**` : 'https://ussd.blupayafrica.com/api/v1/**',
      },
    },
  },
})