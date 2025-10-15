<template>
  <form @submit.prevent="onSubmit" class="card" style="max-width:520px;margin:auto">
    <h2>Login</h2>

    <label>Email
      <input v-model="email" type="email" autocomplete="email" />
    </label>

    <label>Password
      <input v-model="password" type="password" autocomplete="current-password" />
    </label>

    <button type="submit" class="btn primary">
      Login
    </button>

    <button type="button" class="btn outline" @click="loginGoogle">
      Continue with Google
    </button>

    <p v-if="err" class="error">{{ err }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const store = useAuthStore()

const email = ref('')
const password = ref('')
const err = ref('')

async function onSubmit() {
  err.value = ''
  try {
    await store.login(email.value, password.value)
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/dashboard'
    router.push(redirect)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    err.value = msg
  }
}

async function loginGoogle() {
  err.value = ''
  try {
    await store.loginWithGoogle()
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/dashboard'
    router.push(redirect)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    err.value = msg
  }
}
</script>

<style scoped>
.card { max-width: 480px; margin: 32px auto; display: grid; gap: 8px; }
label { display: grid; gap: 4px; font-weight: 600; }
input { padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; }

.btn { display:inline-block; padding:10px 14px; border-radius:8px; font-weight:600; cursor:pointer; }
.btn.primary { border:0; background:#2563eb; color:#fff; }
.btn.outline { border:1px solid #cbd5e1; background:#fff; color:#111827; }
.btn.outline:hover { background:#f8fafc; }

.error { color:#b42318; font-size:13px; margin: 6px 0 0; }
</style>