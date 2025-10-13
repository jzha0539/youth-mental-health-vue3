<template>
  <form class="card" @submit.prevent="submit">
    <h2>Login</h2>

    <label>Email
      <input v-model="email" type="email" autocomplete="email" />
    </label>

    <label>Password
      <input v-model="password" type="password" autocomplete="current-password" />
    </label>

    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Signing in...' : 'Login' }}
    </button>

    <p v-if="serverError" class="err">{{ serverError }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const serverError = ref('')
const submitting = ref(false)

async function submit () {
  serverError.value = ''
  submitting.value = true
  try {
    await auth.loginEmail(email.value, password.value) 
    router.push('/dashboard')
  } catch (e) {
    serverError.value = e?.message ?? String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card { max-width: 480px; margin: 32px auto; display: grid; gap: 8px; }
label { display: grid; gap: 4px; font-weight: 600; }
input { padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; }
button { margin-top: 8px; padding: 10px 14px; border: 0; border-radius: 8px; background:#2563eb; color:#fff; font-weight:600; cursor:pointer; }
button[disabled] { opacity: .6; cursor: not-allowed; }
.err { color:#b42318; font-size: 13px; margin: 0; }
</style>