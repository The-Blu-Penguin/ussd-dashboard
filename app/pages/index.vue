<script setup lang="ts">
import { DEFAULT_LOGIN_REDIRECT } from '~/constants/userRoles'

// Root route — forward straight to the default dashboard view.
// The global auth middleware handles unauthenticated visitors (→ /login).
await navigateTo(DEFAULT_LOGIN_REDIRECT, { replace: true })
</script>

<template>
  <div></div>
</template>
